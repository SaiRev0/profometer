'use client';

import { Professor } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export const PROFESSOR_QUERY_KEY = (id: string) => ['professor', id];

export function useProfessor(id: string) {
  return useQuery<Professor>({
    queryKey: PROFESSOR_QUERY_KEY(id),
    queryFn: async () => {
      const response = await fetch(`/api/professors/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch professor');
      }
      return response.json();
    },
    enabled: !!id
  });
}
