import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const branch = searchParams.get('branch');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where: any = {};
    if (department) where.department = department;
    if (branch) where.branch = branch;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [professors, total] = await Promise.all([
      db.professor.findMany({
        where,
        skip,
        take: limit,
        include: {
          reviews: {
            include: {
              course: {
                select: {
                  id: true,
                  code: true,
                  name: true
                }
              }
            }
          },
          department: true
        }
      }),
      db.professor.count({ where })
    ]);

    // Calculate ratings for each professor
    const professorsWithRatings = professors.map((professor) => {
      const totalReviews = professor.reviews.length;

      // Get unique courses from reviews
      const uniqueCourses = Array.from(
        new Map(professor.reviews.map((review) => [review.course.id, review.course])).values()
      );

      // Initialize ratings object
      const ratings = {
        overall: 0,
        teaching: 0,
        helpfulness: 0,
        fairness: 0,
        clarity: 0,
        communication: 0
      };

      // Calculate statistics percentages
      const statistics = {
        wouldRecommend: 0,
        attendanceMandatory: 0,
        quizes: 0,
        assignments: 0
      };

      if (totalReviews > 0) {
        // Calculate average ratings
        professor.reviews.forEach((review) => {
          const reviewRatings = review.ratings as {
            overall: number;
            teaching: number;
            helpfulness: number;
            fairness: number;
            clarity: number;
            communication: number;
          };

          ratings.overall += reviewRatings.overall;
          ratings.teaching += reviewRatings.teaching;
          ratings.helpfulness += reviewRatings.helpfulness;
          ratings.fairness += reviewRatings.fairness;
          ratings.clarity += reviewRatings.clarity;
          ratings.communication += reviewRatings.communication;

          // Calculate statistics
          if (review.wouldRecommend) statistics.wouldRecommend++;
          if (review.quizes) statistics.quizes++;
          if (review.assignments) statistics.assignments++;

          // Consider attendance mandatory if percentage is above 80%
          const attendancePercentage = parseInt(review.attendance);
          if (!isNaN(attendancePercentage) && attendancePercentage >= 80) {
            statistics.attendanceMandatory++;
          }
        });

        // Convert to averages and percentages
        (Object.keys(ratings) as Array<keyof typeof ratings>).forEach((key) => {
          ratings[key] = Number((ratings[key] / totalReviews).toFixed(1));
        });

        (Object.keys(statistics) as Array<keyof typeof statistics>).forEach((key) => {
          statistics[key] = Number(((statistics[key] / totalReviews) * 100).toFixed(1));
        });
      }

      return {
        ...professor,
        ratings,
        statistics,
        numReviews: totalReviews,
        numCourses: uniqueCourses.length,
        courses: uniqueCourses
      };
    });

    return NextResponse.json({
      professors: professorsWithRatings,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json({ error: 'Failed to fetch professors' }, { status: 500 });
  }
}
