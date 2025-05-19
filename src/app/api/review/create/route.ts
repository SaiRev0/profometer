import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';

import { getServerSession } from 'next-auth';

// Map of department codes to their IDs
const gradeNumberMap: { [key: string]: number } = {
  'A*': 10,
  A: 10,
  'A-': 9,
  B: 8,
  'B-': 7,
  C: 6,
  'C-': 5,
  F: 0,
  Z: 0,
  S: 5,
  I: 0
};

// Function to convert numerical grade to letter grade
function convertNumberToGrade(averageGradeNumber: number): string {
  if (averageGradeNumber >= 9.5) return 'A*';
  if (averageGradeNumber >= 9.0) return 'A';
  if (averageGradeNumber >= 8.5) return 'A-';
  if (averageGradeNumber >= 7.5) return 'B';
  if (averageGradeNumber >= 6.5) return 'B-';
  if (averageGradeNumber >= 5.5) return 'C';
  if (averageGradeNumber >= 4.5) return 'C-';
  if (averageGradeNumber >= 0.1) return 'F';
  return 'Z'; // For zero or negative values
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { professorId, courseCode, semester, anonymous, ratings, comment, statistics, grade, type } =
      await req.json();

    // Validate required fields
    if (!professorId || !courseCode || !semester || !ratings || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start a transaction to create review and update statistics
    const result = await db.$transaction(async (tx) => {
      try {
        // Get the appropriate user ID based on anonymous flag
        const userId = anonymous ? process.env.ANONYMOUS_USER_ID : (session.user as { id: string }).id;

        if (!userId) throw new Error('Anonymous user ID not configured in environment variables');

        // Get current professor statistics
        const professor = await tx.professor.findUnique({
          where: { id: professorId }
        });

        if (!professor) throw new Error('Professor not found');

        // Get current course statistics
        const course = await tx.course.findUnique({
          where: { code: courseCode }
        });

        if (!course) throw new Error('Course not found');

        // Create the review
        const review = await tx.review.create({
          data: {
            professorId,
            courseCode,
            userId,
            semester,
            anonymous,
            ratings,
            comment,
            statistics,
            grade,
            type
          }
        });
        console.log('Review created successfully:', review);

        if (type === 'professor') {
          // Parse current professor statistics
          const currentProfStats = professor.statistics as unknown as {
            ratings: ProfessorRating;
            percentages: ProfessorPercentages;
            totalReviews: number;
          };

          const profTotalReviews = currentProfStats.totalReviews;
          const newProfTotalReviews = profTotalReviews + 1;

          // Calculate new professor averages
          const newProfRatings: ProfessorRating = {
            overall: (currentProfStats.ratings.overall * profTotalReviews + ratings.overall) / newProfTotalReviews,
            teaching: (currentProfStats.ratings.teaching * profTotalReviews + ratings.teaching) / newProfTotalReviews,
            helpfulness:
              (currentProfStats.ratings.helpfulness * profTotalReviews + ratings.helpfulness) / newProfTotalReviews,
            fairness: (currentProfStats.ratings.fairness * profTotalReviews + ratings.fairness) / newProfTotalReviews,
            clarity: (currentProfStats.ratings.clarity * profTotalReviews + ratings.clarity) / newProfTotalReviews,
            communication:
              (currentProfStats.ratings.communication * profTotalReviews + ratings.communication) / newProfTotalReviews
          };

          // Calculate new professor percentages
          const newProfPercentages: ProfessorPercentages = {
            wouldRecommend:
              (currentProfStats.percentages.wouldRecommend * profTotalReviews + ratings.wouldRecommend) /
              newProfTotalReviews,
            attendanceRating:
              (currentProfStats.percentages.attendanceRating * profTotalReviews + ratings.attendanceRating) /
              newProfTotalReviews,
            quizes: (currentProfStats.percentages.quizes * profTotalReviews + ratings.quizes) / newProfTotalReviews,
            assignments:
              (currentProfStats.percentages.assignments * profTotalReviews + ratings.assignments) / newProfTotalReviews
          };

          // Round all numbers to 1 decimal place
          Object.keys(newProfRatings).forEach((key) => {
            newProfRatings[key as keyof typeof newProfRatings] = Number(
              newProfRatings[key as keyof typeof newProfRatings].toFixed(1)
            );
          });

          Object.keys(newProfPercentages).forEach((key) => {
            if (typeof newProfPercentages[key as keyof typeof newProfPercentages] === 'number') {
              newProfPercentages[key as keyof typeof newProfPercentages] = Number(
                newProfPercentages[key as keyof typeof newProfPercentages].toFixed(1)
              );
            }
          });

          // Update professor statistics
          await tx.professor.update({
            where: { id: professorId },
            data: {
              statistics: {
                ratings: JSON.parse(JSON.stringify(newProfRatings)),
                percentages: JSON.parse(JSON.stringify(newProfPercentages)),
                totalReviews: newProfTotalReviews
              }
            }
          });

          return review;
        } else if (type === 'course') {
          // Parse current course statistics
          const currentCourseStats = course.statistics as unknown as {
            ratings: CourseRating;
            percentages: CoursePercentages;
            totalReviews: number;
          };

          const courseTotalReviews = currentCourseStats.totalReviews;
          const newCourseTotalReviews = courseTotalReviews + 1;

          // Calculate new course averages
          const newCourseRatings: CourseRating = {
            overall:
              (currentCourseStats.ratings.overall * courseTotalReviews + ratings.overall) / newCourseTotalReviews,
            difficulty:
              (currentCourseStats.ratings.difficulty * courseTotalReviews + ratings.difficulty) / newCourseTotalReviews,
            workload:
              (currentCourseStats.ratings.workload * courseTotalReviews + ratings.workload) / newCourseTotalReviews,
            content:
              (currentCourseStats.ratings.content * courseTotalReviews + ratings.content) / newCourseTotalReviews,
            numerical:
              (currentCourseStats.ratings.numerical * courseTotalReviews + ratings.numerical) / newCourseTotalReviews
          };

          const averageGradeNumber: number =
            (gradeNumberMap[currentCourseStats.percentages.averageGrade] * courseTotalReviews +
              gradeNumberMap[ratings.averageGrade]) /
            newCourseTotalReviews;

          // Calculate new course percentages
          const newCoursePercentages: CoursePercentages = {
            wouldRecommend:
              (currentCourseStats.percentages.wouldRecommend * courseTotalReviews +
                (ratings.wouldRecommend ? 100 : 0)) /
              newCourseTotalReviews,
            attendanceRating:
              (currentCourseStats.percentages.attendanceRating * courseTotalReviews + ratings.attendanceRating) /
              newCourseTotalReviews,
            quizes:
              (currentCourseStats.percentages.quizes * courseTotalReviews + ratings.quizes) / newCourseTotalReviews,
            assignments:
              (currentCourseStats.percentages.assignments * courseTotalReviews + ratings.assignments) /
              newCourseTotalReviews,
            averageGrade: convertNumberToGrade(averageGradeNumber)
          };

          Object.keys(newCourseRatings).forEach((key) => {
            if (typeof newCourseRatings[key as keyof typeof newCourseRatings] === 'number') {
              newCourseRatings[key as keyof typeof newCourseRatings] = Number(
                newCourseRatings[key as keyof typeof newCourseRatings].toFixed(1)
              );
            }
          });

          // Round numeric fields to 1 decimal place
          Object.keys(newCoursePercentages).forEach((key) => {
            const value = newCoursePercentages[key as keyof CoursePercentages];
            if (typeof value === 'number') {
              (newCoursePercentages as any)[key] = Number(value.toFixed(1));
            }
          });

          // Update course statistics
          await tx.course.update({
            where: { code: courseCode },
            data: {
              statistics: {
                ratings: JSON.parse(JSON.stringify(newCourseRatings)),
                percentages: JSON.parse(JSON.stringify(newCoursePercentages)),
                totalReviews: newCourseTotalReviews
              }
            }
          });
        } else {
          throw new Error('Invalid review type');
        }
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
