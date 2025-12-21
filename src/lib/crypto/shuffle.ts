// src/lib/crypto/shuffle.ts
import { db } from '@/lib/db';
import { updateReviewStats } from '@/lib/review-stats';

import { decryptAESGCM, decryptAESKey } from './server-crypto';
import type { ReviewContent } from './types';

const SHUFFLE_CONFIG = {
  MIN_REVIEWS: 5, // Don't shuffle unless 5+ reviews pending
  MAX_WAIT_HOURS: 24, // Force shuffle after 24h regardless
  NORMAL_INTERVAL_HOURS: 1 // Check every hour
};

/**
 * Fisher-Yates shuffle algorithm for true randomization.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if shuffle should run based on time and review count.
 */
async function shouldShuffle(): Promise<{ shouldRun: boolean; reason: string }> {
  // Get last shuffle time from system_config
  const config = await db.systemConfig.findUnique({
    where: { key: 'last_shuffle_time' }
  });

  const lastShuffleTime = config?.lastShuffleTime || new Date(0);
  const hoursSinceLastShuffle = (Date.now() - lastShuffleTime.getTime()) / (1000 * 60 * 60);

  // Get pending review count
  const pendingCount = await db.pendingReview.count();

  // Force shuffle after max wait (prevents indefinite holding)
  if (hoursSinceLastShuffle >= SHUFFLE_CONFIG.MAX_WAIT_HOURS && pendingCount > 0) {
    return { shouldRun: true, reason: `Max wait time exceeded (${SHUFFLE_CONFIG.MAX_WAIT_HOURS}h)` };
  }

  // Normal interval check with minimum threshold
  if (hoursSinceLastShuffle >= SHUFFLE_CONFIG.NORMAL_INTERVAL_HOURS && pendingCount >= SHUFFLE_CONFIG.MIN_REVIEWS) {
    return { shouldRun: true, reason: `Threshold met: ${pendingCount} reviews pending` };
  }

  return {
    shouldRun: false,
    reason: `Not ready: ${pendingCount} reviews, ${hoursSinceLastShuffle.toFixed(1)}h since last shuffle`
  };
}

/**
 * Execute the shuffle: decrypt, randomize, and publish reviews.
 */
async function executeShuffle(): Promise<{ processed: number; errors: number }> {
  // 1. Fetch all pending reviews
  const pendingReviews = await db.pendingReview.findMany();

  if (pendingReviews.length === 0) {
    return { processed: 0, errors: 0 };
  }

  // 2. Decrypt each review
  const decryptedReviews: Array<{
    id: number;
    profId: string;
    cycleId: string;
    content: ReviewContent;
  }> = [];

  let errors = 0;

  for (const pending of pendingReviews) {
    try {
      // Decrypt the AES key using server's RSA private key
      const aesKey = decryptAESKey(pending.encryptedKey);

      // Decrypt the review content using the AES key
      const decryptedJson = decryptAESGCM(pending.encryptedBlob, aesKey);
      const content: ReviewContent = JSON.parse(decryptedJson);

      decryptedReviews.push({
        id: pending.id,
        profId: pending.profId,
        cycleId: pending.cycleId,
        content
      });
    } catch (error) {
      console.error(`Failed to decrypt review ${pending.id}:`, error);
      errors++;
    }
  }

  // 3. Shuffle the reviews (randomize order to break timing correlation)
  const shuffledReviews = shuffleArray(decryptedReviews);

  // 4. Publish to Review table and cleanup - use transaction
  const publishedAt = new Date();

  await db.$transaction(async (tx) => {
    // Create anonymous reviews in the main Review table
    for (const review of shuffledReviews) {
      // Update professor, course, and department statistics using the shared function
      await updateReviewStats(tx, {
        professorId: review.profId,
        courseCode: review.content.courseCode,
        ratings: review.content.ratings,
        statistics: review.content.statistics,
        grade: review.content.grade,
        type: review.content.type
      });

      // Create the review record with full data from encrypted content
      await tx.review.create({
        data: {
          professorId: review.profId,
          courseCode: review.content.courseCode,
          userId: null, // Anonymous - no user link
          semester: review.content.semester,
          anonymous: true, // Flag as anonymous
          ratings: JSON.parse(JSON.stringify(review.content.ratings)),
          comment: review.content.text,
          statistics: JSON.parse(JSON.stringify(review.content.statistics)),
          grade: review.content.grade,
          type: review.content.type,
          cycleId: review.cycleId,
          upvotes: 0,
          downvotes: 0,
          createdAt: publishedAt // Shuffle time, not submission time
        }
      });
    }

    // Delete processed pending reviews
    await tx.pendingReview.deleteMany({
      where: {
        id: {
          in: decryptedReviews.map((r) => r.id)
        }
      }
    });

    // Update last shuffle time
    await tx.systemConfig.upsert({
      where: { key: 'last_shuffle_time' },
      update: { lastShuffleTime: publishedAt },
      create: { key: 'last_shuffle_time', lastShuffleTime: publishedAt }
    });
  });

  return { processed: shuffledReviews.length, errors };
}

/**
 * Main entry point: Check conditions and run shuffle if needed.
 * Call this from review fetching endpoints.
 */
export async function tryLazyShuffle(): Promise<{
  ran: boolean;
  reason: string;
  processed?: number;
  errors?: number;
}> {
  try {
    const { shouldRun, reason } = await shouldShuffle();

    if (!shouldRun) {
      return { ran: false, reason };
    }

    const result = await executeShuffle();

    return {
      ran: true,
      reason,
      processed: result.processed,
      errors: result.errors
    };
  } catch (error) {
    console.error('Lazy shuffle error:', error);
    return {
      ran: false,
      reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get shuffle status for monitoring/debugging.
 */
export async function getShuffleStatus(): Promise<{
  pendingCount: number;
  lastShuffleTime: Date | null;
  hoursSinceLastShuffle: number;
  willShuffleAt: { reviews: number } | { hours: number };
}> {
  const config = await db.systemConfig.findUnique({
    where: { key: 'last_shuffle_time' }
  });

  const pendingCount = await db.pendingReview.count();
  const lastShuffleTime = config?.lastShuffleTime || null;
  const hoursSinceLastShuffle = lastShuffleTime
    ? (Date.now() - lastShuffleTime.getTime()) / (1000 * 60 * 60)
    : Infinity;

  const hoursUntilForce = Math.max(0, SHUFFLE_CONFIG.MAX_WAIT_HOURS - hoursSinceLastShuffle);
  const reviewsNeeded = Math.max(0, SHUFFLE_CONFIG.MIN_REVIEWS - pendingCount);

  return {
    pendingCount,
    lastShuffleTime,
    hoursSinceLastShuffle,
    willShuffleAt:
      reviewsNeeded > 0 && hoursUntilForce > 0 ? { reviews: SHUFFLE_CONFIG.MIN_REVIEWS } : { hours: hoursUntilForce }
  };
}
