import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const departments = await db.department.findMany({
      take: limit,
      orderBy: {
        avgRating: 'desc'
      },
      include: {
        _count: {
          select: {
            professors: true,
            courses: true
          }
        },
        professors: {
          include: {
            reviews: true
          }
        }
      }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
