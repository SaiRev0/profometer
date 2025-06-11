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
    if (
      existingReview.userId !== (session.user as { id: string }).id && // Check if user is the author of the review
      (session.user as { id: string }).id !== process.env.ADMIN_ID // Admin ID is used to delete reviews
    ) {
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
            overall: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.ratings.overall * profTotalReviews -
                      oldProfessorRatings.overall +
                      professorRatings.overall) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            teaching: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.ratings.teaching * profTotalReviews -
                      oldProfessorRatings.teaching +
                      professorRatings.teaching) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            helpfulness: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.ratings.helpfulness * profTotalReviews -
                      oldProfessorRatings.helpfulness +
                      professorRatings.helpfulness) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            fairness: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.ratings.fairness * profTotalReviews -
                      oldProfessorRatings.fairness +
                      professorRatings.fairness) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            clarity: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.ratings.clarity * profTotalReviews -
                      oldProfessorRatings.clarity +
                      professorRatings.clarity) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            communication: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.ratings.communication * profTotalReviews -
                      oldProfessorRatings.communication +
                      professorRatings.communication) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            )
          };

          // Calculate new professor percentages
          const newProfPercentages: ProfessorPercentages = {
            wouldRecommend: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.percentages.wouldRecommend * profTotalReviews -
                      oldProfessorStatistics.wouldRecommend * 100 +
                      professorStatistics.wouldRecommend * 100) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            attendanceRating: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.percentages.attendanceRating * profTotalReviews -
                      oldProfessorStatistics.attendanceRating +
                      professorStatistics.attendanceRating) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            quizes: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.percentages.quizes * profTotalReviews -
                      oldProfessorStatistics.quizes * 100 +
                      professorStatistics.quizes * 100) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            assignments: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentProfStats.percentages.assignments * profTotalReviews -
                      oldProfessorStatistics.assignments * 100 +
                      professorStatistics.assignments * 100) /
                    profTotalReviews
                  ).toFixed(1)
                )
              )
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
          let averageGradeString = currentCourseStats.percentages.averageGrade;

          if (currentCourseStats.percentages.averageGrade === 'NA') {
            averageGradeString = reviewData.grade ? reviewData.grade : 'NA';
          } else {
            if (existingReview.grade) {
              if (reviewData.grade) {
                // If both old and new grades exist, recalculate average
                const oldGradeValue = gradeNumberMap[existingReview.grade];
                const newGradeValue = gradeNumberMap[reviewData.grade];
                const totalGradeValue =
                  (gradeNumberMap[currentCourseStats.percentages.averageGrade] * currentCourseStats.totalReviews -
                    oldGradeValue +
                    newGradeValue) /
                  currentCourseStats.totalReviews;
                averageGradeString = convertNumberToGrade(totalGradeValue);
              } else {
                // If only old grade exists but new one doesn't, remove old grade from average
                const oldGradeValue = gradeNumberMap[existingReview.grade];
                const totalGradeValue =
                  (gradeNumberMap[currentCourseStats.percentages.averageGrade] * currentCourseStats.totalReviews -
                    oldGradeValue) /
                  (currentCourseStats.totalReviews - 1);
                averageGradeString = convertNumberToGrade(totalGradeValue);
              }
            } else {
              // If old grade doesn't exist, just adjust for the new grade
              if (reviewData.grade) {
                // If both old and new grades exist, recalculate average
                const newGradeValue = gradeNumberMap[reviewData.grade];
                const totalGradeValue =
                  (gradeNumberMap[currentCourseStats.percentages.averageGrade] * currentCourseStats.totalReviews +
                    newGradeValue) /
                    currentCourseStats.totalReviews +
                  1;
                averageGradeString = convertNumberToGrade(totalGradeValue);
              } else {
                // If new grade also does not exists, keep the current average grade
                averageGradeString = currentCourseStats.percentages.averageGrade;
              }
            }
          }

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
            const newAvgRating = Math.min(
              5,
              Math.max(0, Number((newTotalWeightedSum / department.totalWeight).toFixed(1)))
            );

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
            overall: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.ratings.overall * courseTotalReviews -
                      oldCourseRatings.overall +
                      courseRatings.overall) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            scoring: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.ratings.scoring * courseTotalReviews -
                      oldCourseRatings.scoring +
                      courseRatings.scoring) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            engaging: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.ratings.engaging * courseTotalReviews -
                      oldCourseRatings.engaging +
                      courseRatings.engaging) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            conceptual: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.ratings.conceptual * courseTotalReviews -
                      oldCourseRatings.conceptual +
                      courseRatings.conceptual) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            easyToLearn: Math.min(
              5,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.ratings.easyToLearn * courseTotalReviews -
                      oldCourseRatings.easyToLearn +
                      courseRatings.easyToLearn) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            )
          };

          // Update Grades
          let averageGradeString = currentCourseStats.percentages.averageGrade;

          if (currentCourseStats.percentages.averageGrade === 'NA') {
            averageGradeString = reviewData.grade ? reviewData.grade : 'NA';
          } else {
            if (existingReview.grade) {
              if (reviewData.grade) {
                // If both old and new grades exist, recalculate average
                const oldGradeValue = gradeNumberMap[existingReview.grade];
                const newGradeValue = gradeNumberMap[reviewData.grade];
                const totalGradeValue =
                  (gradeNumberMap[currentCourseStats.percentages.averageGrade] * currentCourseStats.totalReviews -
                    oldGradeValue +
                    newGradeValue) /
                  currentCourseStats.totalReviews;
                averageGradeString = convertNumberToGrade(totalGradeValue);
              } else {
                // If only old grade exists but new one doesn't, remove old grade from average
                const oldGradeValue = gradeNumberMap[existingReview.grade];
                const totalGradeValue =
                  (gradeNumberMap[currentCourseStats.percentages.averageGrade] * currentCourseStats.totalReviews -
                    oldGradeValue) /
                  (currentCourseStats.totalReviews - 1);
                averageGradeString = convertNumberToGrade(totalGradeValue);
              }
            } else {
              // If old grade doesn't exist, just adjust for the new grade
              if (reviewData.grade) {
                // If both old and new grades exist, recalculate average
                const newGradeValue = gradeNumberMap[reviewData.grade];
                const totalGradeValue =
                  (gradeNumberMap[currentCourseStats.percentages.averageGrade] * currentCourseStats.totalReviews +
                    newGradeValue) /
                    currentCourseStats.totalReviews +
                  1;
                averageGradeString = convertNumberToGrade(totalGradeValue);
              } else {
                // If new grade also does not exists, keep the current average grade
                averageGradeString = currentCourseStats.percentages.averageGrade;
              }
            }
          }

          // Calculate new course percentages
          const newCoursePercentages: CoursePercentages = {
            wouldRecommend: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.percentages.wouldRecommend * courseTotalReviews -
                      oldCourseStatistics.wouldRecommend * 100 +
                      courseStatistics.wouldRecommend * 100) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            attendanceRating: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.percentages.attendanceRating * courseTotalReviews -
                      oldCourseStatistics.attendanceRating +
                      courseStatistics.attendanceRating) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            quizes: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.percentages.quizes * courseTotalReviews -
                      oldCourseStatistics.quizes * 100 +
                      courseStatistics.quizes * 100) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
            ),
            assignments: Math.min(
              100,
              Math.max(
                0,
                Number(
                  (
                    (currentCourseStats.percentages.assignments * courseTotalReviews -
                      oldCourseStatistics.assignments * 100 +
                      courseStatistics.assignments * 100) /
                    courseTotalReviews
                  ).toFixed(1)
                )
              )
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
            const newAvgRating = Math.min(
              5,
              Math.max(0, Number((newTotalWeightedSum / department.totalWeight).toFixed(1)))
            );
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
            anonymous: reviewData.anonymous,
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
