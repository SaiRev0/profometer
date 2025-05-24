'use client';

import { CourseReview, ProfessorReview } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PROFESSOR_QUERY_KEY } from './useGetProfessorById';

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
    onSuccess: async (_, variables) => {
      // Invalidate and refetch professor data
      await queryClient.invalidateQueries({
        queryKey: PROFESSOR_QUERY_KEY(variables.professorId)
      });

      // Invalidate recent reviews
      queryClient.invalidateQueries({ queryKey: ['recent-reviews'] });

      // Invalidate course data
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });

      // Invalidate department data
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