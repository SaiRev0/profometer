import { useDebounce } from '@/hooks/use-debounce';
import { Course, Department, Professor } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  professors: Professor[];
  departments: Department[];
  courses: Course[];
  popularDepartments: Department[];
}

export const SEARCH_QUERY_KEY = (query: string) => ['search', query] as const;

export function useSearch(searchTerm: string) {
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce delay

  // Query for initial departments - always enabled
  const {
    data: popularDepartments,
    isLoading: popularDepartmentsLoading,
    error: popularDepartmentsError
  } = useQuery<Department[]>({
    queryKey: ['popularDepartments'],
    queryFn: async () => {
      const response = await fetch('/api/departments?limit=3');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    }
  });

  // Query for search results - using debounced search term
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError
  } = useQuery<SearchResult>({
    queryKey: SEARCH_QUERY_KEY(debouncedSearchTerm),
    queryFn: async () => {
      if (!debouncedSearchTerm) {
        return {
          professors: [],
          departments: [],
          courses: [],
          popularDepartments: []
        };
      }
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: !!debouncedSearchTerm // Only run when there's a debounced search term
  });

  return {
    results: {
      popularDepartments: searchTerm ? [] : popularDepartments || [],
      professors: searchResults?.professors || [],
      departments: searchResults?.departments || [],
      courses: searchResults?.courses || []
    },
    isLoading: searchTerm ? searchLoading : popularDepartmentsLoading,
    error: searchTerm
      ? searchError
        ? (searchError as Error).message
        : null
      : popularDepartmentsError
        ? (popularDepartmentsError as Error).message
        : null
  };
}
