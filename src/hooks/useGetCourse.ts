import type { Course, Professor, Review } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

export const COURSE_QUERY_KEY = (code: string) => ['course', code] as const;

export function useGetCourse(code: string) {
  return useQuery<
    Course & {
      reviews: Review[];
      professors: Professor[];
    }
  >({
    queryKey: COURSE_QUERY_KEY(code),
    queryFn: async () => {
      const response = await fetch(`/api/courses/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Course not found');
        }
        throw new Error('Failed to fetch course');
      }
      return response.json();
    },
    enabled: !!code
  });
}
