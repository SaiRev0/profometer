import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET() {
  try {
    const departments = await db.department.findMany({
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
        numReviews: 0 // Since we don't have reviews count in the schema
      };
    });

    return NextResponse.json(formattedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
