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
    const where: any = {};
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
        some: {} // Ensure professor has at least one review
      };
    } else if (variant === 'challenging') {
      where.statistics = {
        path: ['ratings', 'overall'],
        gte: 0.0,
        lt: 3.4
      };
      where.reviews = {
        some: {} // Ensure professor has at least one review
      };
    } else if (variant === 'recently-reviewed') {
      where.reviews = {
        some: {} // Ensure professor has at least one review
      };
    }

    const [professors, total] = await Promise.all([
      db.professor.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc'
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
    const sortedProfessors = ['loved', 'challenging'].includes(variant || '')
      ? professors.sort((a, b) => {
          const aStats = a.statistics as { ratings: { overall: number } };
          const bStats = b.statistics as { ratings: { overall: number } };
          return bStats.ratings.overall - aStats.ratings.overall;
        })
      : professors;

    return NextResponse.json({
      professors: sortedProfessors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json({ error: 'Failed to fetch professors' }, { status: 500 });
  }
}
