import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

interface ReportReviewData {
  reviewId: string;
  reason: string;
  details?: string;
}

export function useReportReview() {
  const {
    mutateAsync: reportReview,
    isPending,
    error
  } = useMutation({
    mutationFn: async (data: ReportReviewData) => {
      const response = await fetch('/api/review/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to report review');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Report submitted', {
        description: 'Thank you for helping keep ProfOMeter accurate and appropriate.'
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to submit report', {
        description: error.message
      });
    }
  });

  return { reportReview, isLoading: isPending, error };
}
