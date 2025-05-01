import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

async function updateDepartmentCounts() {
  // Get all departments with their professor counts
  const departments = await db.department.findMany({
    include: {
      _count: {
        select: {
          professors: true
        }
      }
    }
  });

  // Update each department's numProfessors field
  for (const dept of departments) {
    await db.department.update({
      where: { id: dept.id },
      data: {
        numProfessors: dept._count.professors
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // First delete all existing professors
    console.log('Deleting all existing professors...');
    await db.professor.deleteMany({});
    console.log('Successfully deleted all professors');

    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), 'src/lib/Profs.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    // Parse CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`Starting to seed ${records.length} professors...`);
    let successCount = 0;

    // Process each record
    for (const record of records) {
      try {
        // Find department
        const department = await db.department.findUnique({
          where: { name: record.department }
        });

        if (!department) {
          throw new Error(`Department "${record.department}" not found`);
        }

        // Create professor
        await db.professor.create({
          data: {
            name: record.name,
            departmentId: department.id,
            designation: record.designation,
            photoUrl: record.image,
            email: record.email,
            website: record.website
          }
        });

        successCount++;
        console.log(`Successfully added professor: ${record.name} (${successCount}/${records.length})`);
      } catch (err: any) {
        console.error('Failed to add professor:', {
          name: record.name,
          department: record.department,
          error: err.message || 'Unknown error'
        });
        // Stop the process on first error
        return NextResponse.json(
          {
            error: 'Failed to seed professors',
            failedAt: record,
            successCount,
            totalCount: records.length,
            details: err.message || 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // Update department counts after seeding professors
    await updateDepartmentCounts();
    console.log(`Successfully seeded ${successCount} professors`);

    return NextResponse.json({
      message: 'Successfully seeded professors',
      count: successCount
    });
  } catch (err: any) {
    console.error('Error in seeding process:', err);
    return NextResponse.json(
      {
        error: 'Failed to seed professors',
        details: err.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
