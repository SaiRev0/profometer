// src/app/api/review/public-key/route.ts
import { NextResponse } from 'next/server';

import { getPublicKey } from '@/lib/crypto/keys';
import { getPublicKeyComponents } from '@/lib/crypto/server-crypto';

/**
 * GET /api/review/public-key
 *
 * Returns the server's RSA public key for encrypting anonymous review content.
 * This endpoint is public - no authentication required.
 */
export async function GET() {
  try {
    const publicKeyPem = getPublicKey();
    const { n, e } = getPublicKeyComponents();

    return NextResponse.json({
      publicKeyPem,
      publicKeyN: n,
      publicKeyE: e
    });
  } catch (error) {
    console.error('Failed to get public key:', error);
    return NextResponse.json({ error: 'Public key not configured' }, { status: 500 });
  }
}
