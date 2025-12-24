import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  try {
    // Build the user select to reuse
    const userSelect = { id: true, username: true };

    // Build votes include if user is logged in
    const votesInclude = session?.user?.id
      ? {
          votes: {
            where: { userId: session.user.id },
            select: { voteType: true },
            take: 1
          }
        }
      : {};

    // Fetch top-level comments with nested replies (up to 4 levels for better nesting support)
    const comments = await db.reviewComment.findMany({
      where: {
        reviewId: id,
        parentId: null // Only top-level comments
      },
      include: {
        user: { select: userSelect },
        ...votesInclude,
        replies: {
          include: {
            user: { select: userSelect },
            ...votesInclude,
            replies: {
              include: {
                user: { select: userSelect },
                ...votesInclude,
                replies: {
                  include: {
                    user: { select: userSelect },
                    ...votesInclude
                    // Level 4 - no more nested replies
                  },
                  orderBy: { createdAt: 'asc' as const }
                }
              },
              orderBy: { createdAt: 'asc' as const }
            }
          },
          orderBy: { createdAt: 'asc' as const }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
