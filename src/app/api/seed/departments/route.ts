import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { departments } from '@/lib/mock-data';

async function seedDepartments() {
  try {
    // First, check if departments already exist
    const existingDepartments = await db.department.findMany();
    if (existingDepartments.length > 0) {
      console.log('Departments already exist in the database. Skipping seed.');
      return;
    }

    // Create departments
    const createdDepartments = await db.department.createMany({
      data: departments.map((dept) => ({
        name: dept.name,
        code: dept.code,
        avgRating: dept.avgRating,
        numProfessors: dept.numProfessors,
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
