import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const professor = await db.professor.findUnique({
      where: { id: id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        courses: true,
        department: true
      }
    });

    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    return NextResponse.json(professor);
  } catch (error) {
    console.error('Error fetching professor:', error);
    return NextResponse.json({ error: 'Failed to fetch professor' }, { status: 500 });
  }
}
