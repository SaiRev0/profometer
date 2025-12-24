import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommentVoteApiData } from '@/lib/types/apiTypes';

import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId, voteType } = (await req.json()) as CommentVoteApiData;

    if (!commentId || !voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const userId = (session.user as { id: string }).id;

    // Start a transaction to handle the vote
    const result = await db.$transaction(async (tx) => {
      // Get the current vote if it exists
      const existingVote = await tx.commentVote.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId
          }
        }
      });

      // Get the comment
      const comment = await tx.reviewComment.findUnique({
        where: { id: commentId }
      });

      if (!comment) {
        throw new Error('Comment not found');
      }

      let upvotesChange = 0;
      let downvotesChange = 0;

      if (existingVote) {
        // If user is voting the same way, remove the vote
        if (existingVote.voteType === voteType) {
          await tx.commentVote.delete({
            where: {
              commentId_userId: {
                commentId,
                userId
              }
            }
          });
          upvotesChange = voteType === 'up' ? -1 : 0;
          downvotesChange = voteType === 'down' ? -1 : 0;
        } else {
          // If user is changing their vote
          await tx.commentVote.update({
            where: {
              commentId_userId: {
                commentId,
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
        await tx.commentVote.create({
          data: {
            commentId,
            userId,
            voteType
          }
        });
        upvotesChange = voteType === 'up' ? 1 : 0;
        downvotesChange = voteType === 'down' ? 1 : 0;
      }

      // Update comment vote counts
      const updatedComment = await tx.reviewComment.update({
        where: { id: commentId },
        data: {
          upvotes: { increment: upvotesChange },
          downvotes: { increment: downvotesChange }
        }
      });

      return {
        comment: updatedComment,
        userVote: existingVote?.voteType === voteType ? null : voteType
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing vote:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage === 'Comment not found') {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
