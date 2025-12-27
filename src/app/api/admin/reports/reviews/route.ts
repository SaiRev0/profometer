import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

/**
 * GET /api/admin/reports/reviews
 * Returns paginated review reports with filtering options
 * Protected: Admin only
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - reason: string (optional filter)
 * - sortBy: 'createdAt' | 'updatedAt' (default: 'createdAt')
 * - order: 'asc' | 'desc' (default: 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const reason = searchParams.get('reason') || undefined;
    const sortBy = searchParams.get('sortBy') === 'updatedAt' ? 'updatedAt' : 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where = reason && reason !== 'all' ? { reason } : undefined;

    // Fetch reports and total count in parallel
    const [reports, total] = await Promise.all([
      db.reviewReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order
        },
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          review: {
            select: {
              id: true,
              comment: true,
              createdAt: true,
              type: true,
              upvotes: true,
              downvotes: true,
              user: {
                select: {
                  id: true,
                  username: true
                }
              },
              professor: {
                select: {
                  id: true,
                  name: true
                }
              },
              course: {
                select: {
                  code: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      db.reviewReport.count({ where })
    ]);

    // Transform the data for the response
    const transformedReports = reports.map((report) => ({
      id: report.id,
      reason: report.reason,
      details: report.details,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      reporter: {
        id: report.reporter.id,
        username: report.reporter.username,
        email: report.reporter.email
      },
      review: {
        id: report.review.id,
        comment: report.review.comment.substring(0, 200), // Truncate to 200 chars for preview
        fullComment: report.review.comment, // Include full comment for detail view
        createdAt: report.review.createdAt.toISOString(),
        type: report.review.type,
        upvotes: report.review.upvotes,
        downvotes: report.review.downvotes,
        author: {
          id: report.review.user.id,
          username: report.review.user.username
        },
        professor: report.review.professor
          ? {
              id: report.review.professor.id,
              name: report.review.professor.name
            }
          : null,
        course: report.review.course
          ? {
              code: report.review.course.code,
              name: report.review.course.name
            }
          : null
      }
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      reports: transformedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching review reports:', error);

    // Check if it's an authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fetch review reports' }, { status: 500 });
  }
}
