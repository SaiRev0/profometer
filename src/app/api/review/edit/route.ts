import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';
import { convertNumberToGrade, gradeNumberMap } from '@/lib/utils';

import { getServerSession } from 'next-auth';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId, ...reviewData } = (await req.json()) as CreateReviewApiData & { reviewId: string };

    // Validate required fields
    if (
      !reviewId ||
      !reviewData.professorId ||
      !reviewData.courseCode ||
      !reviewData.semester ||
      !reviewData.ratings ||
      !reviewData.comment ||
      !reviewData.statistics ||
      !reviewData.type
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if review exists and belongs to the user
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        professor: true,
        course: true
      }
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if user is the author of the review
    if (existingReview.userId !== (session.user as { id: string }).id) {
      return NextResponse.json({ error: 'Unauthorized to edit this review' }, { status: 403 });
    }

    // Start a transaction to update review and statistics
    const result = await db.$transaction(async (tx) => {
      try {
        // Get current professor statistics
        const professor = await tx.professor.findUnique({
          where: { id: reviewData.professorId }
        });

        if (!professor) throw new Error('Professor not found');

        // Parse current professor statistics
        const currentProfStats = professor.statistics as unknown as {
          ratings: ProfessorRating;
          percentages: ProfessorPercentages;
          totalReviews: number;
        };

        // Get current course statistics
        const course = await tx.course.findUnique({
          where: { code: reviewData.courseCode }
        });

        if (!course) throw new Error('Course not found');

        const currentCourseStats = course.statistics as unknown as {
          ratings: CourseRating;
          percentages: CoursePercentages;
          totalReviews: number;
        };

        // Parse old review data
        const oldReviewRatings = existingReview.ratings as unknown as ProfessorRating | CourseRating;
        const oldReviewStatistics = existingReview.statistics as unknown as ProfessorPercentages | CoursePercentages;

        // Update the review
        const updatedReview = await tx.review.update({
          where: { id: reviewId },
          data: {
            professorId: reviewData.professorId,
            courseCode: reviewData.courseCode,
            semester: reviewData.semester,
            anonymous: reviewData.anonymous,
            ratings: JSON.parse(JSON.stringify(reviewData.ratings)),
            comment: reviewData.comment,
            statistics: JSON.parse(JSON.stringify(reviewData.statistics)),
            grade: reviewData.grade,
            type: reviewData.type,
            updatedAt: new Date()
          }
        });

        // Update statistics based on review type
        if (reviewData.type === 'professor') {
          const profTotalReviews = currentProfStats.totalReviews;
          const professorRatings = reviewData.ratings as ProfessorRating;
          const professorStatistics = reviewData.statistics as ProfessorPercentages;
          const oldProfessorRatings = oldReviewRatings as ProfessorRating;

          // Calculate new professor averages by removing old review and adding new review
          const newProfRatings: ProfessorRating = {
            overall: Number(
              (
                (currentProfStats.ratings.overall * profTotalReviews -
                  oldProfessorRatings.overall +
                  professorRatings.overall) /
                profTotalReviews
              ).toFixed(1)
            ),
            teaching: Number(
              (
                (currentProfStats.ratings.teaching * profTotalReviews -
                  oldProfessorRatings.teaching +
                  professorRatings.teaching) /
                profTotalReviews
              ).toFixed(1)
            ),
            helpfulness: Number(
              (
                (currentProfStats.ratings.helpfulness * profTotalReviews -
                  oldProfessorRatings.helpfulness +
                  professorRatings.helpfulness) /
                profTotalReviews
              ).toFixed(1)
            ),
            fairness: Number(
              (
                (currentProfStats.ratings.fairness * profTotalReviews -
                  oldProfessorRatings.fairness +
                  professorRatings.fairness) /
                profTotalReviews
              ).toFixed(1)
            ),
            clarity: Number(
              (
                (currentProfStats.ratings.clarity * profTotalReviews -
                  oldProfessorRatings.clarity +
                  professorRatings.clarity) /
                profTotalReviews
              ).toFixed(1)
            ),
            communication: Number(
              (
                (currentProfStats.ratings.communication * profTotalReviews -
                  oldProfessorRatings.communication +
                  professorRatings.communication) /
                profTotalReviews
              ).toFixed(1)
            )
          };

          // Update professor statistics
          await tx.professor.update({
            where: { id: reviewData.professorId },
            data: {
              statistics: {
                ratings: JSON.parse(JSON.stringify(newProfRatings)),
                percentages: JSON.parse(JSON.stringify(currentProfStats.percentages)),
                totalReviews: profTotalReviews
              }
            }
          });

          // Update department average rating
          const department = await tx.department.findUnique({
            where: { code: professor.departmentCode }
          });

          if (department) {
            const currentWeightedSum = department.avgRating * department.numReviews;
            const reviewWeight = course.credits;
            const newWeightedSum =
              currentWeightedSum - oldProfessorRatings.overall * reviewWeight + professorRatings.overall * reviewWeight;
            const newAvgRating = Number((newWeightedSum / (department.numReviews * reviewWeight)).toFixed(1));

            await tx.department.update({
              where: { code: professor.departmentCode },
              data: {
                avgRating: newAvgRating
              }
            });
          }
        } else if (reviewData.type === 'course') {
          const courseTotalReviews = currentCourseStats.totalReviews;
          const courseRatings = reviewData.ratings as CourseRating;
          const courseStatistics = reviewData.statistics as CoursePercentages;
          const oldCourseRatings = oldReviewRatings as CourseRating;
          const oldCourseStatistics = oldReviewStatistics as CoursePercentages;

          // Calculate new course averages
          const newCourseRatings: CourseRating = {
            overall: Number(
              (
                (currentCourseStats.ratings.overall * courseTotalReviews -
                  oldCourseRatings.overall +
                  courseRatings.overall) /
                courseTotalReviews
              ).toFixed(1)
            ),
            difficulty: Number(
              (
                (currentCourseStats.ratings.difficulty * courseTotalReviews -
                  oldCourseRatings.difficulty +
                  courseRatings.difficulty) /
                courseTotalReviews
              ).toFixed(1)
            ),
            workload: Number(
              (
                (currentCourseStats.ratings.workload * courseTotalReviews -
                  oldCourseRatings.workload +
                  courseRatings.workload) /
                courseTotalReviews
              ).toFixed(1)
            ),
            content: Number(
              (
                (currentCourseStats.ratings.content * courseTotalReviews -
                  oldCourseRatings.content +
                  courseRatings.content) /
                courseTotalReviews
              ).toFixed(1)
            ),
            numerical: Number(
              (
                (currentCourseStats.ratings.numerical * courseTotalReviews -
                  oldCourseRatings.numerical +
                  courseRatings.numerical) /
                courseTotalReviews
              ).toFixed(1)
            )
          };

          let averageGradeString = currentCourseStats.percentages.averageGrade;

          if (reviewData.grade) {
            if (existingReview.grade) {
              // If both old and new grades exist, recalculate average
              const oldGradeValue = gradeNumberMap[existingReview.grade];
              const newGradeValue = gradeNumberMap[reviewData.grade];
              const totalGradeValue =
                (currentCourseStats.percentages.averageGrade === 'NA'
                  ? 0
                  : gradeNumberMap[currentCourseStats.percentages.averageGrade]) *
                  courseTotalReviews -
                oldGradeValue +
                newGradeValue;
              averageGradeString = convertNumberToGrade(totalGradeValue / courseTotalReviews);
            } else {
              // If only new grade exists, add it to average
              const totalGradeValue =
                (currentCourseStats.percentages.averageGrade === 'NA'
                  ? 0
                  : gradeNumberMap[currentCourseStats.percentages.averageGrade]) *
                  courseTotalReviews +
                gradeNumberMap[reviewData.grade];
              averageGradeString = convertNumberToGrade(totalGradeValue / (courseTotalReviews + 1));
            }
          } else if (existingReview.grade) {
            // If old grade exists but new one doesn't, remove old grade from average
            const oldGradeValue = gradeNumberMap[existingReview.grade];
            const totalGradeValue =
              (currentCourseStats.percentages.averageGrade === 'NA'
                ? 0
                : gradeNumberMap[currentCourseStats.percentages.averageGrade]) *
                courseTotalReviews -
              oldGradeValue;
            averageGradeString = convertNumberToGrade(totalGradeValue / (courseTotalReviews - 1));
          }

          // Calculate new course percentages
          const newCoursePercentages: CoursePercentages = {
            wouldRecommend: Number(
              (
                (currentCourseStats.percentages.wouldRecommend * courseTotalReviews -
                  oldCourseStatistics.wouldRecommend * 100 +
                  courseStatistics.wouldRecommend * 100) /
                courseTotalReviews
              ).toFixed(1)
            ),
            attendanceRating: Number(
              (
                (currentCourseStats.percentages.attendanceRating * courseTotalReviews -
                  oldCourseStatistics.attendanceRating +
                  courseStatistics.attendanceRating) /
                courseTotalReviews
              ).toFixed(1)
            ),
            quizes: Number(
              (
                (currentCourseStats.percentages.quizes * courseTotalReviews -
                  oldCourseStatistics.quizes * 100 +
                  courseStatistics.quizes * 100) /
                courseTotalReviews
              ).toFixed(1)
            ),
            assignments: Number(
              (
                (currentCourseStats.percentages.assignments * courseTotalReviews -
                  oldCourseStatistics.assignments * 100 +
                  courseStatistics.assignments * 100) /
                courseTotalReviews
              ).toFixed(1)
            ),
            averageGrade: averageGradeString
          };

          // Update course statistics
          await tx.course.update({
            where: { code: reviewData.courseCode },
            data: {
              statistics: {
                ratings: JSON.parse(JSON.stringify(newCourseRatings)),
                percentages: JSON.parse(JSON.stringify(newCoursePercentages)),
                totalReviews: courseTotalReviews
              }
            }
          });

          // Update department average rating
          const department = await tx.department.findUnique({
            where: { code: course.departmentCode }
          });

          if (department) {
            const currentWeightedSum = department.avgRating * department.numReviews;
            const reviewWeight = course.credits;
            const newWeightedSum =
              currentWeightedSum - oldCourseRatings.overall * reviewWeight + courseRatings.overall * reviewWeight;
            const newAvgRating = Number((newWeightedSum / (department.numReviews * reviewWeight)).toFixed(1));

            await tx.department.update({
              where: { code: course.departmentCode },
              data: {
                avgRating: newAvgRating
              }
            });
          }
        }

        return updatedReview;
      } catch (error) {
        console.error('Error in transaction:', error);
        throw error;
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
