import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getServerSession(authOptions);
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const reviews = await db.review.findMany({
      where: {
        courseCode: code.toUpperCase(),
        type: 'course'
      },
      include: {
        course: true,
        professor: true,
        user: {
          select: {
            id: true,
            username: true // Only expose username
          }
        },
        ...(session?.user?.id && {
          votes: {
            where: { userId: session.user.id },
            select: { voteType: true },
            take: 1
          }
        })
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Take one extra to check if there are more
      ...(cursor && {
        cursor: {
          id: cursor
        },
        skip: 1 // Skip the cursor
      })
    });

    const hasMore = reviews.length > limit;
    const items = hasMore ? reviews.slice(0, -1) : reviews;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      reviews: items,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch course reviews' }, { status: 500 });
  }
}
