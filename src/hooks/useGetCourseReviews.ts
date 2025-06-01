import { CourseReview } from '@/lib/types';
import { useInfiniteQuery } from '@tanstack/react-query';

export const COURSE_REVIEWS_QUERY_KEY = (code: string) => ['course-reviews', code];

interface CourseReviewsResponse {
  reviews: CourseReview[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function useGetCourseReviews(code: string, limit: number = 10) {
  return useInfiniteQuery<CourseReviewsResponse>({
    queryKey: COURSE_REVIEWS_QUERY_KEY(code),
    queryFn: async ({ pageParam }) => {
      const response = await fetch(
        `/api/courses/${code}/reviews?${pageParam ? `cursor=${pageParam}&` : ''}limit=${limit}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch course reviews');
      }
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    enabled: !!code
  });
}
