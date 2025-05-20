import { useQuery } from '@tanstack/react-query';

interface CoursesParams {
  page?: number;
  limit?: number;
  department?: string;
  search?: string;
  variant?: 'recently-reviewed' | 'loved' | 'challenging';
}

interface CoursesResponse {
  courses: any[];
  total: number;
  page: number;
  totalPages: number;
}

export function useGetCourses(params: CoursesParams = {}) {
  const { page = 1, limit = 10, department, search, variant } = params;

  const { data, ...rest } = useQuery<CoursesResponse>({
    queryKey: ['courses', { page, limit, department, search, variant }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (page) searchParams.set('page', page.toString());
      if (limit) searchParams.set('limit', limit.toString());
      if (department) searchParams.set('department', department);
      if (search) searchParams.set('search', search);
      if (variant) searchParams.set('variant', variant);

      const response = await fetch(`/api/courses?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    }
  });

  return {
    data,
    ...rest
  };
}
