import { NextResponse } from 'next/server';

import { isAdminUser } from '@/lib/admin-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';
import {
  calculateAverageAfterRemoval,
  calculateGradeAverageAfterRemoval,
  calculatePercentageAfterRemoval,
  safeClamp
} from '@/lib/utils';

import { getServerSession } from 'next-auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if review exists and belongs to the user
    const review = await db.review.findUnique({
      where: { id },
      include: {
        professor: true,
        course: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if user is the author of the review or an admin
    const userId = (session.user as { id: string }).id;
    if (review.userId !== userId && !isAdminUser(userId)) {
      return NextResponse.json({ error: 'Unauthorized to delete this review' }, { status: 403 });
    }

    // Start a transaction to delete review and update statistics
    await db.$transaction(async (tx) => {
      // Update professor's totalCourses and course's totalProfessors in a single query each
      await Promise.all([
        tx.professor.update({
          where: { id: review.professorId },
          data: {
            totalCourses: {
              set: await tx.review
                .findMany({
                  where: {
                    professorId: review.professorId,
                    type: 'professor',
                    NOT: {
                      id: id
                    }
                  },
                  select: {
                    courseCode: true
                  },
                  distinct: ['courseCode']
                })
                .then((courses) => courses.length)
            }
          }
        }),
        tx.course.update({
          where: { code: review.courseCode },
          data: {
            totalProfessors: {
              set: await tx.review
                .findMany({
                  where: {
                    courseCode: review.courseCode,
                    type: 'course',
                    NOT: {
                      id: id
                    }
                  },
                  select: {
                    professorId: true
                  },
                  distinct: ['professorId']
                })
                .then((professors) => professors.length)
            }
          }
        })
      ]);

      // Update professor statistics if it's a professor review
      if (review.type === 'professor' && review.professor) {
        const professor = review.professor;
        const currentStats = JSON.parse(JSON.stringify(professor.statistics)) as {
          ratings: ProfessorRating;
          percentages: ProfessorPercentages;
          totalReviews: number;
        };

        // Only update if there are other reviews
        const reviewRatings = JSON.parse(JSON.stringify(review.ratings)) as ProfessorRating;
        const reviewStatistics = JSON.parse(JSON.stringify(review.statistics)) as ProfessorPercentages;
        const newTotalReviews = Math.max(0, currentStats.totalReviews - 1);

        // Recalculate professor ratings
        const newProfRatings: ProfessorRating = {
          overall: calculateAverageAfterRemoval(
            currentStats.ratings.overall,
            currentStats.totalReviews,
            reviewRatings.overall
          ),
          teaching: calculateAverageAfterRemoval(
            currentStats.ratings.teaching,
            currentStats.totalReviews,
            reviewRatings.teaching
          ),
          helpfulness: calculateAverageAfterRemoval(
            currentStats.ratings.helpfulness,
            currentStats.totalReviews,
            reviewRatings.helpfulness
          ),
          fairness: calculateAverageAfterRemoval(
            currentStats.ratings.fairness,
            currentStats.totalReviews,
            reviewRatings.fairness
          ),
          clarity: calculateAverageAfterRemoval(
            currentStats.ratings.clarity,
            currentStats.totalReviews,
            reviewRatings.clarity
          ),
          communication: calculateAverageAfterRemoval(
            currentStats.ratings.communication,
            currentStats.totalReviews,
            reviewRatings.communication
          )
        };

        // Recalculate professor percentages
        const newProfPercentages: ProfessorPercentages = {
          wouldRecommend: calculatePercentageAfterRemoval(
            currentStats.percentages.wouldRecommend,
            currentStats.totalReviews,
            reviewStatistics.wouldRecommend,
            true
          ),
          attendanceRating: calculatePercentageAfterRemoval(
            currentStats.percentages.attendanceRating,
            currentStats.totalReviews,
            reviewStatistics.attendanceRating,
            false
          ),
          quizes: calculatePercentageAfterRemoval(
            currentStats.percentages.quizes,
            currentStats.totalReviews,
            reviewStatistics.quizes,
            true
          ),
          assignments: calculatePercentageAfterRemoval(
            currentStats.percentages.assignments,
            currentStats.totalReviews,
            reviewStatistics.assignments,
            true
          )
        };

        // Update professor statistics
        await tx.professor.update({
          where: { id: professor.id },
          data: {
            statistics: {
              ratings: JSON.parse(JSON.stringify(newProfRatings)),
              percentages: JSON.parse(JSON.stringify(newProfPercentages)),
              totalReviews: newTotalReviews
            }
          }
        });

        // Update department statistics
        const department = await tx.department.findUnique({
          where: { code: professor.departmentCode }
        });

        if (department) {
          const weight = 8; // Using 8 as weight for professor reviews
          const newTotalWeightedSum = Math.max(0, department.totalWeightedSum - reviewRatings.overall * weight);
          const newTotalWeight = Math.max(0, department.totalWeight - weight);
          const newAvgRating = newTotalWeight > 0 ? safeClamp(newTotalWeightedSum / newTotalWeight, 0, 5) : 0;

          await tx.department.update({
            where: { code: professor.departmentCode },
            data: {
              totalWeightedSum: newTotalWeightedSum,
              totalWeight: {
                set: newTotalWeight
              },
              numReviews: {
                set: Math.max(0, department.numReviews - 1)
              },
              avgRating: newAvgRating
            }
          });
        }
      }

      // Update course statistics if it's a course review
      if (review.type === 'course' && review.course) {
        const course = review.course;
        const currentStats = JSON.parse(JSON.stringify(course.statistics)) as {
          ratings: CourseRating;
          percentages: CoursePercentages;
          totalReviews: number;
        };

        // Only update if there are other reviews
        const reviewRatings = JSON.parse(JSON.stringify(review.ratings)) as CourseRating;
        const reviewStatistics = JSON.parse(JSON.stringify(review.statistics)) as CoursePercentages;
        const newTotalReviews = Math.max(0, currentStats.totalReviews - 1);

        // Recalculate course ratings
        const newCourseRatings: CourseRating = {
          overall: calculateAverageAfterRemoval(
            currentStats.ratings.overall,
            currentStats.totalReviews,
            reviewRatings.overall
          ),
          scoring: calculateAverageAfterRemoval(
            currentStats.ratings.scoring,
            currentStats.totalReviews,
            reviewRatings.scoring
          ),
          engaging: calculateAverageAfterRemoval(
            currentStats.ratings.engaging,
            currentStats.totalReviews,
            reviewRatings.engaging
          ),
          conceptual: calculateAverageAfterRemoval(
            currentStats.ratings.conceptual,
            currentStats.totalReviews,
            reviewRatings.conceptual
          ),
          easyToLearn: calculateAverageAfterRemoval(
            currentStats.ratings.easyToLearn,
            currentStats.totalReviews,
            reviewRatings.easyToLearn
          )
        };

        // Handle grade recalculation
        const averageGradeString = review.grade
          ? calculateGradeAverageAfterRemoval(
              currentStats.percentages.averageGrade,
              currentStats.totalReviews,
              review.grade
            )
          : currentStats.percentages.averageGrade;

        // Calculate new course percentages
        const newCoursePercentages: CoursePercentages = {
          wouldRecommend: calculatePercentageAfterRemoval(
            currentStats.percentages.wouldRecommend,
            currentStats.totalReviews,
            reviewStatistics.wouldRecommend,
            true
          ),
          attendanceRating: calculatePercentageAfterRemoval(
            currentStats.percentages.attendanceRating,
            currentStats.totalReviews,
            reviewStatistics.attendanceRating,
            false
          ),
          quizes: calculatePercentageAfterRemoval(
            currentStats.percentages.quizes,
            currentStats.totalReviews,
            reviewStatistics.quizes,
            true
          ),
          assignments: calculatePercentageAfterRemoval(
            currentStats.percentages.assignments,
            currentStats.totalReviews,
            reviewStatistics.assignments,
            true
          ),
          averageGrade: averageGradeString
        };

        // Update course statistics
        await tx.course.update({
          where: { code: course.code },
          data: {
            statistics: {
              ratings: JSON.parse(JSON.stringify(newCourseRatings)),
              percentages: JSON.parse(JSON.stringify(newCoursePercentages)),
              totalReviews: newTotalReviews
            }
          }
        });

        // Update department statistics
        const department = await tx.department.findUnique({
          where: { code: course.departmentCode }
        });

        if (department) {
          const weight = course.credits; // Using course credits as weight
          const newTotalWeightedSum = Math.max(0, department.totalWeightedSum - reviewRatings.overall * weight);
          const newTotalWeight = Math.max(0, department.totalWeight - weight);
          const newAvgRating = newTotalWeight > 0 ? safeClamp(newTotalWeightedSum / newTotalWeight, 0, 5) : 0;

          await tx.department.update({
            where: { code: course.departmentCode },
            data: {
              totalWeightedSum: newTotalWeightedSum,
              totalWeight: {
                set: newTotalWeight
              },
              numReviews: {
                set: Math.max(0, department.numReviews - 1)
              },
              avgRating: newAvgRating
            }
          });
        }
      }

      // Delete the review
      await tx.review.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
