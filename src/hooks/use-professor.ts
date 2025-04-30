'use client';

import { Professor } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export function useProfessor(id: string) {
  return useQuery<Professor>({
    queryKey: ['professor', id],
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
