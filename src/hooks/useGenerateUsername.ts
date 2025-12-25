'use client';

import { useQuery } from '@tanstack/react-query';

interface GenerateUsernameResponse {
  username: string;
  available: boolean;
}

export function useGenerateUsername(
  enabled: boolean = true,
  includeNumbers: boolean = true,
  useHyphens: boolean = false,
  noSeparator: boolean = false
) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<GenerateUsernameResponse, Error>({
    queryKey: ['generate-username', includeNumbers, useHyphens, noSeparator],
    queryFn: async () => {
      const params = new URLSearchParams({
        includeNumbers: includeNumbers.toString(),
        useHyphens: useHyphens.toString(),
        noSeparator: noSeparator.toString()
      });
      const response = await fetch(`/api/username/generate?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate username');
      }

      return response.json();
    },
    enabled,
    // Disable caching since we want a fresh username each time
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  return {
    username: data?.username,
    isLoading,
    error,
    refetch
  };
}
