import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 2;

    const [professors, courses] = await Promise.all([
      // Get recently reviewed professors
      db.professor.findMany({
        where: {
          reviews: {
            some: {
              type: 'professor'
            }
          }
        },
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          reviews: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              course: true
            }
          },
          department: true
        }
      }),
      // Get recently reviewed courses
      db.course.findMany({
        where: {
          verified: true,
          reviews: {
            some: {
              type: 'course'
            }
          }
        },
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          reviews: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              professor: true
            }
          },
          department: true
        }
      })
    ]);

    return NextResponse.json({
      professors,
      courses
    });
  } catch (error) {
    console.error('[RECENT_REVIEWS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
