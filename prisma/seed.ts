import { PrismaClient } from './generated/client';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Department data
const departments = [
  {
    code: 'APD',
    name: 'Architecture, Planning and Design',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  { code: 'CER', name: 'Ceramic Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  {
    code: 'CHE',
    name: 'Chemical Engineering and Technology',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  { code: 'CIV', name: 'Civil Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  {
    code: 'CSE',
    name: 'Computer Science and Engineering',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  { code: 'EEE', name: 'Electrical Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'ECE', name: 'Electronics Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'MEC', name: 'Mechanical Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'MET', name: 'Metallurgical Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'MIN', name: 'Mining Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  {
    code: 'PHE',
    name: 'Pharmaceutical Engineering and Technology',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  { code: 'CHY', name: 'Chemistry', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'MAT', name: 'Mathematical Sciences', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'PHY', name: 'Physics', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'BCE', name: 'Biochemical Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  { code: 'BME', name: 'Biomedical Engineering', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 },
  {
    code: 'MST',
    name: 'Materials Science and Technology',
    totalWeightedSum: 0,
    totalWeight: 0,
    avgRating: 0,
    numReviews: 0
  },
  { code: 'HS', name: 'Humanistic Studies', totalWeightedSum: 0, totalWeight: 0, avgRating: 0, numReviews: 0 }
];

// Professor CSV record interface
interface ProfessorCSVRecord {
  name: string;
  department: string;
  designation: string;
  image: string;
  email: string;
  website: string;
}

// Clear database in correct order (respecting foreign key constraints)
async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  // Delete in order to respect foreign key constraints
  await prisma.commentVote.deleteMany();
  await prisma.commentReport.deleteMany();
  await prisma.reviewComment.deleteMany();
  await prisma.reviewVote.deleteMany();
  await prisma.reviewReport.deleteMany();
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('✅ Database cleared successfully');
}

// Seed departments
async function seedDepartments() {
  console.log('🏛️  Seeding departments...');

  const createdDepartments = await prisma.department.createMany({
    data: departments,
    skipDuplicates: true
  });

  console.log(`✅ Successfully seeded ${createdDepartments.count} departments`);
  return createdDepartments.count;
}

// Seed professors
async function seedProfessors() {
  console.log('👨‍🏫 Seeding professors...');

  // Read the CSV file
  const csvFilePath = path.join(__dirname, '..', 'src', 'lib', 'Profs.csv');

  if (!fs.existsSync(csvFilePath)) {
    console.warn(`⚠️  Professor CSV file not found at: ${csvFilePath}`);
    return 0;
  }

  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

  // Parse CSV data
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }) as ProfessorCSVRecord[];

  console.log(`📋 Found ${records.length} professors to seed`);

  let successCount = 0;
  let errorCount = 0;

  // Create a map of department names to codes for quick lookup
  const departmentMap = new Map(departments.map((dept) => [dept.name, dept.code]));

  // Process professors in batches for better performance
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const professorData = batch
      .map((record) => {
        const departmentCode = departmentMap.get(record.department);

        if (!departmentCode) {
          console.warn(`⚠️  Department "${record.department}" not found for professor ${record.name}`);
          errorCount++;
          return null;
        }

        return {
          name: record.name,
          departmentCode: departmentCode,
          designation: record.designation,
          photoUrl: record.image || null,
          email: record.email || null,
          website: record.website || null
        };
      })
      .filter((data): data is NonNullable<typeof data> => data !== null);

    try {
      const result = await prisma.professor.createMany({
        data: professorData,
        skipDuplicates: true
      });

      successCount += result.count;
      console.log(`   Progress: ${successCount}/${records.length} professors seeded`);
    } catch (error: any) {
      console.error(`❌ Error seeding professor batch ${i / batchSize + 1}:`, error.message);
      errorCount += batch.length;
    }
  }

  console.log(`✅ Successfully seeded ${successCount} professors${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
  return successCount;
}

// Seed courses
async function seedCourses() {
  console.log('📚 Seeding courses...');

  // Get the courses data directory
  const coursesDir = path.join(__dirname, '..', 'src', 'lib', 'coursesData');

  if (!fs.existsSync(coursesDir)) {
    console.warn(`⚠️  Courses directory not found at: ${coursesDir}`);
    return 0;
  }

  const files = fs.readdirSync(coursesDir).filter((file) => file.endsWith('.csv'));
  console.log(`📋 Found ${files.length} course CSV files`);

  // Create a map of department codes for quick lookup
  const departmentCodes = new Set(departments.map((dept) => dept.code));

  let totalCourses = 0;
  let totalErrors = 0;

  // Process each CSV file
  for (const file of files) {
    const deptCode = path.basename(file, '.csv');

    if (!departmentCodes.has(deptCode)) {
      console.warn(`⚠️  Department code "${deptCode}" not found, skipping file: ${file}`);
      continue;
    }

    try {
      const filePath = path.join(coursesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Prepare course data with validation
      const courses = records
        .map((record: any) => {
          const code = record['Course Code'];
          const name = record['Course Name'];
          const credits = parseInt(record['Credits']);

          // Validate required fields
          if (!code || !name || isNaN(credits)) {
            console.warn(`⚠️  Invalid course data in ${file}: missing code, name, or credits`);
            totalErrors++;
            return null;
          }

          return {
            code: code.trim(),
            name: name.trim(),
            description: `Course offered by ${departments.find((d) => d.code === deptCode)?.name || deptCode} department`,
            credits: credits,
            departmentCode: deptCode,
            verified: true
          };
        })
        .filter((course): course is NonNullable<typeof course> => course !== null);

      if (courses.length > 0) {
        // Insert courses
        const createdCourses = await prisma.course.createMany({
          data: courses,
          skipDuplicates: true
        });

        totalCourses += createdCourses.count;
        console.log(`   ✓ ${deptCode}: ${createdCourses.count} courses seeded`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${file}:`, error.message);
      totalErrors++;
    }
  }

  console.log(
    `✅ Successfully seeded ${totalCourses} total courses${totalErrors > 0 ? ` (${totalErrors} errors)` : ''}`
  );
  return totalCourses;
}

// Main seed function
async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Step 1: Clear database
    await clearDatabase();
    console.log('');

    // Step 2: Seed departments (must be first due to foreign key constraints)
    const departmentCount = await seedDepartments();
    console.log('');

    // Step 3: Seed professors (depends on departments)
    const professorCount = await seedProfessors();
    console.log('');

    // Step 4: Seed courses (depends on departments)
    const courseCount = await seedCourses();
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   • Departments: ${departmentCount}`);
    console.log(`   • Professors: ${professorCount}`);
    console.log(`   • Courses: ${courseCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute main function
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
