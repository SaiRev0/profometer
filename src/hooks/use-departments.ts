import { useQuery } from '@tanstack/react-query';

interface Department {
  id: string;
  name: string;
  code: string;
  avgRating: number;
  numProfessors: number;
  numReviews: number;
  description: string;
  isDefault?: boolean;
  isProtected?: boolean;
}

export function useDepartments() {
  return useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      return response.json();
    }
  });
}
