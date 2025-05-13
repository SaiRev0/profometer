import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import type { Course, Department, Professor, Review } from '@/lib/types';

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;

    const department = await db.department.findUnique({
      where: {
        code: code.toUpperCase()
      },
      include: {
        professors: {
          include: {
            reviews: {
              include: {
                course: true
              }
            }
          }
        },
        courses: {
          include: {
            reviews: true
          }
        },
        _count: {
          select: {
            professors: true,
            courses: true
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Format professors data
    const formattedProfessors = department.professors.map((prof) => {
      // Parse statistics from JSON
      const statistics = prof.statistics as {
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

      // Get unique courses from reviews
      const uniqueCourses = Array.from(
        new Map(prof.reviews.map((review) => [review.course.id, review.course])).values()
      );

      return {
        ...prof,
        ratings: statistics.ratings,
        statistics: statistics.percentages,
        numReviews: statistics.totalReviews,
        numCourses: uniqueCourses.length,
        courses: uniqueCourses
      };
    });

    // Format courses data
    const formattedCourses = department.courses.map((course) => {
      const courseTotalReviews = course.reviews.length;
      // Get unique professors who taught this course
      const uniqueProfessors = new Set(course.reviews.map((review) => review.professorId)).size;

      return {
        ...course,
        numReviews: courseTotalReviews,
        numProfessors: uniqueProfessors
      };
    });

    return NextResponse.json({ ...department, professors: formattedProfessors, courses: formattedCourses });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}
