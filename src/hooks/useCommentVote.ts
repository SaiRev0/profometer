'use client';

import { ReviewComment } from '@/lib/types';
import { CommentVoteApiData } from '@/lib/types/apiTypes';
import { useMutation } from '@tanstack/react-query';

interface VoteResponse {
  comment: ReviewComment;
  userVote: 'up' | 'down' | null;
}

export function useCommentVote() {
  const {
    mutateAsync: voteComment,
    isPending,
    error
  } = useMutation<VoteResponse, Error, CommentVoteApiData>({
    mutationFn: async ({ commentId, voteType }) => {
      const response = await fetch('/api/comment/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentId, voteType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }

      return response.json();
    }
  });

  return {
    voteComment,
    isLoading: isPending,
    error
  };
}
