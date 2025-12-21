import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateReviewStats } from '@/lib/review-stats';
import { CreateReviewApiData } from '@/lib/types/apiTypes';

import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { professorId, courseCode, semester, ratings, comment, statistics, grade, type } =
      (await req.json()) as CreateReviewApiData;

    // Validate required fields
    if (!professorId || !courseCode || !semester || !ratings || !comment || !statistics || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = (session.user as { id: string }).id;

    // Start a transaction to create review and update statistics
    const result = await db.$transaction(async (tx) => {
      try {
        // Update professor, course, and department statistics using the shared function
        await updateReviewStats(tx, {
          professorId,
          courseCode,
          ratings,
          statistics,
          grade,
          type
        });

        // Create the review (always non-anonymous - anonymous reviews go through /api/review/anonymous)
        const review = await tx.review.create({
          data: {
            professorId,
            courseCode,
            userId,
            semester,
            anonymous: false,
            ratings: JSON.parse(JSON.stringify(ratings)),
            comment,
            statistics: JSON.parse(JSON.stringify(statistics)),
            grade,
            type
          }
        });

        return review;
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error; // Re-throw to be caught by outer try-catch
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
