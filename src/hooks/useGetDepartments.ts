import { Department } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface DepartmentsParams {
  limit?: number;
}

export function useGetDepartments(params: DepartmentsParams = {}) {
  const { limit } = params;

  const { data, ...rest } = useQuery<Department[]>({
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

  return { departments: data, ...rest };
}
