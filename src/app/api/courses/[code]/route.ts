import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const course = await db.course.findFirst({
      where: {
        code: code.toUpperCase(),
        verified: true
      },
      include: {
        department: true
      }
    });

    const professors = await db.professor.findMany({
      where: {
        reviews: {
          some: {
            courseCode: code.toUpperCase(),
            type: 'course'
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course, professors });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}
