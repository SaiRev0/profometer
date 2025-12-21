// src/lib/review-stats.ts
import type { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';
import { calculateNewAverage, calculateNewGradeAverage, calculateNewPercentage, safeClamp } from '@/lib/utils';

import type { Prisma } from '../../prisma/generated/client';

/**
 * Data required for updating review statistics.
 */
export interface ReviewStatsData {
  professorId: string;
  courseCode: string;
  ratings: ProfessorRating | CourseRating;
  statistics: ProfessorPercentages | CoursePercentages;
  grade?: string;
  type: 'professor' | 'course';
}

/**
 * Shared function to update professor, course, and department statistics when a review is added.
 * This is used by both regular review creation and anonymous review shuffle processing.
 *
 * @param tx - The Prisma transaction client
 * @param data - The review statistics data
 */
export async function updateReviewStats(tx: Prisma.TransactionClient, data: ReviewStatsData): Promise<void> {
  const { professorId, courseCode, ratings, statistics, grade, type } = data;

  // Get current professor statistics
  const professor = await tx.professor.findUnique({
    where: { id: professorId }
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
    where: { code: courseCode }
  });

  if (!course) throw new Error('Course not found');

  const currentCourseStats = course.statistics as unknown as {
    ratings: CourseRating;
    percentages: CoursePercentages;
    totalReviews: number;
  };

  // Update professor's totalCourses and course's totalProfessors in a single query each
  await Promise.all([
    tx.professor.update({
      where: { id: professorId },
      data: {
        totalCourses: {
          set: await tx.review
            .findMany({
              where: {
                professorId,
                type: 'professor'
              },
              select: {
                courseCode: true
              },
              distinct: ['courseCode']
            })
            .then((courses) => {
              // Add 1 if the new course is not in the existing courses
              return courses.length + (courses.some((c) => c.courseCode === courseCode) ? 0 : 1);
            })
        }
      }
    }),
    tx.course.update({
      where: { code: courseCode },
      data: {
        totalProfessors: {
          set: await tx.review
            .findMany({
              where: {
                courseCode,
                type: 'course'
              },
              select: {
                professorId: true
              },
              distinct: ['professorId']
            })
            .then((professors) => {
              // Add 1 if the new professor is not in the existing professors
              return professors.length + (professors.some((p) => p.professorId === professorId) ? 0 : 1);
            })
        }
      }
    })
  ]);

  if (type === 'professor') {
    const profTotalReviews = currentProfStats.totalReviews;
    const newProfTotalReviews = profTotalReviews + 1;

    // Type narrow ratings and statistics for professor case
    const professorRatings = ratings as ProfessorRating;
    const professorStatistics = statistics as ProfessorPercentages;

    // Calculate new professor averages
    const newProfRatings: ProfessorRating = {
      overall: calculateNewAverage(currentProfStats.ratings.overall, profTotalReviews, professorRatings.overall),
      teaching: calculateNewAverage(currentProfStats.ratings.teaching, profTotalReviews, professorRatings.teaching),
      helpfulness: calculateNewAverage(
        currentProfStats.ratings.helpfulness,
        profTotalReviews,
        professorRatings.helpfulness
      ),
      fairness: calculateNewAverage(currentProfStats.ratings.fairness, profTotalReviews, professorRatings.fairness),
      clarity: calculateNewAverage(currentProfStats.ratings.clarity, profTotalReviews, professorRatings.clarity),
      communication: calculateNewAverage(
        currentProfStats.ratings.communication,
        profTotalReviews,
        professorRatings.communication
      )
    };

    // Calculate new professor percentages
    const newProfPercentages: ProfessorPercentages = {
      wouldRecommend: calculateNewPercentage(
        currentProfStats.percentages.wouldRecommend,
        profTotalReviews,
        professorStatistics.wouldRecommend,
        true
      ),
      attendanceRating: calculateNewPercentage(
        currentProfStats.percentages.attendanceRating,
        profTotalReviews,
        professorStatistics.attendanceRating,
        false
      ),
      quizes: calculateNewPercentage(
        currentProfStats.percentages.quizes,
        profTotalReviews,
        professorStatistics.quizes,
        true
      ),
      assignments: calculateNewPercentage(
        currentProfStats.percentages.assignments,
        profTotalReviews,
        professorStatistics.assignments,
        true
      )
    };

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

    if (grade) {
      const averageGradeString = calculateNewGradeAverage(
        currentCourseStats.percentages.averageGrade,
        currentCourseStats.totalReviews,
        grade
      );

      // Calculate new course percentages
      const newCoursePercentages: CoursePercentages = {
        wouldRecommend: currentCourseStats.percentages.wouldRecommend,
        attendanceRating: currentCourseStats.percentages.attendanceRating,
        quizes: currentCourseStats.percentages.quizes,
        assignments: currentCourseStats.percentages.assignments,
        averageGrade: averageGradeString
      };

      // Update course statistics
      await tx.course.update({
        where: { code: courseCode },
        data: {
          statistics: {
            ratings: JSON.parse(JSON.stringify(currentCourseStats.ratings)),
            percentages: JSON.parse(JSON.stringify(newCoursePercentages)),
            totalReviews: currentCourseStats.totalReviews
          }
        }
      });
    }

    // Update department average rating for professor review
    const department = await tx.department.findUnique({
      where: { code: professor.departmentCode }
    });

    if (department) {
      const weight = 8; // Using 8 as weight for professor reviews
      const newTotalWeightedSum = department.totalWeightedSum + ratings.overall * weight;
      const newTotalWeight = department.totalWeight + weight;
      const newAvgRating = safeClamp(newTotalWeightedSum / newTotalWeight, 0, 5);

      await tx.department.update({
        where: { code: professor.departmentCode },
        data: {
          totalWeightedSum: newTotalWeightedSum,
          totalWeight: newTotalWeight,
          numReviews: {
            increment: 1
          },
          avgRating: newAvgRating
        }
      });
    }
  } else if (type === 'course') {
    const courseTotalReviews = currentCourseStats.totalReviews;
    const newCourseTotalReviews = courseTotalReviews + 1;

    // Type narrow ratings and statistics for course case
    const courseRatings = ratings as CourseRating;
    const courseStatistics = statistics as CoursePercentages;

    // Calculate new course averages
    const newCourseRatings: CourseRating = {
      overall: calculateNewAverage(currentCourseStats.ratings.overall, courseTotalReviews, courseRatings.overall),
      scoring: calculateNewAverage(currentCourseStats.ratings.scoring, courseTotalReviews, courseRatings.scoring),
      engaging: calculateNewAverage(currentCourseStats.ratings.engaging, courseTotalReviews, courseRatings.engaging),
      conceptual: calculateNewAverage(
        currentCourseStats.ratings.conceptual,
        courseTotalReviews,
        courseRatings.conceptual
      ),
      easyToLearn: calculateNewAverage(
        currentCourseStats.ratings.easyToLearn,
        courseTotalReviews,
        courseRatings.easyToLearn
      )
    };

    const averageGradeString = grade
      ? calculateNewGradeAverage(currentCourseStats.percentages.averageGrade, courseTotalReviews, grade)
      : currentCourseStats.percentages.averageGrade;

    // Calculate new course percentages
    const newCoursePercentages: CoursePercentages = {
      wouldRecommend: calculateNewPercentage(
        currentCourseStats.percentages.wouldRecommend,
        courseTotalReviews,
        courseStatistics.wouldRecommend,
        true
      ),
      attendanceRating: calculateNewPercentage(
        currentCourseStats.percentages.attendanceRating,
        courseTotalReviews,
        courseStatistics.attendanceRating,
        false
      ),
      quizes: calculateNewPercentage(
        currentCourseStats.percentages.quizes,
        courseTotalReviews,
        courseStatistics.quizes,
        true
      ),
      assignments: calculateNewPercentage(
        currentCourseStats.percentages.assignments,
        courseTotalReviews,
        courseStatistics.assignments,
        true
      ),
      averageGrade: averageGradeString
    };

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

    // Update department average rating for course review
    const department = await tx.department.findUnique({
      where: { code: course.departmentCode }
    });

    if (department) {
      const weight = course.credits; // Using course credits as weight
      const newTotalWeightedSum = department.totalWeightedSum + ratings.overall * weight;
      const newTotalWeight = department.totalWeight + weight;
      const newAvgRating = safeClamp(newTotalWeightedSum / newTotalWeight, 0, 5);
      await tx.department.update({
        where: { code: course.departmentCode },
        data: {
          totalWeightedSum: newTotalWeightedSum,
          totalWeight: newTotalWeight,
          numReviews: {
            increment: 1
          },
          avgRating: newAvgRating
        }
      });
    }
  } else {
    throw new Error('Invalid review type');
  }
}
