import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { Review } from '@/lib/types';

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

    // Calculate statistics from reviews
    const totalReviews = professor.reviews.length;

    // Calculate average ratings
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

    // Combine all data
    const response = {
      ...professor,
      ratings,
      statistics,
      numReviews: totalReviews,
      numCourses: professor.courses.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json({ error: 'Failed to fetch professor' }, { status: 500 });
  }
}
