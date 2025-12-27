import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

/**
 * POST /api/admin/courses/verify
 * Verifies a course by setting verified to true
 * Protected: Admin only
 */
export async function POST(request: Request) {
  try {
    // Verify admin access
    await requireAdmin();

    const body = await request.json();
    const { courseCode } = body;

    if (!courseCode) {
      return NextResponse.json({ error: 'Course code is required' }, { status: 400 });
    }

    // Verify the course
    const course = await db.course.update({
      where: {
        code: courseCode
      },
      data: {
        verified: true
      },
      include: {
        department: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Course verified successfully',
      course
    });
  } catch (error) {
    console.error('Error verifying course:', error);

    // Check if it's an authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if course not found
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to verify course' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/courses/verify
 * Unverifies a course by setting verified to false
 * Protected: Admin only
 */
export async function DELETE(request: Request) {
  try {
    // Verify admin access
    await requireAdmin();

    const body = await request.json();
    const { courseCode } = body;

    if (!courseCode) {
      return NextResponse.json({ error: 'Course code is required' }, { status: 400 });
    }

    // Unverify the course
    const course = await db.course.update({
      where: {
        code: courseCode
      },
      data: {
        verified: false
      },
      include: {
        department: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Course unverified successfully',
      course
    });
  } catch (error) {
    console.error('Error unverifying course:', error);

    // Check if it's an authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if course not found
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to unverify course' }, { status: 500 });
  }
}
