// src/app/api/auth/claim-batch/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { getCurrentCycle } from '@/lib/crypto/keys';
import { getPublicKeyComponents, hashUserEmail, signBlindedMessage } from '@/lib/crypto/server-crypto';
import type { BlindedTokenResponse, ClaimBatchRequest, ClaimBatchResponse } from '@/lib/crypto/types';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

/**
 * POST /api/auth/claim-batch
 *
 * Bulk token claiming endpoint for the anonymous review system.
 * This endpoint:
 * 1. Verifies the user is authenticated (Google session)
 * 2. Checks if user has already claimed tokens this cycle (using user_cycle_logs)
 * 3. Signs ALL blinded tokens from the client without seeing their contents
 * 4. Records the claim in user_cycle_logs
 * 5. Returns the signed blinded tokens + public key components
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Parse request body
    const body: ClaimBatchRequest = await request.json();
    const { blindedTokens } = body;

    if (!blindedTokens || !Array.isArray(blindedTokens) || blindedTokens.length === 0) {
      return NextResponse.json({ error: 'Invalid request: blindedTokens array required' }, { status: 400 });
    }

    // Validate max tokens (400 = ~366 professors + some buffer)
    if (blindedTokens.length > 400) {
      return NextResponse.json({ error: 'Too many tokens requested (max 400)' }, { status: 400 });
    }

    // 3. Get current cycle
    const cycleId = getCurrentCycle();

    // 4. Hash user email for cycle log (privacy-preserving)
    const userHash = hashUserEmail(session.user.email);

    // 5. Check if user has already claimed this cycle
    const existingClaim = await db.userCycleLog.findUnique({
      where: {
        userHash_cycleId: {
          userHash,
          cycleId
        }
      }
    });

    if (existingClaim) {
      return NextResponse.json({ error: 'Already claimed tokens for this cycle' }, { status: 403 });
    }

    // 6. Sign all blinded tokens (server cannot see what's inside)
    const blindedSignatures: BlindedTokenResponse[] = blindedTokens.map((token) => {
      try {
        const blindedSignature = signBlindedMessage(token.blindedMessage);
        return {
          profId: token.profId,
          blindedSignature
        };
      } catch (error) {
        console.error(`Failed to sign token for prof ${token.profId}:`, error);
        throw new Error(`Signing failed for professor ${token.profId}`);
      }
    });

    // 7. Record the claim in user_cycle_logs
    await db.userCycleLog.create({
      data: {
        userHash,
        cycleId
      }
    });

    // 8. Get public key components for client-side unblinding
    const { n, e } = getPublicKeyComponents();

    // 9. Return response
    const response: ClaimBatchResponse = {
      cycleId,
      blindedSignatures,
      publicKeyN: n,
      publicKeyE: e
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Claim batch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/auth/claim-batch
 *
 * Check claim status and get public key components.
 * Used by the client to determine if tokens need to be claimed.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const cycleId = getCurrentCycle();
    const userHash = hashUserEmail(session.user.email);

    const existingClaim = await db.userCycleLog.findUnique({
      where: {
        userHash_cycleId: {
          userHash,
          cycleId
        }
      }
    });

    const { n, e } = getPublicKeyComponents();

    return NextResponse.json({
      cycleId,
      hasClaimed: !!existingClaim,
      claimedAt: existingClaim?.claimedAt || null,
      publicKeyN: n,
      publicKeyE: e
    });
  } catch (error) {
    console.error('Check claim status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
