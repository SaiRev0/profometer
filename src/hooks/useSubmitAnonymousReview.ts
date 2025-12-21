// src/hooks/useSubmitAnonymousReview.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { encryptAESGCM, encryptAESKeyWithRSA, exportAESKey, generateAESKey } from '@/lib/crypto/client-crypto';
import { getToken, markTokenUsed } from '@/lib/crypto/token-store';
import type { AnonymousReviewSubmission, ReviewContent } from '@/lib/crypto/types';

import { ANONYMOUS_TOKEN_STATUS_QUERY_KEY } from './useAnonymousTokenStatus';

interface SubmitResult {
  success: boolean;
  error?: string;
}

interface SubmitAnonymousReviewParams {
  profId: string;
  reviewContent: ReviewContent;
  cycleId: string;
}

// Query key for the public key - exported for potential external use
export const PUBLIC_KEY_QUERY_KEY = ['reviewPublicKey'] as const;

/**
 * Fetch the server's public key for encrypting review content.
 * This is the query function used by React Query.
 */
async function fetchPublicKey(): Promise<string> {
  const response = await fetch('/api/review/public-key');
  if (!response.ok) {
    throw new Error('Failed to fetch public key');
  }
  const data = await response.json();
  return data.publicKeyPem;
}

/**
 * Core submission logic extracted for use with useMutation.
 * Handles the entire client-side flow:
 * 1. Retrieves the public key from cache (via queryClient)
 * 2. Retrieves the user's token from IndexedDB
 * 3. Encrypts the review content with a random AES key
 * 4. Encrypts the AES key with the server's RSA public key
 * 5. Submits the encrypted payload to the server
 * 6. Marks the token as used locally
 *
 * Security guarantees:
 * - Review content is encrypted before leaving the browser
 * - Server cannot link the review to the user's session
 * - Token can only be used once per professor per cycle
 *
 * @throws Error if any step fails
 */
async function createSubmitAnonymousReviewMutationFn(
  queryClient: ReturnType<typeof useQueryClient>
) {
  return async ({ profId, reviewContent, cycleId }: SubmitAnonymousReviewParams): Promise<SubmitResult> => {
    // 1. Fetch the server's public key for encryption (uses React Query cache)
    // fetchQuery will return cached data if available, otherwise fetch
    const rsaPublicKeyPem = await queryClient.fetchQuery({
      queryKey: PUBLIC_KEY_QUERY_KEY,
      queryFn: fetchPublicKey,
      // Cache public key for 1 hour since it rarely changes
      staleTime: 60 * 60 * 1000,
      // Keep in cache for 24 hours
      gcTime: 24 * 60 * 60 * 1000
    });

    if (!rsaPublicKeyPem) {
      throw new Error('Failed to fetch encryption key. Please try again.');
    }

    // 2. Get token for this professor from IndexedDB
    const token = await getToken(profId, cycleId);

    if (!token) {
      throw new Error('No token available for this professor. Please claim tokens first.');
    }

    if (token.used) {
      throw new Error('Token already used. You can only submit one anonymous review per professor per cycle.');
    }

    // 3. Generate a random AES-256 key for encrypting the review
    const aesKey = await generateAESKey();

    // 4. Encrypt the review content with AES-256-GCM
    // Include ALL data needed for stats processing when the shuffle decrypts it
    const reviewJson = JSON.stringify({
      text: reviewContent.text,
      rating: reviewContent.rating, // Keep for backwards compatibility
      courseCode: reviewContent.courseCode,
      semester: reviewContent.semester,
      timestamp: reviewContent.timestamp,
      ratings: reviewContent.ratings, // Full ratings object for stats
      statistics: reviewContent.statistics, // Full statistics object for stats
      grade: reviewContent.grade, // Grade if provided
      type: reviewContent.type // 'professor' or 'course'
    } satisfies ReviewContent);
    const encryptedBlob = await encryptAESGCM(reviewJson, aesKey);

    // 5. Export the AES key and encrypt it with the server's RSA public key
    // This ensures only the server can decrypt the review content
    const aesKeyBytes = await exportAESKey(aesKey);
    const encryptedKey = await encryptAESKeyWithRSA(aesKeyBytes, rsaPublicKeyPem);

    // 6. Prepare the submission payload
    const submission: AnonymousReviewSubmission = {
      tokenUuid: token.tokenUuid,
      signature: token.signature,
      profId,
      cycleId,
      encryptedBlob,
      encryptedKey
    };

    // 7. Submit to server (no cookies/session needed)
    const response = await fetch('/api/review/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit review');
    }

    // 8. Mark token as used in local IndexedDB
    // This prevents the UI from allowing re-use before server confirms
    await markTokenUsed(token.tokenUuid);

    return { success: true };
  };
}

