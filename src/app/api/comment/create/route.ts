import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreateCommentApiData } from '@/lib/types/apiTypes';

import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId, parentId, content } = (await req.json()) as CreateCommentApiData;

    // Validate required fields
    if (!reviewId || !content?.trim()) {
      return NextResponse.json({ error: 'Review ID and content are required' }, { status: 400 });
    }

    // Content length validation
    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Comment too long (max 2000 characters)' }, { status: 400 });
    }

    // Verify review exists
    const review = await db.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // If replying to a comment, verify parent exists and belongs to same review
    if (parentId) {
      const parentComment = await db.reviewComment.findUnique({
        where: { id: parentId }
      });
      if (!parentComment || parentComment.reviewId !== reviewId) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 });
      }
    }

    // Always use real user ID
    const userId = (session.user as { id: string }).id;

    const comment = await db.reviewComment.create({
      data: {
        reviewId,
        parentId: parentId || null,
        content: content.trim(),
        userId
      },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
