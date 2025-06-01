'use client';

import { Course } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export const DEPARTMENT_COURSES_QUERY_KEY = (departmentCode: string) => ['department-courses', departmentCode];

export function useGetDepartmentCourses(departmentCode: string) {
  const { data, isLoading, error } = useQuery<Course[]>({
    queryKey: DEPARTMENT_COURSES_QUERY_KEY(departmentCode),
    queryFn: async () => {
      const response = await fetch(`/api/departments/${departmentCode}/courses`);
      if (!response.ok) {
        throw new Error('Failed to fetch department courses');
      }
      return response.json();
    },
    enabled: !!departmentCode
  });
  return { departmentCourses: data, isLoadingDepartmentCourses: isLoading, errorDepartmentCourses: error };
}
