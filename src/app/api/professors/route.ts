import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const department = searchParams.get('department');
    const branch = searchParams.get('branch');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where: any = {};
    if (department) where.department = department;
    if (branch) where.branch = branch;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [professors, total] = await Promise.all([
      db.professor.findMany({
        where,
        skip,
        take: limit,
        include: {
          reviews: true,
          courses: true
        },
        orderBy: {
          rating: 'desc'
        }
      }),
      db.professor.count({ where })
    ]);

    return NextResponse.json({
      professors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json({ error: 'Failed to fetch professors' }, { status: 500 });
  }
}
