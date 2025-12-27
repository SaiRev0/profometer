import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    const variant = searchParams.get('variant');

    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where: any = { verified: true };
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Handle different variants
    if (variant === 'loved') {
      where.statistics = {
        path: ['ratings', 'overall'],
        gte: 3.5,
        lt: 5.1
      };
      where.reviews = {
        some: {
          type: 'course'
        }
      };
    } else if (variant === 'challenging') {
      where.statistics = {
        path: ['ratings', 'overall'],
        gte: 0.0,
        lt: 3.4
      };
      where.reviews = {
        some: {
          type: 'course'
        }
      };
    } else if (variant === 'recently-reviewed') {
      where.reviews = {
        some: {
          type: 'course'
        }
      };
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          reviews: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            include: {
              course: true
            }
          },
          department: true
        }
      }),
      db.professor.count({ where })
    ]);

    // Sort professors by overall rating if it's a featured variant
    const sortedCourses = ['loved', 'challenging'].includes(variant || '')
      ? courses.sort((a, b) => {
          const aStats = a.statistics as { ratings: { overall: number } };
          const bStats = b.statistics as { ratings: { overall: number } };
          return bStats.ratings.overall - aStats.ratings.overall;
        })
      : courses;

    return NextResponse.json({
      courses: sortedCourses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
