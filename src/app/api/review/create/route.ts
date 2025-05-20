import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';

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
                  totalReviews: currentCourseStats.totalReviews + 1
                }
              }
            });
          }

          // Update department average rating for professor review
          const department = await tx.department.findUnique({
            where: { code: professor.departmentCode }
          });

          if (department) {
            const currentWeightedSum = department.avgRating * department.numReviews;
            const newWeightedSum = currentWeightedSum + ratings.overall * 8; // Using 8 as weight for professor reviews
            const newTotalWeight = department.numReviews + 8;
            const newAvgRating = Number((newWeightedSum / newTotalWeight).toFixed(1));

            await tx.department.update({
              where: { code: professor.departmentCode },
              data: {
                avgRating: newAvgRating,
                numReviews: department.numReviews + 1
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

          let averageGradeString = 'NA';

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
            const currentWeightedSum = department.avgRating * department.numReviews;
            const newWeightedSum = currentWeightedSum + ratings.overall * course.credits; // Using course credits as weight
            const newTotalWeight = department.numReviews + course.credits;
            const newAvgRating = Number((newWeightedSum / newTotalWeight).toFixed(1));

            await tx.department.update({
              where: { code: course.departmentCode },
              data: {
                avgRating: newAvgRating,
                numReviews: department.numReviews + 1
              }
            });
          }
        } else {
          throw new Error('Invalid review type');
        }

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
