import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';
import { convertNumberToGrade, gradeNumberMap } from '@/lib/utils';

import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      professorId,
      courseCode,
      semester,
      anonymous = false,
      ratings,
      comment,
      statistics,
      grade,
      type
    } = (await req.json()) as CreateReviewApiData;

    // Validate required fields
    if (!professorId || !courseCode || !semester || !ratings || !comment || !statistics || !type) {
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
                  .groupBy({
                    by: ['courseCode'],
                    where: {
                      professorId,
                      type: 'professor'
                    },
                    _count: true
                  })
                  .then((result) => result.length)
              }
            }
          }),
          tx.course.update({
            where: { code: courseCode },
            data: {
              totalProfessors: {
                set: await tx.review
                  .groupBy({
                    by: ['professorId'],
                    where: {
                      courseCode,
                      type: 'course'
                    },
                    _count: true
                  })
                  .then((result) => result.length)
              }
            }
          })
        ]);

        if (type === 'professor') {
          const profTotalReviews = currentProfStats.totalReviews;
          const newProfTotalReviews = profTotalReviews + 1;

          // Type narrow ratings and statistics for course case
          const professorRatings = ratings as ProfessorRating;
          const professorStatistics = statistics as ProfessorPercentages;

          // Calculate new professor averages
          const newProfRatings: ProfessorRating = {
            overall: Number(
              (
                (currentProfStats.ratings.overall * profTotalReviews + professorRatings.overall) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            teaching: Number(
              (
                (currentProfStats.ratings.teaching * profTotalReviews + professorRatings.teaching) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            helpfulness: Number(
              (
                (currentProfStats.ratings.helpfulness * profTotalReviews + professorRatings.helpfulness) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            fairness: Number(
              (
                (currentProfStats.ratings.fairness * profTotalReviews + professorRatings.fairness) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            clarity: Number(
              (
                (currentProfStats.ratings.clarity * profTotalReviews + professorRatings.clarity) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            communication: Number(
              (
                (currentProfStats.ratings.communication * profTotalReviews + professorRatings.communication) /
                newProfTotalReviews
              ).toFixed(1)
            )
          };

          // Calculate new professor percentages
          const newProfPercentages: ProfessorPercentages = {
            wouldRecommend: Number(
              (
                (currentProfStats.percentages.wouldRecommend * profTotalReviews +
                  professorStatistics.wouldRecommend * 100) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            attendanceRating: Number(
              (
                (currentProfStats.percentages.attendanceRating * profTotalReviews +
                  professorStatistics.attendanceRating) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            quizes: Number(
              (
                (currentProfStats.percentages.quizes * profTotalReviews + professorStatistics.quizes * 100) /
                newProfTotalReviews
              ).toFixed(1)
            ),
            assignments: Number(
              (
                (currentProfStats.percentages.assignments * profTotalReviews + professorStatistics.assignments * 100) /
                newProfTotalReviews
              ).toFixed(1)
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
            let averageGradeString = 'NA';

            if (currentCourseStats.percentages.averageGrade === 'NA') {
              averageGradeString = grade;
            } else {
              averageGradeString = convertNumberToGrade(
                (gradeNumberMap[currentCourseStats.percentages.averageGrade] * currentCourseStats.totalReviews +
                  gradeNumberMap[grade]) /
                  (currentCourseStats.totalReviews + 1)
              );
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
            await tx.department.update({
              where: { code: professor.departmentCode },
              data: {
                totalWeightedSum: {
                  increment: ratings.overall * weight
                },
                totalWeight: {
                  increment: weight
                },
                numReviews: {
                  increment: 1
                },
                avgRating: {
                  set: Number(
                    (
                      (department.totalWeightedSum + ratings.overall * weight) /
                      (department.totalWeight + weight)
                    ).toFixed(1)
                  )
                }
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
            overall: Number(
              (
                (currentCourseStats.ratings.overall * courseTotalReviews + courseRatings.overall) /
                newCourseTotalReviews
              ).toFixed(1)
            ),
            difficulty: Number(
              (
                (currentCourseStats.ratings.difficulty * courseTotalReviews + courseRatings.difficulty) /
                newCourseTotalReviews
              ).toFixed(1)
            ),
            workload: Number(
              (
                (currentCourseStats.ratings.workload * courseTotalReviews + courseRatings.workload) /
                newCourseTotalReviews
              ).toFixed(1)
            ),
            content: Number(
              (
                (currentCourseStats.ratings.content * courseTotalReviews + courseRatings.content) /
                newCourseTotalReviews
              ).toFixed(1)
            ),
            numerical: Number(
              (
                (currentCourseStats.ratings.numerical * courseTotalReviews + courseRatings.numerical) /
                newCourseTotalReviews
              ).toFixed(1)
            )
          };

          let averageGradeString = currentCourseStats.percentages.averageGrade;

          if (grade) {
            if (currentCourseStats.percentages.averageGrade === 'NA') {
              averageGradeString = grade;
            } else {
              averageGradeString = convertNumberToGrade(
                (gradeNumberMap[currentCourseStats.percentages.averageGrade] * courseTotalReviews +
                  gradeNumberMap[grade]) /
                  newCourseTotalReviews
              );
            }
          } else {
            averageGradeString = currentCourseStats.percentages.averageGrade;
          }

          // Calculate new course percentages
          const newCoursePercentages: CoursePercentages = {
            wouldRecommend: Number(
              (
                (currentCourseStats.percentages.wouldRecommend * courseTotalReviews +
                  courseStatistics.wouldRecommend * 100) /
                newCourseTotalReviews
              ).toFixed(1)
            ),
            attendanceRating: Number(
              (
                (currentCourseStats.percentages.attendanceRating * courseTotalReviews +
                  courseStatistics.attendanceRating) /
                newCourseTotalReviews
              ).toFixed(1)
            ),
            quizes: Number(
              (
                (currentCourseStats.percentages.quizes * courseTotalReviews + courseStatistics.quizes * 100) /
                newCourseTotalReviews
              ).toFixed(1)
            ),
            assignments: Number(
              (
                (currentCourseStats.percentages.assignments * courseTotalReviews + courseStatistics.assignments * 100) /
                newCourseTotalReviews
              ).toFixed(1)
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
            await tx.department.update({
              where: { code: course.departmentCode },
              data: {
                totalWeightedSum: {
                  increment: ratings.overall * weight
                },
                totalWeight: {
                  increment: weight
                },
                numReviews: {
                  increment: 1
                },
                avgRating: {
                  set: Number(
                    (
                      (department.totalWeightedSum + ratings.overall * weight) /
                      (department.totalWeight + weight)
                    ).toFixed(1)
                  )
                }
              }
            });
          }
        } else {
          throw new Error('Invalid review type');
        }

        // Create the review
        const review = await tx.review.create({
          data: {
            professorId,
            courseCode,
            userId,
            semester,
            anonymous,
            ratings: JSON.parse(JSON.stringify(ratings)),
            comment,
            statistics: JSON.parse(JSON.stringify(statistics)),
            grade,
            type
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
