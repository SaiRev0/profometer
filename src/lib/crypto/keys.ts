/**
 * Loads the anonymous review RSA keys from environment variables.
 * Keys are stored as base64-encoded PEM strings.
 */

export function getPrivateKey(): string {
  const encoded = process.env.ANON_REVIEW_PRIVATE_KEY;
  if (!encoded) {
    throw new Error('ANON_REVIEW_PRIVATE_KEY not configured');
  }
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export function getPublicKey(): string {
  const encoded = process.env.ANON_REVIEW_PUBLIC_KEY;
  if (!encoded) {
    throw new Error('ANON_REVIEW_PUBLIC_KEY not configured');
  }
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export function getHashSecret(): string {
  const secret = process.env.ANON_REVIEW_HASH_SECRET;
  if (!secret) {
    throw new Error('ANON_REVIEW_HASH_SECRET not configured');
  }
  return secret;
}

export function getCurrentCycle(): string {
  // Default to current 2-month cycle
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const cycleMonth =
    month <= 2 ? '01' : month <= 4 ? '03' : month <= 6 ? '05' : month <= 8 ? '07' : month <= 10 ? '09' : '11';
  return `${year}_${cycleMonth}_A`;
}
