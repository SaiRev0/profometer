'use client';

import {
  CoursePercentages,
  CourseRating,
  CourseReview,
  ProfessorPercentages,
  ProfessorRating,
  ProfessorReview
} from '@/lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PROFESSOR_QUERY_KEY } from './useGetProfessorById';

interface CreateReviewData {
  professorId: string;
  courseId: string;
  semester: string;
  anonymous: boolean;
  ratings: ProfessorRating | CourseRating;
  comment: string;
  statistics: ProfessorPercentages | CoursePercentages;
  grade?: string;
  type: 'professor' | 'course';
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  const { mutateAsync: createReview, isPending } = useMutation<
    { review: ProfessorReview | CourseReview },
    Error,
    CreateReviewData
  >({
    mutationFn: async (data: CreateReviewData) => {
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
    isLoading: isPending
  };
}
