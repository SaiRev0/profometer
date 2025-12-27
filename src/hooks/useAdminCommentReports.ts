'use client';

import type { CommentReportData } from '@/components/admin/ReportsTable';
import { useQuery } from '@tanstack/react-query';

interface UseAdminCommentReportsOptions {
  page?: number;
  limit?: number;
  reason?: string;
}

interface CommentReportsResponse {
  reports: CommentReportData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useAdminCommentReports({ page = 1, limit = 20, reason }: UseAdminCommentReportsOptions = {}) {
  return useQuery<CommentReportsResponse>({
    queryKey: ['admin-comment-reports', page, limit, reason],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (reason && reason !== 'all') {
        params.append('reason', reason);
      }

      const res = await fetch(`/api/admin/reports/comments?${params}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch comment reports');
      }

      return res.json();
    },
    staleTime: 30000, // 30 seconds
    retry: 1
  });
}
