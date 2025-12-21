// src/lib/crypto/client-crypto.ts
'use client';

/**
 * Client-side cryptographic utilities for anonymous reviews.
 * Uses Web Crypto API (SubtleCrypto) for browser-native, secure operations.
 */

// BigInt utilities for blind signature math
function base64ToBigInt(b64: string): bigint {
  const binary = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  let hex = '';
  for (let i = 0; i < binary.length; i++) {
    hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return BigInt('0x' + hex);
}

function bigIntToBase64(n: bigint): string {
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return btoa(String.fromCharCode(...bytes));
}

// Modular exponentiation for BigInt
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

// Extended Euclidean Algorithm for modular inverse
function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];

  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }

  return ((old_s % m) + m) % m;
}

/**
 * Generate a cryptographically secure random UUID.
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate a random blinding factor for the blind signature protocol.
 */
export function generateBlindingFactor(n: bigint): bigint {
  // Generate random bytes
  const bytes = new Uint8Array(256); // 2048 bits
  crypto.getRandomValues(bytes);

  let r = 0n;
  for (const byte of bytes) {
    r = (r << 8n) + BigInt(byte);
  }

  // Ensure r is coprime with n (for simplicity, just make it odd and less than n)
  r = r % n;
  if (r % 2n === 0n) r += 1n;

  return r;
}

/**
 * Blind a message using RSA blinding.
 * m' = m * r^e mod n
 */
export async function blindMessage(
  message: string,
  publicKeyN: string,
  publicKeyE: string
): Promise<{ blindedMessage: string; blindingFactor: string }> {
  // Convert public key components from base64url to BigInt
  const n = base64ToBigInt(publicKeyN);
  const e = base64ToBigInt(publicKeyE);

  // Hash the message
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', messageBytes);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert hash to BigInt
  let m = 0n;
  for (const byte of hashArray) {
    m = (m << 8n) + BigInt(byte);
  }

  // Generate blinding factor
  const r = generateBlindingFactor(n);

  // Blind the message: m' = m * r^e mod n
  const rE = modPow(r, e, n);
  const blindedM = (m * rE) % n;

  return {
    blindedMessage: bigIntToBase64(blindedM),
    blindingFactor: bigIntToBase64(r)
  };
}

/**
 * Unblind a signature.
 * s = s' * r^(-1) mod n
 */
export function unblindSignature(blindedSignature: string, blindingFactor: string, publicKeyN: string): string {
  const n = base64ToBigInt(publicKeyN);
  const sPrime = base64ToBigInt(blindedSignature);
  const r = base64ToBigInt(blindingFactor);

  // Calculate r^(-1) mod n
  const rInverse = modInverse(r, n);

  // Unblind: s = s' * r^(-1) mod n
  const s = (sPrime * rInverse) % n;

  return bigIntToBase64(s);
}

/**
 * Generate a random 256-bit AES key.
 */
export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with AES-256-GCM.
 * Returns: base64(iv + authTag + ciphertext)
 */
export async function encryptAESGCM(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBytes);

  // Extract auth tag (last 16 bytes) and ciphertext
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, -16);
  const authTag = encryptedArray.slice(-16);

  // Combine: iv + authTag + ciphertext
  const combined = new Uint8Array(12 + 16 + ciphertext.length);
  combined.set(iv, 0);
  combined.set(authTag, 12);
  combined.set(ciphertext, 28);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Export AES key as raw bytes.
 */
export async function exportAESKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('raw', key);
}

/**
 * Encrypt the AES key with RSA-OAEP (public key encryption).
 */
export async function encryptAESKeyWithRSA(aesKeyBytes: ArrayBuffer, rsaPublicKeyPem: string): Promise<string> {
  // Import the RSA public key
  const pemContent = rsaPublicKeyPem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const rsaKey = await crypto.subtle.importKey('spki', binaryKey, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, [
    'encrypt'
  ]);

  // Encrypt the AES key
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKey, aesKeyBytes);

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

/**
 * Token data structure stored in IndexedDB.
 */
export interface ReviewToken {
  tokenUuid: string;
  profId: string;
  cycleId: string;
  signature: string;
  blindingFactor: string;
  createdAt: string;
  used: boolean;
}
