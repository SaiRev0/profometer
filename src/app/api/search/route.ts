import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Search for professors
    const professors = await db.professor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { departmentCode: { contains: query.toUpperCase(), mode: 'insensitive' } }
        ]
      },
      take: 3, // Limit to 3 results
      include: {
        department: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Search for departments
    const departments = await db.department.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query.toUpperCase(), mode: 'insensitive' } }
        ]
      },
      take: 3, // Limit to 3 results
      orderBy: {
        name: 'asc'
      }
    });

    // Search for courses
    const courses = await db.course.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query.toUpperCase(), mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        verified: true // Only show verified courses
      },
      take: 3, // Limit to 3 results
      include: {
        department: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      professors: professors,
      departments: departments,
      courses: courses
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
