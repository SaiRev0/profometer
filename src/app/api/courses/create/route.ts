import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { code, name, description, credits, difficulty, professorId } = body;

    if (!code || !name || !professorId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const course = await db.course.create({
      data: {
        code: code.toUpperCase(),
        name,
        professorId,
        description,
        credits: parseInt(credits),
        difficulty: parseInt(difficulty)
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('[COURSES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const professorId = searchParams.get('professorId');

    if (!professorId) {
      return new NextResponse('Professor ID is required', { status: 400 });
    }

    const courses = await db.course.findMany({
      where: {
        professorId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('[COURSES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
