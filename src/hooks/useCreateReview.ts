'use client';

import { CourseReview, ProfessorReview } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateReview() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createReview,
    isPending,
    error
  } = useMutation<{ review: ProfessorReview | CourseReview }, Error, CreateReviewApiData>({
    mutationFn: async (data: CreateReviewApiData) => {
      const response = await fetch('/api/review/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create review');
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
    createReview,
    isLoading: isPending,
    error
  };
}
