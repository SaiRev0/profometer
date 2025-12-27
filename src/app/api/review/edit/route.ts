import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';
import {
  calculateUpdatedAverage,
  calculateUpdatedGradeAverage,
  calculateUpdatedPercentage,
  safeClamp
} from '@/lib/utils';

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

    // Prevent changing review target during edit
    if (existingReview.professorId !== reviewData.professorId || existingReview.courseCode !== reviewData.courseCode) {
      return NextResponse.json({ error: 'Cannot change professor or course when editing a review' }, { status: 400 });
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

        // Update professor's totalCourses and course's totalProfessors in a single query each
        await Promise.all([
          tx.professor.update({
            where: { id: reviewData.professorId },
            data: {
              totalCourses: {
                set: await tx.review
                  .findMany({
                    where: {
                      professorId: reviewData.professorId,
                      type: 'professor',
                      NOT: {
                        id: reviewId
                      }
                    },
                    select: {
                      courseCode: true
                    },
                    distinct: ['courseCode']
                  })
                  .then((courses) => {
                    // Add 1 if the new course is not in the existing courses
                    return courses.length + (courses.some((c) => c.courseCode === reviewData.courseCode) ? 0 : 1);
                  })
              }
            }
          }),
          tx.course.update({
            where: { code: reviewData.courseCode },
            data: {
              totalProfessors: {
                set: await tx.review
                  .findMany({
                    where: {
                      courseCode: reviewData.courseCode,
                      type: 'course',
                      NOT: {
                        id: reviewId
                      }
                    },
                    select: {
                      professorId: true
                    },
                    distinct: ['professorId']
                  })
                  .then((professors) => {
                    // Add 1 if the new professor is not in the existing professors
                    return (
                      professors.length + (professors.some((p) => p.professorId === reviewData.professorId) ? 0 : 1)
                    );
                  })
              }
            }
          })
        ]);

        // Update statistics based on review type
        if (reviewData.type === 'professor') {
          const profTotalReviews = currentProfStats.totalReviews;

          // New data
          const professorRatings = reviewData.ratings as ProfessorRating;
          const professorStatistics = reviewData.statistics as ProfessorPercentages;

          // Old data
          const oldProfessorRatings = existingReview.ratings as unknown as ProfessorRating;
          const oldProfessorStatistics = existingReview.statistics as unknown as ProfessorPercentages;

          // Calculate new professor averages
          const newProfRatings: ProfessorRating = {
            overall: calculateUpdatedAverage(
              currentProfStats.ratings.overall,
              profTotalReviews,
              oldProfessorRatings.overall,
              professorRatings.overall
            ),
            teaching: calculateUpdatedAverage(
              currentProfStats.ratings.teaching,
              profTotalReviews,
              oldProfessorRatings.teaching,
              professorRatings.teaching
            ),
            helpfulness: calculateUpdatedAverage(
              currentProfStats.ratings.helpfulness,
              profTotalReviews,
              oldProfessorRatings.helpfulness,
              professorRatings.helpfulness
            ),
            fairness: calculateUpdatedAverage(
              currentProfStats.ratings.fairness,
              profTotalReviews,
              oldProfessorRatings.fairness,
              professorRatings.fairness
            ),
            clarity: calculateUpdatedAverage(
              currentProfStats.ratings.clarity,
              profTotalReviews,
              oldProfessorRatings.clarity,
              professorRatings.clarity
            ),
            communication: calculateUpdatedAverage(
              currentProfStats.ratings.communication,
              profTotalReviews,
              oldProfessorRatings.communication,
              professorRatings.communication
            )
          };

          // Calculate new professor percentages
          const newProfPercentages: ProfessorPercentages = {
            wouldRecommend: calculateUpdatedPercentage(
              currentProfStats.percentages.wouldRecommend,
              profTotalReviews,
              oldProfessorStatistics.wouldRecommend,
              professorStatistics.wouldRecommend,
              true
            ),
            attendanceRating: calculateUpdatedPercentage(
              currentProfStats.percentages.attendanceRating,
              profTotalReviews,
              oldProfessorStatistics.attendanceRating,
              professorStatistics.attendanceRating,
              false
            ),
            quizes: calculateUpdatedPercentage(
              currentProfStats.percentages.quizes,
              profTotalReviews,
              oldProfessorStatistics.quizes,
              professorStatistics.quizes,
              true
            ),
            assignments: calculateUpdatedPercentage(
              currentProfStats.percentages.assignments,
              profTotalReviews,
              oldProfessorStatistics.assignments,
              professorStatistics.assignments,
              true
            )
          };

          // Update professor statistics
          await tx.professor.update({
            where: { id: reviewData.professorId },
            data: {
              statistics: {
                ratings: JSON.parse(JSON.stringify(newProfRatings)),
                percentages: JSON.parse(JSON.stringify(newProfPercentages)),
                totalReviews: profTotalReviews
              }
            }
          });

          // Update Grades
          const averageGradeString = calculateUpdatedGradeAverage(
            currentCourseStats.percentages.averageGrade,
            currentCourseStats.totalReviews,
            existingReview.grade || null,
            reviewData.grade || null
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
            where: { code: reviewData.courseCode },
            data: {
              statistics: {
                ratings: JSON.parse(JSON.stringify(currentCourseStats.ratings)),
                percentages: JSON.parse(JSON.stringify(newCoursePercentages)),
                totalReviews: currentCourseStats.totalReviews
              }
            }
          });

          // Update department average rating
          const department = await tx.department.findUnique({
            where: { code: professor.departmentCode }
          });

          if (department) {
            const weight = 8; // Using 8 as weight for professor reviews
            const newTotalWeightedSum =
              department.totalWeightedSum - oldProfessorRatings.overall * weight + professorRatings.overall * weight;
            const newAvgRating = safeClamp(newTotalWeightedSum / department.totalWeight, 0, 5);

            await tx.department.update({
              where: { code: professor.departmentCode },
              data: {
                totalWeightedSum: newTotalWeightedSum,
                // totalWeight remains the same since weight is constant for professor reviews
                avgRating: newAvgRating
              }
            });
          }
        } else if (reviewData.type === 'course') {
          const courseTotalReviews = currentCourseStats.totalReviews;

          // New data
          const courseRatings = reviewData.ratings as CourseRating;
          const courseStatistics = reviewData.statistics as CoursePercentages;

          // Old data
          const oldCourseRatings = existingReview.ratings as unknown as CourseRating;
          const oldCourseStatistics = existingReview.statistics as unknown as CoursePercentages;

          // Calculate new course averages
          const newCourseRatings: CourseRating = {
            overall: calculateUpdatedAverage(
              currentCourseStats.ratings.overall,
              courseTotalReviews,
              oldCourseRatings.overall,
              courseRatings.overall
            ),
            scoring: calculateUpdatedAverage(
              currentCourseStats.ratings.scoring,
              courseTotalReviews,
              oldCourseRatings.scoring,
              courseRatings.scoring
            ),
            engaging: calculateUpdatedAverage(
              currentCourseStats.ratings.engaging,
              courseTotalReviews,
              oldCourseRatings.engaging,
              courseRatings.engaging
            ),
            conceptual: calculateUpdatedAverage(
              currentCourseStats.ratings.conceptual,
              courseTotalReviews,
              oldCourseRatings.conceptual,
              courseRatings.conceptual
            ),
            easyToLearn: calculateUpdatedAverage(
              currentCourseStats.ratings.easyToLearn,
              courseTotalReviews,
              oldCourseRatings.easyToLearn,
              courseRatings.easyToLearn
            )
          };

          // Update Grades
          const averageGradeString = calculateUpdatedGradeAverage(
            currentCourseStats.percentages.averageGrade,
            currentCourseStats.totalReviews,
            existingReview.grade || null,
            reviewData.grade || null
          );

          // Calculate new course percentages
          const newCoursePercentages: CoursePercentages = {
            wouldRecommend: calculateUpdatedPercentage(
              currentCourseStats.percentages.wouldRecommend,
              courseTotalReviews,
              oldCourseStatistics.wouldRecommend,
              courseStatistics.wouldRecommend,
              true
            ),
            attendanceRating: calculateUpdatedPercentage(
              currentCourseStats.percentages.attendanceRating,
              courseTotalReviews,
              oldCourseStatistics.attendanceRating,
              courseStatistics.attendanceRating,
              false
            ),
            quizes: calculateUpdatedPercentage(
              currentCourseStats.percentages.quizes,
              courseTotalReviews,
              oldCourseStatistics.quizes,
              courseStatistics.quizes,
              true
            ),
            assignments: calculateUpdatedPercentage(
              currentCourseStats.percentages.assignments,
              courseTotalReviews,
              oldCourseStatistics.assignments,
              courseStatistics.assignments,
              true
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
                totalReviews: currentCourseStats.totalReviews
              }
            }
          });

          // Update department average rating
          const department = await tx.department.findUnique({
            where: { code: course.departmentCode }
          });

          if (department) {
            const weight = course.credits;
            const newTotalWeightedSum =
              department.totalWeightedSum - oldCourseRatings.overall * weight + courseRatings.overall * weight;
            const newAvgRating = safeClamp(newTotalWeightedSum / department.totalWeight, 0, 5);
            await tx.department.update({
              where: { code: course.departmentCode },
              data: {
                totalWeightedSum: newTotalWeightedSum,
                // totalWeight remains the same since course credits don't change
                avgRating: newAvgRating
              }
            });
          }
        } else {
          throw new Error('Invalid review type');
        }

        // Update the review
        const updatedReview = await tx.review.update({
          where: { id: reviewId },
          data: {
            professorId: reviewData.professorId,
            courseCode: reviewData.courseCode,
            semester: reviewData.semester,
            ratings: JSON.parse(JSON.stringify(reviewData.ratings)),
            comment: reviewData.comment,
            statistics: JSON.parse(JSON.stringify(reviewData.statistics)),
            grade: reviewData.grade,
            type: reviewData.type,
            updatedAt: new Date()
          }
        });

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
