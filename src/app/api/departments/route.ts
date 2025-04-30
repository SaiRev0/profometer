import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const departments = await db.department.findMany({
      take: limit,
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            professors: true
          }
        },
        professors: {
          select: {
            rating: true
          }
        }
      }
    });

    // Calculate average ratings and format the response
    const formattedDepartments = departments.map((dept) => {
      const totalRating = dept.professors.reduce(
        (sum: number, prof: { rating: number | null }) => sum + (prof.rating || 0),
        0
      );
      const avgRating = dept.professors.length > 0 ? totalRating / dept.professors.length : 0;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        avgRating: Number(avgRating.toFixed(1)),
        numProfessors: dept._count.professors,
        numReviews: dept.numReviews
      };
    });

    // Sort by average rating after calculating it
    formattedDepartments.sort((a, b) => b.avgRating - a.avgRating);
    console.log('formattedDepartments', formattedDepartments);

    return NextResponse.json(formattedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
