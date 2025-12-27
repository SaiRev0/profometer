import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const professor = await db.professor.findUnique({
      where: { id: id },
      include: {
        department: true
      }
    });

    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // Get unique courses taught by this professor
    const courses = await db.course.findMany({
      where: {
        verified: true,
        reviews: {
          some: {
            professorId: id,
            type: 'professor'
          }
        }
      },
      select: {
        code: true,
        name: true
      },
      distinct: ['code']
    });

    return NextResponse.json({
      professor,
      courses
    });
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json({ error: 'Failed to fetch professor' }, { status: 500 });
  }
}
