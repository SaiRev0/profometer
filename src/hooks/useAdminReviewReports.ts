'use client';

import type { ReviewReportData } from '@/components/admin/ReportsTable';
import { useQuery } from '@tanstack/react-query';

interface UseAdminReviewReportsOptions {
  page?: number;
  limit?: number;
  reason?: string;
}

interface ReviewReportsResponse {
  reports: ReviewReportData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useAdminReviewReports({ page = 1, limit = 20, reason }: UseAdminReviewReportsOptions = {}) {
  return useQuery<ReviewReportsResponse>({
    queryKey: ['admin-review-reports', page, limit, reason],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (reason && reason !== 'all') {
        params.append('reason', reason);
      }

      const res = await fetch(`/api/admin/reports/reviews?${params}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch review reports');
      }

      return res.json();
    },
    staleTime: 30000, // 30 seconds
    retry: 1
  });
}
