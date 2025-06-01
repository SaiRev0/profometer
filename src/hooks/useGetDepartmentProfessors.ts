import { Professor } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export function useGetDepartmentProfessors(departmentCode: string) {
  const { data, isLoading, error } = useQuery<Professor[]>({
    queryKey: ['department-professors', departmentCode],
    queryFn: async () => {
      const response = await fetch(`/api/departments/${departmentCode}/professors`);
      if (!response.ok) {
        throw new Error('Failed to fetch department professors');
      }
      return response.json();
    }
  });
  return { departmentProfessors: data, isLoadingDepartmentProfessors: isLoading, errorDepartmentProfessors: error };
}
