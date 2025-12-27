import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';
import type { GroupedReviewReport } from '@/lib/types/admin-reports';

/**
 * GET /api/admin/reports/reviews
 * Returns paginated grouped review reports with filtering and sorting options
 * Protected: Admin only
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - reason: string (optional filter)
 * - sortBy: 'reportCount' | 'firstReported' | 'lastReported' (default: 'reportCount')
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
    const sortBy = searchParams.get('sortBy') || 'reportCount';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where = reason && reason !== 'all' ? { reason } : undefined;

    // Step 1: Get aggregated group data with sorting
    const groupAggregates = await db.reviewReport.groupBy({
      by: ['reviewId'],
      where,
      _count: {
        id: true
      },
      _min: {
        createdAt: true
      },
      _max: {
        createdAt: true
      },
      orderBy: getSortOption(sortBy, order),
      skip,
      take: limit
    });

    // Get total count of groups for pagination
    const totalGroups = await db.reviewReport.groupBy({
      by: ['reviewId'],
      where,
      _count: {
        id: true
      }
    });

    // Extract reviewIds for current page
    const reviewIds = groupAggregates.map((group) => group.reviewId);

    if (reviewIds.length === 0) {
      return NextResponse.json({
        groupedReports: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        meta: {
          totalReports: 0,
          totalGroups: 0
        }
      });
    }

    // Step 2: Fetch all reports for these reviews
    const reports = await db.reviewReport.findMany({
      where: {
        reviewId: {
          in: reviewIds
        },
        ...(where || {})
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true
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
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Step 3: Transform to grouped structure
    const groupedMap = new Map<string, GroupedReviewReport>();

    for (const report of reports) {
      const reviewId = report.reviewId;

      if (!groupedMap.has(reviewId)) {
        groupedMap.set(reviewId, {
          contentId: reviewId,
          reportCount: 0,
          reasonBreakdown: {},
          reporters: [],
          content: {
            id: report.review.id,
            comment: report.review.comment.substring(0, 200),
            fullComment: report.review.comment,
            type: report.review.type as 'professor' | 'course',
            upvotes: report.review.upvotes,
            downvotes: report.review.downvotes,
            createdAt: report.review.createdAt.toISOString(),
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
          },
          firstReportedAt: report.createdAt.toISOString(),
          lastReportedAt: report.createdAt.toISOString()
        });
      }

      const group = groupedMap.get(reviewId)!;

      // Add reporter
      group.reporters.push({
        reportId: report.id,
        username: report.reporter.username,
        userId: report.reporter.id,
        reason: report.reason,
        details: report.details,
        createdAt: report.createdAt.toISOString()
      });

      // Update reason breakdown
      const reasonKey = report.reason;
      group.reasonBreakdown[reasonKey] = (group.reasonBreakdown[reasonKey] || 0) + 1;

      // Update timestamps
      const reportTime = report.createdAt.toISOString();
      if (reportTime < group.firstReportedAt) {
        group.firstReportedAt = reportTime;
      }
      if (reportTime > group.lastReportedAt) {
        group.lastReportedAt = reportTime;
      }

      group.reportCount++;
    }

    // Convert to array and apply secondary sorting if needed
    const groupedReports = Array.from(groupedMap.values());

    // Apply client-side sorting (since groupBy already did primary sort)
    if (sortBy === 'reportCount') {
      groupedReports.sort((a, b) => (order === 'desc' ? b.reportCount - a.reportCount : a.reportCount - b.reportCount));
    } else if (sortBy === 'firstReported') {
      groupedReports.sort((a, b) =>
        order === 'desc'
          ? new Date(b.firstReportedAt).getTime() - new Date(a.firstReportedAt).getTime()
          : new Date(a.firstReportedAt).getTime() - new Date(b.firstReportedAt).getTime()
      );
    } else if (sortBy === 'lastReported') {
      groupedReports.sort((a, b) =>
        order === 'desc'
          ? new Date(b.lastReportedAt).getTime() - new Date(a.lastReportedAt).getTime()
          : new Date(a.lastReportedAt).getTime() - new Date(b.lastReportedAt).getTime()
      );
    }

    // Calculate total reports
    const totalReports = reports.length;
    const totalPages = Math.ceil(totalGroups.length / limit);

    return NextResponse.json({
      groupedReports,
      pagination: {
        page,
        limit,
        total: totalGroups.length,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      meta: {
        totalReports,
        totalGroups: totalGroups.length
      }
    });
  } catch (error) {
    console.error('Error fetching grouped review reports:', error);

    // Check if it's an authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fetch grouped review reports' }, { status: 500 });
  }
}

function getSortOption(sortBy: string, order: 'asc' | 'desc') {
  switch (sortBy) {
    case 'reportCount':
      return {
        _count: {
          id: order
        }
      };
    case 'firstReported':
      return {
        _min: {
          createdAt: order
        }
      };
    case 'lastReported':
      return {
        _max: {
          createdAt: order
        }
      };
    default:
      return {
        _count: {
          id: order
        }
      };
  }
}
