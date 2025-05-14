import { useQuery } from '@tanstack/react-query';

interface ProfessorsParams {
  page?: number;
  limit?: number;
  department?: string;
  search?: string;
  variant?: 'recently-reviewed' | 'loved' | 'challenging';
}

interface ProfessorsResponse {
  professors: any[];
  total: number;
  page: number;
  totalPages: number;
}

export function useGetProfessors(params: ProfessorsParams = {}) {
  const { page = 1, limit = 10, department, search, variant } = params;

  const { data, ...rest } = useQuery<ProfessorsResponse>({
    queryKey: ['professors', { page, limit, department, search, variant }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (page) searchParams.set('page', page.toString());
      if (limit) searchParams.set('limit', limit.toString());
      if (department) searchParams.set('department', department);
      if (search) searchParams.set('search', search);
      if (variant) searchParams.set('variant', variant);

      const response = await fetch(`/api/professors?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch professors');
      }
      return response.json();
    }
  });

  return {
    data,
    ...rest
  };
}
