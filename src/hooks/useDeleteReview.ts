import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

interface DeleteReviewProps {
  reviewId: string;
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteReview,
    isPending,
    error
  } = useMutation({
    mutationFn: async ({ reviewId }: DeleteReviewProps) => {
      const response = await fetch(`/api/review/delete/${reviewId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete review');
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

      toast.success('Review deleted', {
        description: 'Your review has been successfully deleted.'
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete review', {
        description: error.message
      });
    }
  });

  return { deleteReview, isLoading: isPending, error };
}
