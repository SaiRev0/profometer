// src/app/api/review/status/route.ts
import { NextResponse } from 'next/server';

import { getCurrentCycle } from '@/lib/crypto/keys';
import { getShuffleStatus, tryLazyShuffle } from '@/lib/crypto/shuffle';

/**
 * GET /api/review/status
 *
 * Returns the current status of the anonymous review system.
 * Useful for debugging and monitoring.
 */
export async function GET() {
  try {
    const cycleId = getCurrentCycle();
    const shuffleStatus = await getShuffleStatus();

    return NextResponse.json({
      cycleId,
      shuffle: shuffleStatus
    });
  } catch (error) {
    console.error('Failed to get review status:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

/**
 * POST /api/review/status
 *
 * Manually trigger a shuffle attempt (for admin/testing).
 */
export async function POST() {
  try {
    const result = await tryLazyShuffle();

    return NextResponse.json({
      cycleId: getCurrentCycle(),
      shuffleResult: result
    });
  } catch (error) {
    console.error('Failed to trigger shuffle:', error);
    return NextResponse.json({ error: 'Failed to trigger shuffle' }, { status: 500 });
  }
}
