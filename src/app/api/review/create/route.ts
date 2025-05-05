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
      // Create the review
      const review = await tx.review.create({
        data: {
          professorId,
          courseId,
          userId: session.user.id,
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

      // Get current professor statistics
      const professor = await tx.professor.findUnique({
        where: { id: professorId }
      });

      if (!professor) {
        throw new Error('Professor not found');
      }

      // Parse current statistics
      const currentStats = professor.statistics as {
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

      const totalReviews = currentStats.totalReviews;
      const newTotalReviews = totalReviews + 1;

      // Calculate new averages
      const newRatings = {
        overall: (currentStats.ratings.overall * totalReviews + ratings.overall) / newTotalReviews,
        teaching: (currentStats.ratings.teaching * totalReviews + ratings.teaching) / newTotalReviews,
        helpfulness: (currentStats.ratings.helpfulness * totalReviews + ratings.helpfulness) / newTotalReviews,
        fairness: (currentStats.ratings.fairness * totalReviews + ratings.fairness) / newTotalReviews,
        clarity: (currentStats.ratings.clarity * totalReviews + ratings.clarity) / newTotalReviews,
        communication: (currentStats.ratings.communication * totalReviews + ratings.communication) / newTotalReviews
      };

      // Calculate new percentages
      const newPercentages = {
        wouldRecommend:
          (currentStats.percentages.wouldRecommend * totalReviews + (wouldRecommend ? 100 : 0)) / newTotalReviews,
        attendanceRating:
          (currentStats.percentages.attendanceRating * totalReviews + (attendance ? 100 : 0)) / newTotalReviews,
        quizes: (currentStats.percentages.quizes * totalReviews + (quizes ? 100 : 0)) / newTotalReviews,
        assignments: (currentStats.percentages.assignments * totalReviews + (assignments ? 100 : 0)) / newTotalReviews
      };

      // Calculate attendance mandatory percentage
      const attendancePercentage = parseInt(attendance.toString());
      const isAttendanceMandatory = !isNaN(attendancePercentage) && attendancePercentage >= 80;
      newPercentages.attendanceRating =
        (currentStats.percentages.attendanceRating * totalReviews + (isAttendanceMandatory ? 100 : 0)) /
        newTotalReviews;

      // Round all numbers to 1 decimal place
      Object.keys(newRatings).forEach((key) => {
        newRatings[key as keyof typeof newRatings] = Number(newRatings[key as keyof typeof newRatings].toFixed(1));
      });
      Object.keys(newPercentages).forEach((key) => {
        newPercentages[key as keyof typeof newPercentages] = Number(
          newPercentages[key as keyof typeof newPercentages].toFixed(1)
        );
      });

      // Update professor statistics
      await tx.professor.update({
        where: { id: professorId },
        data: {
          statistics: {
            ratings: newRatings,
            percentages: newPercentages,
            totalReviews: newTotalReviews
          }
        }
      });

      // Increment course review count
      await tx.course.update({
        where: { id: courseId },
        data: {
          reviewCount: {
            increment: 1
          }
        }
      });

      return review;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
