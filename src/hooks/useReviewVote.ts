'use client';

import { useState } from 'react';

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

interface UseReviewVoteProps {
  initialUserVote: 'up' | 'down' | null;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function useReviewVote({ initialUserVote, initialUpvotes, initialDownvotes }: UseReviewVoteProps) {
  const queryClient = useQueryClient();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(initialUserVote);
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvotes);

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
      // Revert optimistic updates
      setUserVote(initialUserVote);
      setUpvoteCount(initialUpvotes);
      setDownvoteCount(initialDownvotes);
    }
  });

  const handleVote = async (reviewId: string, voteType: 'up' | 'down') => {
    if (isPending) return;

    try {
      const result = await voteReview({
        reviewId,
        voteType
      });

      setUserVote(result.userVote);
      setUpvoteCount(result.review.upvotes);
      setDownvoteCount(result.review.downvotes);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return {
    handleVote,
    userVote,
    upvoteCount,
    downvoteCount,
    isLoading: isPending,
    error
  };
}
