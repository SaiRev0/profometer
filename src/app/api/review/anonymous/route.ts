// src/app/api/review/anonymous/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentCycle } from '@/lib/crypto/keys';
import { verifySignature } from '@/lib/crypto/server-crypto';
import type { AnonymousReviewSubmission } from '@/lib/crypto/types';
import { db } from '@/lib/db';

/**
 * Anonymous Review Submission Endpoint
 *
 * This endpoint receives encrypted anonymous reviews and stores them in the pending queue.
 * It does NOT require authentication - only validates the cryptographic token.
 *
 * Security guarantees:
 * - Verifies blind signature proves user had a valid token
 * - Checks token hasn't been used before (replay protection)
 * - Burns the token atomically with storing the review
 * - NO user session, NO IP logging, NO user linking
 * - Review content stays encrypted until shuffle phase
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body: AnonymousReviewSubmission = await request.json();
    console.log('Received anonymous review submission:', body);
    const { tokenUuid, signature, profId, cycleId, encryptedBlob, encryptedKey } = body;

    // 2. Validate required fields
    if (!tokenUuid || !signature || !profId || !cycleId || !encryptedBlob || !encryptedKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tokenUuid)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    // 4. Validate cycle (allow current cycle, optionally previous with grace period)
    const currentCycle = getCurrentCycle();
    if (cycleId !== currentCycle) {
      // Could implement grace period logic here for cycle transitions
      // For now, strictly enforce current cycle
      return NextResponse.json({ error: 'Invalid or expired cycle' }, { status: 400 });
    }

    // 5. Reconstruct the original message and verify signature
    // The message format must match what was signed during token claim
    const message = `${tokenUuid}||${profId}||${cycleId}`;
    const isValid = verifySignature(message, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token signature' }, { status: 403 });
    }

    // 6. Check if professor exists
    const professor = await db.professor.findUnique({
      where: { id: profId },
      select: { id: true }
    });

    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // 7. Check if token has already been used (replay protection)
    const existingToken = await db.usedToken.findUnique({
      where: { tokenUuid }
    });

    if (existingToken) {
      return NextResponse.json({ error: 'Token has already been used' }, { status: 409 });
    }

    // 8. Use transaction to burn token and store review atomically
    // This ensures either both operations succeed or both fail
    await db.$transaction([
      // Burn the token - prevents replay attacks
      db.usedToken.create({
        data: {
          tokenUuid,
          cycleId,
          profId
        }
      }),
      // Store encrypted review in pending queue
      // Content stays encrypted until shuffle phase decrypts and publishes it
      db.pendingReview.create({
        data: {
          profId,
          encryptedBlob,
          encryptedKey,
          cycleId
        }
      })
    ]);

    // 9. Return success with minimal information (no identifying data)
    return NextResponse.json({
      success: true,
      message: 'Review submitted anonymously'
    });
  } catch (error) {
    console.error('Anonymous review submission error:', error);

    // Don't leak error details that could help attackers
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
