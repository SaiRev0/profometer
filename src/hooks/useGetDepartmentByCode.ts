import type { Course, Department, Professor } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface UseDepartmentParams {
  code: string;
  search?: string;
}

export function useGetDepartmentByCode({ code, search }: UseDepartmentParams) {
  const { data, ...rest } = useQuery<
    Department & {
      professors: Professor[];
      courses: Course[];
      _count: {
        professors: number;
        courses: number;
      };
    }
  >({
    queryKey: ['department', code],
    queryFn: async () => {
      const response = await fetch(`/api/departments/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Department not found');
        }
        throw new Error('Failed to fetch department');
      }
      return response.json();
    },
    enabled: !!code
  });

  return {
    ...rest,
    data
  };
}
