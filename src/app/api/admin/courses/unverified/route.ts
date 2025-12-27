import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

/**
 * GET /api/admin/courses/unverified
 * Returns all unverified courses with details
 * Protected: Admin only
 */
export async function GET(request: Request) {
  try {
    // Verify admin access
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch unverified courses with department info
    const [courses, totalCount] = await Promise.all([
      db.course.findMany({
        where: {
          verified: false
        },
        include: {
          department: {
            select: {
              code: true,
              name: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.course.count({
        where: {
          verified: false
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching unverified courses:', error);

    // Check if it's an authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fetch unverified courses' }, { status: 500 });
  }
}
