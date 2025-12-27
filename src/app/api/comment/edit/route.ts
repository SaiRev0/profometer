import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { EditCommentApiData } from '@/lib/types/apiTypes';

import { getServerSession } from 'next-auth';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId, content } = (await req.json()) as EditCommentApiData;

    if (!commentId || !content?.trim()) {
      return NextResponse.json({ error: 'Comment ID and content are required' }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Comment too long (max 2000 characters)' }, { status: 400 });
    }

    // Check if comment exists
    const existingComment = await db.reviewComment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user is the author
    const userId = (session.user as { id: string }).id;
    if (existingComment.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to edit this comment' }, { status: 403 });
    }

    const updatedComment = await db.reviewComment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error editing comment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
