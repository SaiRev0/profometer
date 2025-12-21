import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { tryLazyShuffle } from '@/lib/crypto/shuffle';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Trigger lazy shuffle - publishes anonymous reviews if conditions are met
  await tryLazyShuffle();

  const session = await getServerSession(authOptions);
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const reviews = await db.review.findMany({
      where: {
        professorId: id,
        type: 'professor'
      },
      include: {
        user: true,
        course: true,
        professor: true,
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
    console.error('Error fetching professor reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch professor reviews' }, { status: 500 });
  }
}
