'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

interface VerifyCourseParams {
  courseCode: string;
}

interface VerifyCourseResponse {
  message: string;
  course: {
    code: string;
    name: string;
    verified: boolean;
    department: {
      code: string;
      name: string;
    };
  };
}

export function useVerifyCourse() {
  const queryClient = useQueryClient();

  return useMutation<VerifyCourseResponse, Error, VerifyCourseParams>({
    mutationFn: async ({ courseCode }) => {
      const res = await fetch('/api/admin/courses/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseCode })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to verify course');
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-unverified-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      toast.success('Course verified', {
        description: `${data.course.name} has been verified successfully.`
      });
    },
    onError: (error) => {
      toast.error('Failed to verify course', {
        description: error.message
      });
    }
  });
}

export function useUnverifyCourse() {
  const queryClient = useQueryClient();

  return useMutation<VerifyCourseResponse, Error, VerifyCourseParams>({
    mutationFn: async ({ courseCode }) => {
      const res = await fetch('/api/admin/courses/verify', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseCode })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to unverify course');
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-unverified-courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      toast.success('Course unverified', {
        description: `${data.course.name} has been unverified.`
      });
    },
    onError: (error) => {
      toast.error('Failed to unverify course', {
        description: error.message
      });
    }
  });
}
