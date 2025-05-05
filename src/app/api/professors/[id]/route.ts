import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const professor = await db.professor.findUnique({
      where: { id: id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            },
            course: {
              select: {
                code: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        courses: true,
        department: true
      }
    });

    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // Parse statistics from JSON
    const statistics = professor.statistics as {
      ratings: {
        overall: number;
        teaching: number;
        helpfulness: number;
        fairness: number;
        clarity: number;
        communication: number;
      };
      percentages: {
        wouldRecommend: number;
        attendanceRating: number;
        quizes: number;
        assignments: number;
      };
      totalReviews: number;
    };

    // Combine all data
    const response = {
      ...professor,
      ratings: statistics.ratings,
      statistics: statistics.percentages,
      numReviews: statistics.totalReviews,
      numCourses: professor.courses.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json({ error: 'Failed to fetch professor' }, { status: 500 });
  }
}
