'use client';

import { ProfessorReview } from '@/lib/types';
import { useInfiniteQuery } from '@tanstack/react-query';

export const PROFESSOR_REVIEWS_QUERY_KEY = (id: string) => ['professor-reviews', id];

interface ProfessorReviewsResponse {
  reviews: ProfessorReview[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function useGetProfessorReviews(id: string, limit: number = 10) {
  return useInfiniteQuery<ProfessorReviewsResponse>({
    queryKey: PROFESSOR_REVIEWS_QUERY_KEY(id),
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `/api/professors/${id}/reviews?${pageParam ? `cursor=${pageParam}&` : ''}limit=${limit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch professor reviews');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    enabled: !!id
  });
}
