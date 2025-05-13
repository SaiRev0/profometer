import { useQuery } from '@tanstack/react-query';

interface Department {
  id: string;
  name: string;
  code: string;
  avgRating: number;
  numProfessors: number;
  numCourses: number;
  numReviews: number;
  isDefault?: boolean;
  isProtected?: boolean;
}

interface DepartmentsParams {
  limit?: number;
}

export function useDepartments(params: DepartmentsParams = {}) {
  const { limit } = params;

  return useQuery<Department[]>({
    queryKey: ['departments', { limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (limit) searchParams.set('limit', limit.toString());

      const response = await fetch(`/api/departments?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      return response.json();
    }
  });
}
