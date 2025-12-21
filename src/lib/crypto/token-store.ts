// src/lib/crypto/token-store.ts
'use client';

import type { ReviewToken } from './client-crypto';

const DB_NAME = 'anon-review-tokens';
const DB_VERSION = 1;
const STORE_NAME = 'tokens';

/**
 * Initialize the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'tokenUuid' });
        store.createIndex('profId', 'profId', { unique: false });
        store.createIndex('cycleId', 'cycleId', { unique: false });
        store.createIndex('profId_cycleId', ['profId', 'cycleId'], { unique: true });
      }
    };
  });
}

/**
 * Save a token to IndexedDB.
 */
export async function saveToken(token: ReviewToken): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(token);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    tx.oncomplete = () => db.close();
  });
}

/**
 * Save multiple tokens at once.
 */
export async function saveTokens(tokens: ReviewToken[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const token of tokens) {
      store.put(token);
    }

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

/**
 * Get a token for a specific professor and cycle.
 */
export async function getToken(profId: string, cycleId: string): Promise<ReviewToken | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('profId_cycleId');
    const request = index.get([profId, cycleId]);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);

    tx.oncomplete = () => db.close();
  });
}

/**
 * Get all tokens for a specific cycle.
 */
export async function getTokensByCycle(cycleId: string): Promise<ReviewToken[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('cycleId');
    const request = index.getAll(cycleId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);

    tx.oncomplete = () => db.close();
  });
}

/**
 * Get all tokens.
 */
export async function getAllTokens(): Promise<ReviewToken[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);

    tx.oncomplete = () => db.close();
  });
}

/**
 * Mark a token as used.
 */
export async function markTokenUsed(tokenUuid: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const getRequest = store.get(tokenUuid);

    getRequest.onsuccess = () => {
      const token = getRequest.result;
      if (token) {
        token.used = true;
        store.put(token);
      }
    };

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

/**
 * Delete all tokens for a specific cycle.
 */
export async function deleteTokensByCycle(cycleId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('cycleId');
    const request = index.openCursor(cycleId);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

/**
 * Check if tokens exist for a cycle.
 */
export async function hasTokensForCycle(cycleId: string): Promise<boolean> {
  const tokens = await getTokensByCycle(cycleId);
  return tokens.length > 0;
}

/**
 * Get count of unused tokens for a cycle.
 */
export async function getUnusedTokenCount(cycleId: string): Promise<number> {
  const tokens = await getTokensByCycle(cycleId);
  return tokens.filter((t) => !t.used).length;
}
