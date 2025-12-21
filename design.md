# Engineering Design Document: Anonymous Review System

**Version:** 4.0 (Final)
**Target Stack:** Next.js (Vercel), PostgreSQL (Neon/Supabase), Google Auth
**Security Level:** Maximum (Resistant to Admin/Database Compromise)

## 1\. Executive Summary

The system enables students to submit reviews for professors with **cryptographic anonymity**. The architecture guarantees that no database administrator, developer, or network observer can link a specific student to a specific review, even with full access to the production database and server private keys.

This is achieved via **Bulk Blind Signatures** (to hide intent and identity) and **Client-Side Hybrid Encryption** with **Lazy Shuffling** (to hide content and timing).

---

## 2\. Cryptographic Standards

All implementations must adhere strictly to these algorithms.

| Component               | Algorithm / Standard                                             | Purpose                                                      |
| :---------------------- | :--------------------------------------------------------------- | :----------------------------------------------------------- |
| **Signing**             | **RSA-2048** (or 4096) with **Blind Signature Scheme** (Chaum's) | Server authorizing a token without seeing it.                |
| **Payload Encryption**  | **AES-256-GCM**                                                  | Encrypting the actual review text (High speed).              |
| **Key Encapsulation**   | **RSA-OAEP** (2048 bit)                                          | Encrypting the AES key so only the server can open it later. |
| **Hashing**             | **SHA-256**                                                      | Hashing user emails for the Cycle Log.                       |
| **Randomness**          | `crypto.getRandomValues()` (Web Crypto API)                      | Generating UUIDs and AES keys on the client.                 |
| **Password Encryption** | **Argon2 + AES-256-GCM**                                         | Encrypting token backup files with user password.            |

### Library Choices

| Component               | Library                                | Rationale                                |
| :---------------------- | :------------------------------------- | :--------------------------------------- |
| **Client-Side AES**     | Native `SubtleCrypto` (Web Crypto API) | Browser-native, audited, no dependencies |
| **Client-Side RSA**     | Native `SubtleCrypto` (Web Crypto API) | Browser-native, audited, no dependencies |
| **Client Randomness**   | `crypto.getRandomValues()`             | Browser-native CSPRNG                    |
| **Server-Side RSA**     | `node:crypto` (Node.js built-in)       | No external dependencies, well-audited   |
| **Password Encryption** | `@noble/ciphers` with Argon2           | Modern, audited, minimal attack surface  |

---

## 3\. System Concepts: The "Cycle"

To balance anonymity with spam prevention, the system operates on **2-Month Cycles**.

- **Format:** `YYYY_MM_CYCLE_ID` (e.g., `2025_01_A`, `2025_03_B`).
- **Rule:** A student can claim exactly **one** batch of tickets per cycle.
- **Expiration:** Tokens generated for `Cycle A` are rejected if submitted during `Cycle B` (optional grace period notwithstanding).

---

## 4\. Database Schema (PostgreSQL)

### Using the Existing Review Table

_Purpose: Anonymous reviews are stored in the existing `Review` table with `userId = NULL` and `cycleId` set to the review cycle ID. This unifies anonymous and authenticated reviews in a single table._

**Key fields for anonymous reviews:**

- `userId`: NULL (indicates anonymous review)
- `cycleId`: Set to the cycle ID (e.g., '2025_JAN_FEB')
- `anonymous`: TRUE
- All other fields (ratings, comment, professorId, courseCode, etc.) work the same

### Table 1: `user_cycle_logs`

_Purpose: Tracks if a user has already claimed their "Book of Tickets" for the current cycle. Does NOT track which professors they like._

```sql
CREATE TABLE user_cycle_logs (
    user_hash VARCHAR(64) NOT NULL, -- SHA-256(email + SERVER_SECRET)
    cycle_id VARCHAR(20) NOT NULL,  -- e.g., '2025_JAN_FEB'
    claimed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_hash, cycle_id)
);
```

### Table 2: `used_tokens`

_Purpose: Prevents "Double Spending" (Replay Attacks). Keeps the system unique._

```sql
CREATE TABLE used_tokens (
    token_uuid UUID PRIMARY KEY,    -- The Random ID inside the ticket
    cycle_id VARCHAR(20) NOT NULL,
    prof_id VARCHAR(50) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW()
    -- No user_id link here. Purely checking the ticket itself.
);
```

### Table 3: `pending_reviews` (The Black Box)

_Purpose: A holding area for reviews that have been received but NOT yet shuffled/published. Content is unreadable here._

```sql
CREATE TABLE pending_reviews (
    id SERIAL PRIMARY KEY,
    prof_id VARCHAR(50) NOT NULL,
    encrypted_blob TEXT NOT NULL,   -- AES-256 Encrypted Review
    encrypted_key TEXT NOT NULL,    -- RSA Encrypted AES Key
    cycle_id VARCHAR(20) NOT NULL,
    received_at TIMESTAMP DEFAULT NOW()
);
```

### Table 4: `system_config`

_Purpose: Tracks the state of the "Lazy Shuffle"._

```sql
CREATE TABLE system_config (
    key VARCHAR(50) PRIMARY KEY,    -- 'scheduler'
    last_shuffle_time TIMESTAMP
);
```

---

## 5\. Detailed Implementation Flow

### Phase 1: Bulk Blind Issuance (The "Masking" Phase)

_Trigger: User Login._

1.  **Client-Side Preparation:**
    - Client fetches the list of all **All Active Professor IDs**.
    - Client determines the **Current Cycle** (e.g., `2025_JAN_FEB`).
    - **Loop:** For _every_ Professor ID, the Client:
      1.  Generates a `Ticket_UUID` (Random GUID).
      2.  Constructs a string: `RAW_TOKEN = Ticket_UUID || PROF_ID || CYCLE_ID`.
      3.  **Blinds** this string using the Server's Public RSA Key (math operation: `m * r^e mod N`).
    - Client sends the array of all `Blinded_Tokens` to `/api/auth/claim-batch`.

2.  **Server-Side Processing:**
    - **Auth Check:** Verifies Google Session.
    - **Cycle Check:** Hashes user email: `Hash = SHA256(email + SECRET)`. Checks `user_cycle_logs` for `(Hash, Current_Cycle)`.
    - **Rejection:** If entry exists, return 403 (Already claimed).
    - **Signing:** If new:
      1.  Server signs **all** blinded items using Server Private Key.
      2.  Server inserts into `user_cycle_logs`.
    - **Response:** Returns all `Blinded_Signatures`.

3.  **Client-Side Storage:**
    - Client **Unblinds** the signatures to get valid RSA signatures.
    - Client stores the pairs (`Ticket_UUID`, `Signature`) in IndexedDB, mapped by Professor ID.

---

### Phase 2: The Sealed Submission (The "Drop" Phase)

_Trigger: User clicks "Submit Review"._

1.  **Client Encryption (Hybrid):**
    - Client generates a random **32-byte Session Key** (AES-Key).
    - **Layer 1 (Data):** Encrypts the Review JSON (`text`, `rating`) using **AES-256-GCM** with the Session Key. -\> `Encrypted_Blob`.
    - **Layer 2 (Key):** Encrypts the Session Key using the Server's **Public RSA Key**. -\> `Encrypted_Key_Envelope`.

    > **Note:** Timestamps are intentionally omitted from the encrypted payload. Even after shuffling, timestamps could potentially be used for correlation attacks by matching submission times to user activity patterns.

2.  **Payload Assembly:**
    - `Ticket_UUID` (The unblinded ID)
    - `Signature` (The valid unblinded signature)
    - `Encrypted_Blob`
    - `Encrypted_Key_Envelope`
    - `Prof_ID`

3.  **Server Verification:**
    - **Crypto Check:** Verifies that `Signature` is a valid signature of `Ticket_UUID || PROF_ID || CYCLE_ID`.
    - **Replay Check:** Queries `used_tokens`. If `Ticket_UUID` exists, Reject.
    - **Burn:** Inserts `Ticket_UUID` into `used_tokens`.
    - **Storage:** Inserts `Encrypted_Blob` and `Encrypted_Key_Envelope` into `pending_reviews`.
    - _Note: Server DOES NOT decrypt yet._

---

### Phase 3: The Lazy Shuffle (The "Mix" Phase)

_Trigger: Any GET request to public reviews._

1.  **Shuffle Conditions:**

    ```
    SHUFFLE_CONDITIONS:
    - Minimum reviews threshold: 5 reviews
    - Maximum wait time: 24 hours
    - Normal check interval: 1 hour

    Logic:
    - If (time since last shuffle >= 24 hours): FORCE shuffle regardless of count
    - If (time since last shuffle >= 1 hour AND pending count >= 5): shuffle
    - Otherwise: wait
    ```

2.  **Check Trigger:**
    - Fetch `last_shuffle_time` from `system_config`.
    - Fetch `pending_count` from `pending_reviews`.
    - Apply shuffle conditions above.

3.  **Execution (If conditions met):**
    - **Fetch:** `SELECT * FROM pending_reviews`.
    - **Shuffle:** Randomize array order in memory (Fisher-Yates).
    - **Decrypt Loop:**
      1.  Use **Server Private Key** to decrypt `Encrypted_Key_Envelope` -\> Get `AES_Key`.
      2.  Use `AES_Key` to decrypt `Encrypted_Blob` -\> Get JSON (`text`, `rating`).
    - **Publish:** Batch insert into `public_reviews` (setting `published_at` to NOW).
    - **Cleanup:** `DELETE FROM pending_reviews`.
    - **Reset:** Update `system_config` timestamp.

---

### Phase 1.5: Token Backup (Client-Side)

_Trigger: After successful token claiming in Phase 1._

This phase addresses the fragility of IndexedDB storage (browser clears, device changes, etc.).

1.  **Backup Prompt:**
    - After tokens are stored in IndexedDB, prompt user to download encrypted backup.
    - UI: "Your anonymous review tokens have been created. Download a backup to use on other devices or if your browser data is cleared."

2.  **Encryption Process:**
    - User provides a password (minimum 8 characters recommended).
    - Derive encryption key using **Argon2id** (memory-hard KDF).
    - Encrypt token data using **AES-256-GCM** with derived key.
    - Package with salt and IV for decryption.

3.  **File Format:**
    - Filename: `profometer-tokens-{cycleId}.enc`
    - Content: Base64-encoded encrypted blob containing:
      - Salt (for Argon2)
      - IV (for AES-GCM)
      - Encrypted token map (profId → {uuid, signature})

4.  **Import Functionality:**
    - User selects backup file and enters password.
    - Derive key from password + stored salt.
    - Decrypt and validate token structure.
    - Store tokens in IndexedDB (merge or replace based on cycle).

5.  **Security Properties:**
    - Password never stored or transmitted.
    - Argon2 provides brute-force resistance.
    - AES-GCM provides authenticated encryption.
    - Without password, backup file is cryptographically useless.

---

## 6\. Security Analysis (The "God Mode" Test)

| Threat                            | Outcome                            | Why?                                                                                                                                                                                                      |
| :-------------------------------- | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Admin steals Private Key**      | Can decrypt `pending_reviews`.     | Yes, they can see the text. **BUT** they cannot link it to a user, because the signature verification only checks the _Blind_ signature, which effectively erases the link to the user's initial request. |
| **Admin reads `user_cycle_logs`** | Sees User X claimed a batch.       | This only proves User X _exists_ and is active this cycle. It does not indicate which professor they reviewed.                                                                                            |
| **Admin reads `used_tokens`**     | Sees Ticket UUID `abc-123`.        | This UUID was generated on the User's client. It never appeared in the `user_cycle_logs`. There is no foreign key linking these tables.                                                                   |
| **Timing Attack**                 | Matches login time to review time. | **Failed.** Login happens weeks before review (Phase 1). Submission happens randomly (Phase 2). Publication happens in a batch (Phase 3).                                                                 |

## 7\. Implementation Checklist

1.  **Postgres Setup:** Create the 4 anonymous review tables listed above (Review table already exists).
2.  **Key Generation:** Generate RSA Keypair. Store Private Key in Environment Variables (`ANON_REVIEW_PRIVATE_KEY`). Store Public Key in a public JSON endpoint or build config.
3.  **Library Installation:**
    - `node:crypto` (Server-side RSA signing/decryption - Node.js built-in)
    - Native `SubtleCrypto` (Client-side AES and RSA - Web Crypto API, no install needed)
    - `@noble/ciphers` (Password-based encryption for token backup)
    - `idb` (IndexedDB wrapper for cleaner async token storage)
    - `prisma` (Database ORM)
4.  **Cron Replacement:** Implement the "Lazy Shuffle" logic inside your main `GET /api/reviews` route.

---

## 8\. Legal Defense Architecture

This section documents why user identification is **cryptographically impossible**, providing a technical defense against legal requests for user data.

### Why User Identification is Impossible

| Data Available           | What It Proves              | Can Identify User?                             |
| :----------------------- | :-------------------------- | :--------------------------------------------- |
| `user_cycle_logs` hash   | User X was active in cycle  | ❌ No - doesn't link to any review             |
| `used_tokens` UUID       | A token was spent           | ❌ No - UUID was client-generated              |
| `public_reviews` content | Review exists               | ❌ No - no user reference                      |
| Server private key       | Can decrypt pending reviews | ❌ No - still can't link to user               |
| Server logs              | Nothing relevant            | ❌ No - anonymous endpoints don't log user IDs |

### Key Architectural Guarantees

1.  **Blind Signature Protocol:** The server signs tokens without ever seeing the token content. The mathematical "blinding" operation erases any correlation between the signing request and the final token.

2.  **No Correlation Data Exists:** There is no database table, log entry, or data structure that links a user identity to a review. This is not a policy choice—it's a mathematical impossibility given the architecture.

3.  **Even With Full Access:** An attacker with complete database access AND the server private key can:
    - See that User X claimed tokens (but not which professors)
    - See that Token Y was used for Professor Z (but not who owned it)
    - Decrypt pending reviews (but not link them to users)

    The blind signature protocol ensures these two datasets cannot be joined.

### Compliance Statement

To identify a specific reviewer, an investigator would need **all** of the following:

1.  Physical access to the user's device
2.  The user's token backup file (if exported)
3.  The user's backup file password
4.  The user's IndexedDB data (before browser clear)

**The server cannot provide any of these.** The architecture is designed so that the server genuinely does not possess the information required to identify reviewers, making it impossible to comply with requests for such data.

### Audit Trail

For transparency, the system can provide:

- Total number of reviews submitted per cycle
- Total number of users who claimed tokens per cycle
- Aggregate statistics (average ratings, etc.)

It **cannot** provide:

- Which user wrote which review
- Which professors a specific user reviewed
- The identity behind any specific review
