'use client';

import { getToken } from '@/lib/crypto/token-store';
import { useQuery } from '@tanstack/react-query';

export const ANONYMOUS_TOKEN_STATUS_QUERY_KEY = (professorId: string) => ['anonymousTokenStatus', professorId];

interface ReviewStatusResponse {
  cycleId: string;
}

interface AnonymousTokenStatus {
  hasToken: boolean;
  hasUsedToken: boolean;
  cycleId: string | null;
}

/**
 * Hook to check if the user has a valid anonymous token for a specific professor.
 * Uses React Query to fetch the current review cycle and checks IndexedDB for tokens.
 *
 * @param professorId - The ID of the professor to check token for
 * @param enabled - Whether the query should run (typically based on auth status and modal state)
 *
 * @returns
 * - hasToken: true if an unused token is available for this professor/cycle
 * - hasUsedToken: true if a token exists but has already been used this cycle
 * - cycleId: the current review cycle ID
 */
export function useAnonymousTokenStatus(professorId: string, enabled: boolean = true) {
  const query = useQuery<AnonymousTokenStatus, Error>({
    queryKey: ANONYMOUS_TOKEN_STATUS_QUERY_KEY(professorId),
    queryFn: async (): Promise<AnonymousTokenStatus> => {
      // Fetch the current review cycle from the status endpoint
      const response = await fetch('/api/review/status');

      if (!response.ok) {
        throw new Error('Failed to fetch review status');
      }

      const data: ReviewStatusResponse = await response.json();
      const cycleId = data.cycleId;

      // Check if a token exists in IndexedDB for this professor and cycle
      const token = await getToken(professorId, cycleId);

      // Distinguish between: no token, unused token, used token
      const hasToken = token !== null && !token.used;
      const hasUsedToken = token !== null && token.used;

      return {
        hasToken,
        hasUsedToken,
        cycleId
      };
    },
    enabled: enabled && !!professorId,
    // Don't refetch on window focus for token status
    refetchOnWindowFocus: false,
    // Cache for 5 minutes since token status doesn't change frequently
    staleTime: 5 * 60 * 1000
  });

  return {
    hasToken: query.data?.hasToken ?? false,
    hasUsedToken: query.data?.hasUsedToken ?? false,
    cycleId: query.data?.cycleId ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch
  };
}
