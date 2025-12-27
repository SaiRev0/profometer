'use client';

import { useQuery } from '@tanstack/react-query';

interface UnverifiedCourse {
  code: string;
  name: string;
  description: string;
  credits: number;
  departmentCode: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  department: {
    code: string;
    name: string;
  };
  _count: {
    reviews: number;
  };
}

interface UnverifiedCoursesResponse {
  courses: UnverifiedCourse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UseUnverifiedCoursesOptions {
  page?: number;
  limit?: number;
}

export function useUnverifiedCourses({ page = 1, limit = 10 }: UseUnverifiedCoursesOptions = {}) {
  return useQuery<UnverifiedCoursesResponse>({
    queryKey: ['admin-unverified-courses', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const res = await fetch(`/api/admin/courses/unverified?${params}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch unverified courses');
      }

      return res.json();
    },
    staleTime: 30000, // 30 seconds
    retry: 1
  });
}
