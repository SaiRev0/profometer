// src/lib/crypto/server-crypto.ts
import { getHashSecret, getPrivateKey, getPublicKey } from './keys';
import crypto from 'crypto';

/**
 * Sign a blinded message using RSA blind signature scheme.
 * The server signs without knowing the actual message content.
 */
export function signBlindedMessage(blindedMessage: string): string {
  const privateKey = getPrivateKey();
  const blindedBuffer = Buffer.from(blindedMessage, 'base64');

  // RSA raw signature (no hashing - the client handles that)
  const signature = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_NO_PADDING
    },
    blindedBuffer
  );

  return signature.toString('base64');
}

/**
 * Verify an unblinded signature against the original message.
 */
export function verifySignature(message: string, signature: string): boolean {
  const publicKey = getPublicKey();
  const signatureBuffer = Buffer.from(signature, 'base64');
  const messageBuffer = Buffer.from(message);

  try {
    // RSA verify
    const decrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_NO_PADDING
      },
      signatureBuffer
    );

    // Compare the decrypted signature with the original message hash
    const messageHash = crypto.createHash('sha256').update(messageBuffer).digest();
    return decrypted.slice(-32).equals(messageHash);
  } catch {
    return false;
  }
}

/**
 * Hash a user email with the server secret for cycle log storage.
 * This is a one-way hash - cannot be reversed to get the email.
 */
export function hashUserEmail(email: string): string {
  const secret = getHashSecret();
  return crypto.createHmac('sha256', secret).update(email.toLowerCase()).digest('hex');
}

/**
 * Decrypt an RSA-OAEP encrypted AES key.
 */
export function decryptAESKey(encryptedKey: string): Buffer {
  const privateKey = getPrivateKey();
  const encryptedBuffer = Buffer.from(encryptedKey, 'base64');

  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    encryptedBuffer
  );
}

/**
 * Decrypt AES-256-GCM encrypted data.
 */
export function decryptAESGCM(encryptedData: string, key: Buffer): string {
  // Format: iv(12 bytes) + authTag(16 bytes) + ciphertext (all base64 encoded together)
  const data = Buffer.from(encryptedData, 'base64');

  const iv = data.slice(0, 12);
  const authTag = data.slice(12, 28);
  const ciphertext = data.slice(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf-8');
}

/**
 * Get RSA modulus and exponent for client-side blinding.
 * Returns the public key components needed for the blind signature protocol.
 */
export function getPublicKeyComponents(): { n: string; e: string } {
  const publicKey = getPublicKey();
  const keyObject = crypto.createPublicKey(publicKey);
  const keyDetails = keyObject.export({ format: 'jwk' }) as { n: string; e: string };

  return {
    n: keyDetails.n,
    e: keyDetails.e
  };
}
