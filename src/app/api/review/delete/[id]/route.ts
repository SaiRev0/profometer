import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CoursePercentages, CourseRating, ProfessorPercentages, ProfessorRating } from '@/lib/types';
import { convertNumberToGrade, gradeNumberMap } from '@/lib/utils';

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

    // Check if user is the author of the review
    if (
      review.userId !== (session.user as { id: string }).id && // Check if user is the author of the review
      (session.user as { id: string }).id !== process.env.ADMIN_ID // Admin ID is used to delete reviews
    ) {
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
          overall: Math.min(
            5,
            Math.max(
              0,
              Number(
                (
                  (currentStats.ratings.overall * currentStats.totalReviews - reviewRatings.overall) /
                  newTotalReviews
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
                  (currentStats.ratings.teaching * currentStats.totalReviews - reviewRatings.teaching) /
                  newTotalReviews
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
                  (currentStats.ratings.helpfulness * currentStats.totalReviews - reviewRatings.helpfulness) /
                  newTotalReviews
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
                  (currentStats.ratings.fairness * currentStats.totalReviews - reviewRatings.fairness) /
                  newTotalReviews
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
                  (currentStats.ratings.clarity * currentStats.totalReviews - reviewRatings.clarity) /
                  newTotalReviews
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
                  (currentStats.ratings.communication * currentStats.totalReviews - reviewRatings.communication) /
                  newTotalReviews
                ).toFixed(1)
              )
            )
          )
        };

        // Recalculate professor percentages
        const newProfPercentages: ProfessorPercentages = {
          wouldRecommend: Math.min(
            100,
            Math.max(
              0,
              Number(
                (
                  (currentStats.percentages.wouldRecommend * currentStats.totalReviews -
                    reviewStatistics.wouldRecommend * 100) /
                  newTotalReviews
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
                  (currentStats.percentages.attendanceRating * currentStats.totalReviews -
                    reviewStatistics.attendanceRating) /
                  newTotalReviews
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
                  (currentStats.percentages.quizes * currentStats.totalReviews - reviewStatistics.quizes * 100) /
                  newTotalReviews
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
                  (currentStats.percentages.assignments * currentStats.totalReviews -
                    reviewStatistics.assignments * 100) /
                  newTotalReviews
                ).toFixed(1)
              )
            )
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
          const newAvgRating = Math.min(
            5,
            Math.max(0, Number((newTotalWeightedSum / department.totalWeight).toFixed(1)))
          );

          await tx.department.update({
            where: { code: professor.departmentCode },
            data: {
              totalWeightedSum: newTotalWeightedSum,
              totalWeight: {
                set: Math.max(0, department.totalWeight - weight)
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
          overall: Math.min(
            5,
            Math.max(
              0,
              Number(
                (
                  (currentStats.ratings.overall * currentStats.totalReviews - reviewRatings.overall) /
                  newTotalReviews
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
                  (currentStats.ratings.scoring * currentStats.totalReviews - reviewRatings.scoring) /
                  newTotalReviews
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
                  (currentStats.ratings.engaging * currentStats.totalReviews - reviewRatings.engaging) /
                  newTotalReviews
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
                  (currentStats.ratings.conceptual * currentStats.totalReviews - reviewRatings.conceptual) /
                  newTotalReviews
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
                  (currentStats.ratings.easyToLearn * currentStats.totalReviews - reviewRatings.easyToLearn) /
                  newTotalReviews
                ).toFixed(1)
              )
            )
          )
        };

        // Handle grade recalculation
        let averageGradeString = 'NA';
        if (review.grade && currentStats.percentages.averageGrade !== 'NA') {
          const currentGradeNumber = gradeNumberMap[currentStats.percentages.averageGrade];
          const reviewGradeNumber = gradeNumberMap[review.grade];
          const newGradeNumber = (currentGradeNumber * currentStats.totalReviews - reviewGradeNumber) / newTotalReviews;
          averageGradeString = convertNumberToGrade(newGradeNumber);
        } else if (currentStats.percentages.averageGrade !== 'NA') {
          averageGradeString = currentStats.percentages.averageGrade;
        }

        // Calculate new course percentages
        const newCoursePercentages: CoursePercentages = {
          wouldRecommend: Math.min(
            100,
            Math.max(
              0,
              Number(
                (
                  (currentStats.percentages.wouldRecommend * currentStats.totalReviews -
                    reviewStatistics.wouldRecommend * 100) /
                  newTotalReviews
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
                  (currentStats.percentages.attendanceRating * currentStats.totalReviews -
                    reviewStatistics.attendanceRating) /
                  newTotalReviews
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
                  (currentStats.percentages.quizes * currentStats.totalReviews - reviewStatistics.quizes * 100) /
                  newTotalReviews
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
                  (currentStats.percentages.assignments * currentStats.totalReviews -
                    reviewStatistics.assignments * 100) /
                  newTotalReviews
                ).toFixed(1)
              )
            )
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
          const newAvgRating = Math.min(
            5,
            Math.max(0, Number((newTotalWeightedSum / department.totalWeight).toFixed(1)))
          );

          await tx.department.update({
            where: { code: course.departmentCode },
            data: {
              totalWeightedSum: newTotalWeightedSum,
              totalWeight: {
                set: Math.max(0, department.totalWeight - weight)
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
