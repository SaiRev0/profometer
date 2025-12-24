'use client';

import { ReviewComment } from '@/lib/types';
import { CreateCommentApiData } from '@/lib/types/apiTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { COMMENTS_QUERY_KEY } from './useGetComments';
import { toast } from 'sonner';

export function useCreateComment() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createComment,
    isPending,
    error
  } = useMutation<ReviewComment, Error, CreateCommentApiData>({
    mutationFn: async (data: CreateCommentApiData) => {
      const response = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate comments for this review
      queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY(variables.reviewId) });
      toast.success('Comment posted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to post comment', {
        description: error.message
      });
    }
  });

  return {
    createComment,
    isLoading: isPending,
    error
  };
}
