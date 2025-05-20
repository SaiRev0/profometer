'use client';

import { CourseReview, ProfessorReview } from '@/lib/types';
import { CreateReviewApiData } from '@/lib/types/apiTypes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PROFESSOR_QUERY_KEY } from './useGetProfessorById';

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
    onSuccess: async (_, variables) => {
      // Invalidate and refetch professor data
      await queryClient.invalidateQueries({
        queryKey: PROFESSOR_QUERY_KEY(variables.professorId)
      });
    }
  });

  return {
    createReview,
    isLoading: isPending,
    error
  };
}
