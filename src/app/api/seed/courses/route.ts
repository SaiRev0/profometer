import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';

import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

async function seedCourses() {
  try {
    // First, delete all existing courses
    await db.course.deleteMany({});
    console.log('Deleted all existing courses');

    // Get all departments for mapping
    const departments = await db.department.findMany();
    const departmentMap = new Map(departments.map((dept) => [dept.code, dept]));

    // Get the courses data directory
    const coursesDir = path.join(process.cwd(), 'src', 'lib', 'coursesData');
    const files = fs.readdirSync(coursesDir);

    let totalCourses = 0;

    // Process each CSV file
    for (const file of files) {
      if (!file.endsWith('.csv')) continue;

      const deptCode = path.basename(file, '.csv');
      const department = departmentMap.get(deptCode);

      if (!department) {
        console.warn(`Department not found for code: ${deptCode}`);
        continue;
      }

      const filePath = path.join(coursesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Create courses for this department
      const courses = records.map((record: any) => ({
        code: record['Course Code'],
        name: record['Course Name'],
        description: `Course offered by ${department.name} department`,
        credits: parseInt(record['Credits']),
        departmentCode: department.code,
        verified: true
      }));

      // Insert courses in batches
      const createdCourses = await db.course.createMany({
        data: courses,
        skipDuplicates: true
      });

      totalCourses += createdCourses.count;
      console.log(`Created ${createdCourses.count} courses for department ${deptCode}`);
    }

    console.log(`Successfully seeded ${totalCourses} total courses`);
    return totalCourses;
  } catch (error) {
    console.error('Error seeding courses:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const totalCourses = await seedCourses();
    return NextResponse.json({
      message: `Successfully seeded ${totalCourses} courses`,
      totalCourses
    });
  } catch (error) {
    console.error('Error seeding courses:', error);
    return NextResponse.json({ error: 'Failed to seed courses' }, { status: 500 });
  }
}
