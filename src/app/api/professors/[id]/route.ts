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
            user: true,
            course: {
              include: {
                reviews: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
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

    // Get unique courses from reviews with their review counts
    const uniqueCourses = Array.from(
      new Map(
        professor.reviews.map((review) => [
          review.course.id,
          {
            ...review.course,
            numReviews: review.course.reviews.length
          }
        ])
      ).values()
    );

    const departmentCourses = await db.course.findMany({
      where: {
        departmentId: professor.departmentId,
        verified: true
      },
      include: {
        reviews: true
      }
    });

    // Add numReviews to department courses
    const departmentCoursesWithReviews = departmentCourses.map((course) => ({
      ...course,
      numReviews: course.reviews.length
    }));

    // Combine all data
    const response = {
      ...professor,
      ratings: statistics.ratings,
      statistics: statistics.percentages,
      numReviews: statistics.totalReviews,
      numCourses: uniqueCourses.length,
      courses: uniqueCourses,
      departmentCourses: departmentCoursesWithReviews
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json({ error: 'Failed to fetch professor' }, { status: 500 });
  }
}
