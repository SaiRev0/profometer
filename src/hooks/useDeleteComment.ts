'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

interface DeleteCommentProps {
  commentId: string;
  reviewId: string;
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteComment,
    isPending,
    error
  } = useMutation({
    mutationFn: async ({ commentId }: DeleteCommentProps) => {
      const response = await fetch(`/api/comment/delete/${commentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate comments for this review
      queryClient.invalidateQueries({ queryKey: ['review-comments', variables.reviewId] });
      toast.success('Comment deleted', {
        description: 'Your comment has been successfully deleted.'
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete comment', {
        description: error.message
      });
    }
  });

  return { deleteComment, isLoading: isPending, error };
}
