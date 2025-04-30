import { useQuery } from '@tanstack/react-query';

interface ProfessorsParams {
  page?: number;
  limit?: number;
  department?: string;
  branch?: string;
  search?: string;
}

interface ProfessorsResponse {
  professors: any[];
  total: number;
  page: number;
  totalPages: number;
}

export function useProfessors(params: ProfessorsParams = {}) {
  const { page = 1, limit = 10, department, branch, search } = params;

  return useQuery<ProfessorsResponse>({
    queryKey: ['professors', { page, limit, department, branch, search }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (page) searchParams.set('page', page.toString());
      if (limit) searchParams.set('limit', limit.toString());
      if (department) searchParams.set('department', department);
      if (branch) searchParams.set('branch', branch);
      if (search) searchParams.set('search', search);

      const response = await fetch(`/api/professors?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch professors');
      }
      return response.json();
    }
  });
}
