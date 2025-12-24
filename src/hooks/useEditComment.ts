'use client';

import { ReviewComment } from '@/lib/types';
import { EditCommentApiData } from '@/lib/types/apiTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

export function useEditComment() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: editComment,
    isPending,
    error
  } = useMutation<ReviewComment, Error, EditCommentApiData & { reviewId: string }>({
    mutationFn: async ({ commentId, content }) => {
      const response = await fetch('/api/comment/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentId, content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate comments for this review
      queryClient.invalidateQueries({ queryKey: ['review-comments', variables.reviewId] });
      toast.success('Comment updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update comment', {
        description: error.message
      });
    }
  });

  return {
    editComment,
    isLoading: isPending,
    error
  };
}
