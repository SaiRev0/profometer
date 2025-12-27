'use client';

import { useQuery } from '@tanstack/react-query';

interface AdminStats {
  professors: {
    total: number;
    totalReviews: number;
  };
  courses: {
    total: number;
    verified: number;
    totalReviews: number;
  };
  users: {
    total: number;
    withReviews: number;
  };
  reports: {
    totalReviewReports: number;
    totalCommentReports: number;
    reviewReportsByReason: {
      inappropriate: number;
      spam: number;
      notRelevant: number;
      fake: number;
      other: number;
    };
    commentReportsByReason: {
      inappropriate: number;
      spam: number;
      notRelevant: number;
      fake: number;
      other: number;
    };
    recentReviewReports: number;
    recentCommentReports: number;
    totalRecent: number;
  };
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch admin statistics');
      }

      return res.json();
    },
    staleTime: 60000, // 1 minute
    retry: 1
  });
}
