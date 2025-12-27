import { NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

/**
 * GET /api/admin/stats
 * Returns platform statistics including professors, courses, users, and reports
 * Protected: Admin only
 */
export async function GET() {
  try {
    // Verify admin access
    await requireAdmin();

    // Calculate date for "recent" (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all statistics in parallel for better performance
    const [
      professorCount,
      courseCount,
      verifiedCourseCount,
      professorReviewCount,
      courseReviewCount,
      userCount,
      usersWithReviewsCount,
      reviewReportCount,
      commentReportCount,
      reviewReportsByReason,
      commentReportsByReason,
      recentReviewReports,
      recentCommentReports
    ] = await Promise.all([
      // Professor stats
      db.professor.count(),

      // Course stats
      db.course.count(),
      db.course.count({ where: { verified: true } }),

      // Review counts
      db.review.count({ where: { type: 'professor' } }),
      db.review.count({ where: { type: 'course' } }),

      // User stats
      db.user.count(),
      db.user.count({
        where: {
          reviews: {
            some: {}
          }
        }
      }),

      // Report counts
      db.reviewReport.count(),
      db.commentReport.count(),

      // Reports grouped by reason
      db.reviewReport.groupBy({
        by: ['reason'],
        _count: {
          id: true
        }
      }),
      db.commentReport.groupBy({
        by: ['reason'],
        _count: {
          id: true
        }
      }),

      // Recent reports (last 7 days)
      db.reviewReport.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      db.commentReport.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })
    ]);

    // Transform groupBy results into a more usable format
    const reviewReportsByReasonMap: Record<string, number> = {
      inappropriate: 0,
      spam: 0,
      notRelevant: 0,
      fake: 0,
      other: 0
    };

    reviewReportsByReason.forEach((item) => {
      reviewReportsByReasonMap[item.reason] = item._count.id;
    });

    const commentReportsByReasonMap: Record<string, number> = {
      inappropriate: 0,
      spam: 0,
      notRelevant: 0,
      fake: 0,
      other: 0
    };

    commentReportsByReason.forEach((item) => {
      commentReportsByReasonMap[item.reason] = item._count.id;
    });

    const stats = {
      professors: {
        total: professorCount,
        totalReviews: professorReviewCount
      },
      courses: {
        total: courseCount,
        verified: verifiedCourseCount,
        totalReviews: courseReviewCount
      },
      users: {
        total: userCount,
        withReviews: usersWithReviewsCount
      },
      reports: {
        totalReviewReports: reviewReportCount,
        totalCommentReports: commentReportCount,
        reviewReportsByReason: reviewReportsByReasonMap,
        commentReportsByReason: commentReportsByReasonMap,
        recentReviewReports: recentReviewReports,
        recentCommentReports: recentCommentReports,
        totalRecent: recentReviewReports + recentCommentReports
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);

    // Check if it's an authorization error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
