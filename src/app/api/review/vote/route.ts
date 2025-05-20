import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId, voteType } = await req.json();

    if (!reviewId || !voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const userId = (session.user as { id: string }).id;

    // Start a transaction to handle the vote
    const result = await db.$transaction(async (tx) => {
      // Get the current vote if it exists
      const existingVote = await tx.reviewVote.findUnique({
        where: {
          reviewId_userId: {
            reviewId,
            userId
          }
        }
      });

      // Get the review
      const review = await tx.review.findUnique({
        where: { id: reviewId }
      });

      if (!review) {
        throw new Error('Review not found');
      }

      let upvotesChange = 0;
      let downvotesChange = 0;

      if (existingVote) {
        // If user is voting the same way, remove the vote
        if (existingVote.voteType === voteType) {
          await tx.reviewVote.delete({
            where: {
              reviewId_userId: {
                reviewId,
                userId
              }
            }
          });
          upvotesChange = voteType === 'up' ? -1 : 0;
          downvotesChange = voteType === 'down' ? -1 : 0;
        } else {
          // If user is changing their vote
          await tx.reviewVote.update({
            where: {
              reviewId_userId: {
                reviewId,
                userId
              }
            },
            data: { voteType }
          });
          upvotesChange = voteType === 'up' ? 1 : -1;
          downvotesChange = voteType === 'down' ? 1 : -1;
        }
      } else {
        // Create new vote
        await tx.reviewVote.create({
          data: {
            reviewId,
            userId,
            voteType
          }
        });
        upvotesChange = voteType === 'up' ? 1 : 0;
        downvotesChange = voteType === 'down' ? 1 : 0;
      }

      // Update review vote counts
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: {
          upvotes: { increment: upvotesChange },
          downvotes: { increment: downvotesChange }
        }
      });

      return {
        review: updatedReview,
        userVote: existingVote?.voteType === voteType ? null : voteType
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
