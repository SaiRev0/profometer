import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    const courses = await db.course.findMany({
      where: {
        departmentCode: code,
        verified: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching department courses:', error);
    return NextResponse.json({ error: 'Failed to fetch department courses' }, { status: 500 });
  }
}
