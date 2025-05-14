import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

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
      // Get unique courses from reviews
      const uniqueCourses = Array.from(
        new Map(prof.reviews.map((review) => [review.course.id, review.course])).values()
      );

      return {
        ...prof,
        numCourses: uniqueCourses.length,
        courses: uniqueCourses
      };
    });

    // Format courses data
    const formattedCourses = department.courses.map((course) => {
      // Get unique professors who taught this course
      const uniqueProfessors = new Set(course.reviews.map((review) => review.professorId)).size;

      return {
        ...course,
        numProfessors: uniqueProfessors
      };
    });

    return NextResponse.json({ ...department, professors: formattedProfessors, courses: formattedCourses });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}
