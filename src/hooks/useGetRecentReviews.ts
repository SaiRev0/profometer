import { Course, Professor } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface RecentReviewsResponse {
  professors: Professor[];
  courses: Course[];
}

interface UseGetRecentReviewsOptions {
  limit?: number;
}

export function useGetRecentReviews({ limit = 2 }: UseGetRecentReviewsOptions = {}) {
  return useQuery<RecentReviewsResponse>({
    queryKey: ['recent-reviews', limit],
    queryFn: async () => {
      const response = await fetch(`/api/review/recent?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent reviews');
      }
      return response.json();
    }
  });
}
