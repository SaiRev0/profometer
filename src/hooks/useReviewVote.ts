'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface VoteResponse {
  review: {
    id: string;
    upvotes: number;
    downvotes: number;
  };
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
