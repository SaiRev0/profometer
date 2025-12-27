'use client';

import type { GroupedReportsResponse, ReportSortBy, SortOrder } from '@/lib/types/admin-reports';
import { useQuery } from '@tanstack/react-query';

interface UseAdminCommentReportsOptions {
  page?: number;
  limit?: number;
  reason?: string;
  sortBy?: ReportSortBy;
  order?: SortOrder;
}

export function useAdminCommentReports({
  page = 1,
  limit = 20,
  reason,
  sortBy = 'reportCount',
  order = 'desc'
}: UseAdminCommentReportsOptions = {}) {
  return useQuery<GroupedReportsResponse>({
    queryKey: ['admin-grouped-comment-reports', page, limit, reason, sortBy, order],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order
      });

      if (reason && reason !== 'all') {
        params.append('reason', reason);
      }

      const res = await fetch(`/api/admin/reports/comments?${params}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch grouped comment reports');
      }

      return res.json();
    },
    staleTime: 30000, // 30 seconds
    retry: 1
  });
}
