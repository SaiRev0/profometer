import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { departments } from '@/lib/mock-data';

async function seedDepartments() {
  try {
    await db.department.deleteMany();
    await db.professor.deleteMany();
    await db.course.deleteMany();
    await db.review.deleteMany();
    await db.reviewVote.deleteMany();
    await db.user.deleteMany();
    await db.account.deleteMany();

    // Create departments
    const createdDepartments = await db.department.createMany({
      data: departments.map((dept) => ({
        name: dept.name,
        code: dept.code,
        totalWeightedSum: dept.totalWeightedSum,
        totalWeight: dept.totalWeight,
        avgRating: dept.avgRating,
        numReviews: dept.numReviews
      }))
    });

    console.log(`Successfully seeded ${createdDepartments.count} departments`);
  } catch (error) {
    console.error('Error seeding departments:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    await seedDepartments();
    return NextResponse.json({ message: 'Successfully seeded departments' });
  } catch (error) {
    console.error('Error seeding departments:', error);
    return NextResponse.json({ error: 'Failed to seed departments' }, { status: 500 });
  }
}
