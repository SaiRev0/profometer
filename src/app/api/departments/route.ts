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

    // Calculate average ratings and format the response
    const formattedDepartments = departments.map((dept) => {
      let totalRating = 0;
      let totalReviews = 0;

      // Calculate ratings from all professors' reviews
      dept.professors.forEach((professor) => {
        const professorReviews = professor.reviews;
        totalReviews += professorReviews.length;

        professorReviews.forEach((review) => {
          const reviewRatings = review.ratings as {
            overall: number;
            teaching: number;
            helpfulness: number;
            fairness: number;
            clarity: number;
            communication: number;
          };
          totalRating += reviewRatings.overall;
        });
      });

      const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      return {
        name: dept.name,
        code: dept.code,
        avgRating: Number(avgRating.toFixed(1)),
        numProfessors: dept._count.professors,
        numCourses: dept._count.courses,
        numReviews: totalReviews,
        isDefault: dept.code === 'CSE', // Example: CSE is default
        isProtected: false
      };
    });

    // Sort by average rating after calculating it
    formattedDepartments.sort((a, b) => b.avgRating - a.avgRating);

    return NextResponse.json(formattedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