/**
 * Hook for submitting anonymous reviews using React Query's useMutation.
 *
 * Benefits over manual useCallback approach:
 * - Automatic loading/error state management
 * - Automatic cache invalidation of token status on success
 * - Public key is cached via React Query (1 hour staleTime)
 * - Consistent API with other mutation hooks in the codebase
 * - DevTools integration for debugging
 *
 * Security guarantees:
 * - Review content is encrypted before leaving the browser
 * - Server cannot link the review to the user's session
 * - Token can only be used once per professor per cycle
 * - No automatic retry (retry: false) to prevent duplicate submissions
 */
export function useSubmitAnonymousReview() {
  const queryClient = useQueryClient();

  const mutation = useMutation<SubmitResult, Error, SubmitAnonymousReviewParams>({
    mutationFn: async (params) => {
      const submitFn = await createSubmitAnonymousReviewMutationFn(queryClient);
      return submitFn(params);
    },
    onSuccess: (_, variables) => {
      // Invalidate the token status cache so UI reflects the used token
      queryClient.invalidateQueries({
        queryKey: ANONYMOUS_TOKEN_STATUS_QUERY_KEY(variables.profId)
      });
      console.log('[useSubmitAnonymousReview] ✅ Review submitted, token status cache invalidated');
    },
    onError: (error) => {
      console.error('[useSubmitAnonymousReview] ❌ Submission failed:', error.message);
    },
    // Security: Don't auto-retry failed submissions to prevent duplicate reviews
    retry: false
  });

  /**
   * Submit an anonymous review for a professor.
   * Wrapper function for backward compatibility with the previous API.
   *
   * @param profId - The professor's ID
   * @param reviewContent - The review content (text, rating, optional courseCode)
   * @param cycleId - The current cycle ID
   * @returns Promise resolving to success/error result
   */
  const submitAnonymousReview = async (
    profId: string,
    reviewContent: ReviewContent,
    cycleId: string
  ): Promise<SubmitResult> => {
    try {
      const result = await mutation.mutateAsync({ profId, reviewContent, cycleId });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Check if user has an available (unused) token for a professor.
   *
   * @param profId - The professor's ID
   * @param cycleId - The current cycle ID
   * @returns Promise resolving to true if token is available
   */
  const hasTokenForProfessor = async (profId: string, cycleId: string): Promise<boolean> => {
    try {
      const token = await getToken(profId, cycleId);
      return token !== null && !token.used;
    } catch {
      return false;
    }
  };

  /**
   * Prefetch the public key so it's ready when user submits.
   * Call this when the review form opens to avoid delay on submission.
   */
  const prefetchPublicKey = () => {
    queryClient.prefetchQuery({
      queryKey: PUBLIC_KEY_QUERY_KEY,
      queryFn: fetchPublicKey,
      staleTime: 60 * 60 * 1000
    });
  };

  return {
    // Backward-compatible wrapper function
    submitAnonymousReview,
    // Direct mutation object for more control if needed
    mutation,
    // Helper functions
    hasTokenForProfessor,
    prefetchPublicKey,
    // State (aliased from mutation for backward compatibility)
    isSubmitting: mutation.isPending,
    error: mutation.error?.message ?? null,
    // Additional mutation states
    isSuccess: mutation.isSuccess,
    reset: mutation.reset
  };
}
