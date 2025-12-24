'use client';

import { ReportCommentApiData } from '@/lib/types/apiTypes';
import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

export function useReportComment() {
  const {
    mutateAsync: reportComment,
    isPending,
    error
  } = useMutation({
    mutationFn: async (data: ReportCommentApiData) => {
      const response = await fetch('/api/comment/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to report comment');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Comment reported', {
        description: 'Thank you for helping us maintain a safe community.'
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to report comment', {
        description: error.message
      });
    }
  });

  return {
    reportComment,
    isLoading: isPending,
    error
  };
}
