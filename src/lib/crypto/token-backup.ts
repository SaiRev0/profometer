// src/lib/crypto/token-backup.ts
'use client';

import type { ReviewToken } from './client-crypto';
import { getAllTokens, saveTokens } from './token-store';

/**
 * Encrypt data using password-based AES-256-GCM.
 * Uses PBKDF2 for key derivation.
 */
async function encryptWithPassword(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password using PBKDF2
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data));

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt password-protected data.
 */
async function decryptWithPassword(encryptedData: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Decode base64
  const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

  // Extract salt, iv, and ciphertext
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // Decrypt
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

  return decoder.decode(decrypted);
}

/**
 * Export all tokens as an encrypted backup file.
 */
export async function exportTokens(password: string): Promise<Blob> {
  const tokens = await getAllTokens();

  if (tokens.length === 0) {
    throw new Error('No tokens to export');
  }

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tokenCount: tokens.length,
    tokens
  };

  const encrypted = await encryptWithPassword(JSON.stringify(exportData), password);

  return new Blob([encrypted], { type: 'application/octet-stream' });
}

/**
 * Import tokens from an encrypted backup file.
 */
export async function importTokens(file: File, password: string): Promise<number> {
  const encryptedData = await file.text();

  let exportData;
  try {
    const decrypted = await decryptWithPassword(encryptedData, password);
    exportData = JSON.parse(decrypted);
  } catch {
    throw new Error('Invalid password or corrupted backup file');
  }

  if (!exportData.tokens || !Array.isArray(exportData.tokens)) {
    throw new Error('Invalid backup file format');
  }

  // Validate tokens have required fields
  const validTokens = exportData.tokens.filter((t: ReviewToken) => t.tokenUuid && t.profId && t.cycleId && t.signature);

  if (validTokens.length === 0) {
    throw new Error('No valid tokens found in backup');
  }

  await saveTokens(validTokens);

  return validTokens.length;
}

/**
 * Download the token backup file.
 */
export async function downloadTokenBackup(password: string, cycleId: string): Promise<void> {
  const blob = await exportTokens(password);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `profometer-tokens-${cycleId}.enc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
