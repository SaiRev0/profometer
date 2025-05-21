import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getServerSession(authOptions);
  try {
    const { code } = await params;
    // Find the course by code, including reviews and professors who have reviews for this course
    const course = await db.course.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        reviews: {
          include: {
            professor: true,
            user: true,
            // Only get the vote for the current user
            ...(session?.user?.id && {
              votes: {
                where: { userId: session.user.id },
                select: { voteType: true },
                take: 1
              }
            })
          },
          orderBy: { createdAt: 'desc' }
        },
        department: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get unique professors who have reviews for this course
    const professorIds = Array.from(new Set(course.reviews.map((r) => r.professorId)));
    const professors = await db.professor.findMany({
      where: { id: { in: professorIds } },
      include: { department: true }
    });

    const departmentProfessors = await db.professor.findMany({
      where: { departmentCode: course.departmentCode },
      include: { department: true }
    });

    return NextResponse.json({
      ...course,
      professors,
      departmentProfessors
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}
