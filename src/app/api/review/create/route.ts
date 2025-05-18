import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      professorId,
      courseId,
      semester,
      anonymous,
      ratings,
      comment,
      wouldRecommend,
      attendance,
      quizes,
      assignments,
      grade
    } = body;

    // Validate required fields
    if (!professorId || !courseId || !semester || !ratings || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start a transaction to create review and update statistics
    const result = await db.$transaction(async (tx) => {
      try {
        // Get the appropriate user ID based on anonymous flag
        const userId = anonymous ? process.env.ANONYMOUS_USER_ID : (session.user as { id: string }).id;

        if (!userId) {
          throw new Error('Anonymous user ID not configured in environment variables');
        }

        // Create the review
        const review = await tx.review.create({
          data: {
            professorId,
            courseCode: courseId,
            userId,
            semester,
            anonymous,
            ratings,
            comment,
            wouldRecommend,
            attendance: attendance.toString(),
            quizes,
            assignments,
            grade
          }
        });
        console.log('Review created successfully:', review);

        // Get current professor statistics
        const professor = await tx.professor.findUnique({
          where: { id: professorId }
        });

        if (!professor) {
          throw new Error('Professor not found');
        }

        // Get current course statistics
        const course = await tx.course.findUnique({
          where: { code: courseId }
        });

        if (!course) {
          throw new Error('Course not found');
        }

        // Parse current professor statistics
        const currentProfStats = professor.statistics as {
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

        // Parse current course statistics
        const currentCourseStats = course.statistics as {
          ratings: {
            overall: number;
          };
          percentages: {
            wouldRecommend: number;
            averageGrade: string;
          };
          totalReviews: number;
        };

        const profTotalReviews = currentProfStats.totalReviews;
        const courseTotalReviews = currentCourseStats.totalReviews;
        const newProfTotalReviews = profTotalReviews + 1;
        const newCourseTotalReviews = courseTotalReviews + 1;

        // Calculate new professor averages
        const newProfRatings = {
          overall: (currentProfStats.ratings.overall * profTotalReviews + ratings.overall) / newProfTotalReviews,
          teaching: (currentProfStats.ratings.teaching * profTotalReviews + ratings.teaching) / newProfTotalReviews,
          helpfulness:
            (currentProfStats.ratings.helpfulness * profTotalReviews + ratings.helpfulness) / newProfTotalReviews,
          fairness: (currentProfStats.ratings.fairness * profTotalReviews + ratings.fairness) / newProfTotalReviews,
          clarity: (currentProfStats.ratings.clarity * profTotalReviews + ratings.clarity) / newProfTotalReviews,
          communication:
            (currentProfStats.ratings.communication * profTotalReviews + ratings.communication) / newProfTotalReviews
        };

        // Calculate new course averages
        const newCourseRatings = {
          overall: (currentCourseStats.ratings.overall * courseTotalReviews + ratings.overall) / newCourseTotalReviews
        };

        // Calculate new professor percentages
        const newProfPercentages = {
          wouldRecommend:
            (currentProfStats.percentages.wouldRecommend * profTotalReviews + (wouldRecommend ? 100 : 0)) /
            newProfTotalReviews,
          attendanceRating:
            (currentProfStats.percentages.attendanceRating * profTotalReviews + parseInt(attendance.toString())) /
            newProfTotalReviews,
          quizes: (currentProfStats.percentages.quizes * profTotalReviews + (quizes ? 100 : 0)) / newProfTotalReviews,
          assignments:
            (currentProfStats.percentages.assignments * profTotalReviews + (assignments ? 100 : 0)) /
            newProfTotalReviews
        };

        // Calculate new course percentages
        const newCoursePercentages = {
          wouldRecommend:
            (currentCourseStats.percentages.wouldRecommend * courseTotalReviews + (wouldRecommend ? 100 : 0)) /
            newCourseTotalReviews,
          averageGrade: grade || currentCourseStats.percentages.averageGrade // Keep existing grade if no new grade provided
        };

        // Round all numbers to 1 decimal place
        Object.keys(newProfRatings).forEach((key) => {
          newProfRatings[key as keyof typeof newProfRatings] = Number(
            newProfRatings[key as keyof typeof newProfRatings].toFixed(1)
          );
        });
        Object.keys(newCourseRatings).forEach((key) => {
          newCourseRatings[key as keyof typeof newCourseRatings] = Number(
            newCourseRatings[key as keyof typeof newCourseRatings].toFixed(1)
          );
        });
        Object.keys(newProfPercentages).forEach((key) => {
          if (typeof newProfPercentages[key as keyof typeof newProfPercentages] === 'number') {
            newProfPercentages[key as keyof typeof newProfPercentages] = Number(
              newProfPercentages[key as keyof typeof newProfPercentages].toFixed(1)
            );
          }
        });
        Object.keys(newCoursePercentages).forEach((key) => {
          if (typeof newCoursePercentages[key as keyof typeof newCoursePercentages] === 'number') {
            newCoursePercentages[key as keyof typeof newCoursePercentages] = Number(
              newCoursePercentages[key as keyof typeof newCoursePercentages].toFixed(1)
            );
          }
        });

        // Update professor statistics
        await tx.professor.update({
          where: { id: professorId },
          data: {
            statistics: {
              ratings: newProfRatings,
              percentages: newProfPercentages,
              totalReviews: newProfTotalReviews
            }
          }
        });

        // Update course statistics
        await tx.course.update({
          where: { code: courseId },
          data: {
            statistics: {
              ratings: newCourseRatings,
              percentages: newCoursePercentages,
              totalReviews: newCourseTotalReviews
            }
          }
        });

        return review;
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error; // Re-throw to be caught by outer try-catch
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
