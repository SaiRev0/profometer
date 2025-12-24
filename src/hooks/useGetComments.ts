'use client';

import { ReviewComment } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export const COMMENTS_QUERY_KEY = (reviewId: string) => ['review-comments', reviewId];

interface CommentsResponse {
  comments: ReviewComment[];
}

export function useGetComments(reviewId: string, enabled: boolean = true) {
  return useQuery<CommentsResponse>({
    queryKey: COMMENTS_QUERY_KEY(reviewId),
    queryFn: async () => {
      const response = await fetch(`/api/review/${reviewId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json();
    },
    enabled: !!reviewId && enabled
  });
}
