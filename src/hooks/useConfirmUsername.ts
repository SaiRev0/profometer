'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ConfirmUsernameRequest {
  username: string;
}

interface ConfirmUsernameResponse {
  success: boolean;
  username: string;
  message: string;
}

export function useConfirmUsername() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: confirmUsername,
    isPending,
    error
  } = useMutation<ConfirmUsernameResponse, Error, ConfirmUsernameRequest>({
    mutationFn: async (data: ConfirmUsernameRequest) => {
      const response = await fetch('/api/username/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm username');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate profile data since username has been set
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  return {
    confirmUsername,
    isLoading: isPending,
    error
  };
}
