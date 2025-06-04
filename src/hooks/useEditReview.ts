'use client';

import { CourseReview, ProfessorReview } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEditReview() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: editReview,
    isPending,
    error
  } = useMutation<{ review: ProfessorReview | CourseReview }, Error, CreateReviewApiData & { reviewId: string }>({
    mutationFn: async (data: CreateReviewApiData & { reviewId: string }) => {
      const response = await fetch('/api/review/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit review');
      }

      return response.json();
    },
    onSuccess: async () => {
      // Invalidate recent reviews
      queryClient.invalidateQueries({ queryKey: ['recent-reviews'] });

      // Invalidate course data
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['course-reviews'] });

      // Invalidate professor data
      queryClient.invalidateQueries({ queryKey: ['professors'] });
      queryClient.invalidateQueries({ queryKey: ['professor'] });
      queryClient.invalidateQueries({ queryKey: ['professor-reviews'] });

      // Invalidate department data (both list and individual)
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department'] });

      // Invalidate profile data since it shows user's reviews
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  return {
    editReview,
    isLoading: isPending,
    error
  };
}
