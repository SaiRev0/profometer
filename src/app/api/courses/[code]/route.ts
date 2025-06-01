import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;

    const course = await db.course.findUnique({
      where: { code: code.toUpperCase() },
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
