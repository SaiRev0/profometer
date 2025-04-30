import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'src/lib/Profs.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    // Parse CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Process each record
    for (const record of records) {
      // Find department
      const department = await db.department.findUnique({
        where: { name: record.department }
      });

      if (department) {
        // Create professor
        await db.professor.create({
          data: {
            name: record.name,
            departmentId: department.id,
            designation: record.designation,
            photoUrl: record.image,
            email: record.email,
            website: record.website,
            rating: 0,
            numReviews: 0
          }
        });
      }
    }

    return NextResponse.json({ message: 'Successfully seeded professors' });
  } catch (error) {
    console.error('Error seeding professors:', error);
    return NextResponse.json({ error: 'Failed to seed professors' }, { status: 500 });
  }
}
