import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile data
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        reviews: {
          include: {
            course: true,
            professor: true
          }
        },
        department: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate stats
    const statistics = {
      totalReviews: user.reviews.length,
      helpfulVotes: user.reviews.reduce((acc, review) => acc + review.upvotes, 0)
    };

    // Format the response
    const profileData = {
      ...user,
      statistics
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
