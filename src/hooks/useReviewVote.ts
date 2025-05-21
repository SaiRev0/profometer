'use client';

import { CourseReview, ProfessorReview } from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

interface VoteResponse {
  review: CourseReview | ProfessorReview;
  userVote: 'up' | 'down' | null;
}

interface VoteData {
  reviewId: string;
  voteType: 'up' | 'down';
}

export function useReviewVote() {
  const queryClient = useQueryClient();
  const {
    mutateAsync: voteReview,
    isPending,
    error
  } = useMutation<VoteResponse, Error, VoteData>({
    mutationFn: async (data: VoteData) => {
      const response = await fetch('/api/review/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process vote');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate recent reviews
      queryClient.invalidateQueries({ queryKey: ['recent-reviews'] });

      // Invalidate course data
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });

      // Invalidate professor data
      queryClient.invalidateQueries({ queryKey: ['professors'] });
      queryClient.invalidateQueries({ queryKey: ['professor'] });

      // Invalidate department data (both list and individual)
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department'] });

      // Invalidate profile data since it shows user's reviews
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return {
    voteReview,
    isLoading: isPending,
    error
  };
}
