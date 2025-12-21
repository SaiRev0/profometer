// src/hooks/useClaimTokens.ts
'use client';

import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type ReviewToken, blindMessage, generateUUID, unblindSignature } from '@/lib/crypto/client-crypto';
import { getTokensByCycle, hasTokensForCycle, saveTokens } from '@/lib/crypto/token-store';
import type { ClaimBatchRequest, ClaimBatchResponse } from '@/lib/crypto/types';

interface ClaimStatus {
  hasClaimed: boolean;
  cycleId: string;
  tokenCount: number;
}

interface ClaimTokensParams {
  silent?: boolean;
  onProgress?: (current: number, total: number) => void;
}

// Query key for claim status - exported for external invalidation if needed
export const CLAIM_STATUS_QUERY_KEY = ['claimStatus'] as const;

/**
 * Fetch claim status from server and combine with local token count.
 * This is the query function used by React Query.
 */
async function fetchClaimStatus(): Promise<ClaimStatus | null> {
  const response = await fetch('/api/auth/claim-batch');
  if (!response.ok) {
    if (response.status === 401) return null; // Not authenticated
    throw new Error('Failed to check claim status');
  }

  const data = await response.json();
  const localTokens = await getTokensByCycle(data.cycleId);

  return {
    hasClaimed: data.hasClaimed,
    cycleId: data.cycleId,
    tokenCount: localTokens.length
  };
}

/**
 * Core claim tokens logic extracted for use with useMutation.
 * Returns true on success, throws an error on failure.
 */
async function claimTokensMutationFn({
  onProgress
}: ClaimTokensParams): Promise<boolean> {
  console.log('[useClaimTokens] Starting claim process...');

  // Test crypto availability first
  console.log('[useClaimTokens] Testing crypto availability...');
  try {
    const testUuid = generateUUID();
    console.log('[useClaimTokens] ✅ generateUUID works:', testUuid);
  } catch (e) {
    console.error('[useClaimTokens] ❌ Crypto not available:', e);
    throw new Error('Cryptographic functions not available in this browser');
  }

  // 1. Check claim status and get public key
  console.log('[useClaimTokens] Checking status...');
  const statusResponse = await fetch('/api/auth/claim-batch');
  if (!statusResponse.ok) {
    if (statusResponse.status === 401) {
      throw new Error('Please sign in to claim review tokens');
    }
    throw new Error('Failed to check claim status');
  }

  const status = await statusResponse.json();
  console.log('[useClaimTokens] Status response:', status);

  if (status.hasClaimed) {
    console.log('[useClaimTokens] Already claimed this cycle');
    // Check if we have local tokens
    const hasLocal = await hasTokensForCycle(status.cycleId);
    if (hasLocal) {
      throw new Error('You already have tokens for this cycle');
    }
    // Server says claimed but no local tokens - user cleared data
    throw new Error('You already claimed tokens this cycle. Import your backup to restore them.');
  }

  // 2. Get list of all professors
  console.log('[useClaimTokens] Fetching professors...');
  const profResponse = await fetch('/api/professors?all=true');
  if (!profResponse.ok) {
    throw new Error('Failed to get professor list');
  }
  const data = await profResponse.json();
  const professors = data.professors;
  console.log(`[useClaimTokens] Found ${professors.length} professors`);
  const professorIds = professors.map((p: { id: string }) => p.id);

  onProgress?.(0, professorIds.length);

  // 3. Generate blinded tokens for each professor
  console.log('[useClaimTokens] Generating blinded tokens...');
  const blindedTokens: { profId: string; blindedMessage: string; tokenUuid: string; blindingFactor: string }[] = [];

  for (let i = 0; i < professorIds.length; i++) {
    const profId = professorIds[i];
    console.log(`[useClaimTokens] Blinding token ${i + 1}/${professorIds.length}...`);

    const tokenUuid = generateUUID();
    const message = `${tokenUuid}||${profId}||${status.cycleId}`;

    const { blindedMessage, blindingFactor } = await blindMessage(message, status.publicKeyN, status.publicKeyE);

    blindedTokens.push({
      profId,
      blindedMessage,
      tokenUuid,
      blindingFactor
    });

    onProgress?.(i + 1, professorIds.length);
  }

  // 4. Send blinded tokens to server for signing
  const claimRequest: ClaimBatchRequest = {
    cycleId: status.cycleId,
    blindedTokens: blindedTokens.map((t) => ({
      profId: t.profId,
      blindedMessage: t.blindedMessage
    }))
  };

  console.log('[useClaimTokens] Sending POST request with', blindedTokens.length, 'blinded tokens...');
  console.log('[useClaimTokens] Request body:', JSON.stringify(claimRequest).substring(0, 200) + '...');

  const claimResponse = await fetch('/api/auth/claim-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimRequest)
  });

  console.log('[useClaimTokens] POST response status:', claimResponse.status);

  if (!claimResponse.ok) {
    const errorData = await claimResponse.json();
    throw new Error(errorData.error || 'Failed to claim tokens');
  }

  const claimData: ClaimBatchResponse = await claimResponse.json();
  console.log('[useClaimTokens] ✅ Received', claimData.blindedSignatures.length, 'signed tokens');

  // 5. Unblind signatures and store tokens
  console.log('[useClaimTokens] Unblinding signatures...');
  const tokens: ReviewToken[] = [];

  for (const signed of claimData.blindedSignatures) {
    const original = blindedTokens.find((t) => t.profId === signed.profId);
    if (!original) continue;

    const signature = unblindSignature(signed.blindedSignature, original.blindingFactor, claimData.publicKeyN);

    tokens.push({
      tokenUuid: original.tokenUuid,
      profId: signed.profId,
      cycleId: claimData.cycleId,
      signature,
      blindingFactor: original.blindingFactor,
      createdAt: new Date().toISOString(),
      used: false
    });
  }

  // 6. Save to IndexedDB
  console.log('[useClaimTokens] Saving', tokens.length, 'tokens to IndexedDB...');
  await saveTokens(tokens);
  console.log('[useClaimTokens] ✅ Tokens saved successfully');

  return true;
}

export function useClaimTokens() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  /**
   * React Query hook for checking claim status.
   * Benefits: automatic caching, background refetch, stale-while-revalidate.
   */
  const {
    data: claimStatus,
    isLoading: isCheckingStatus,
    error: statusError,
    refetch: refetchClaimStatus
  } = useQuery({
    queryKey: CLAIM_STATUS_QUERY_KEY,
    queryFn: fetchClaimStatus,
    staleTime: 30_000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false // Don't refetch on window focus for this sensitive data
  });

  /**
   * React Query mutation for claiming tokens.
   * Benefits: automatic loading/error states, cache invalidation, retry logic.
   */
  const claimMutation = useMutation({
    mutationFn: (params: ClaimTokensParams) =>
      claimTokensMutationFn({
        ...params,
        onProgress: (current, total) => {
          setProgress({ current, total });
          params.onProgress?.(current, total);
        }
      }),
    onSuccess: async () => {
      // Invalidate claim status to refetch with updated state
      await queryClient.invalidateQueries({ queryKey: CLAIM_STATUS_QUERY_KEY });
      console.log('[useClaimTokens] ✅ Claim status cache invalidated');
      setProgress(null);
    },
    onError: (error) => {
      console.error('[useClaimTokens] ❌ Mutation error:', error);
      setProgress(null);
    },
    retry: false // Don't auto-retry claiming tokens
  });

  /**
   * Wrapper function for claimTokens to maintain backward compatibility.
   * @param silent - If true, suppresses error display (useful for auto-claiming)
   */
  const claimTokens = async (silent = false): Promise<boolean> => {
    try {
      await claimMutation.mutateAsync({ silent });
      return true;
    } catch (error) {
      // Error is already logged in onError callback
      // If silent mode, we don't want to throw or display error
      if (!silent) {
        console.error('[useClaimTokens] Claim failed:', error);
      }
      return false;
    }
  };

  return {
    // Mutation function (backward compatible wrapper)
    claimTokens,
    // Direct mutation object for more control
    claimMutation,
    // Query data and state
    claimStatus,
    isCheckingStatus,
    statusError: statusError instanceof Error ? statusError.message : null,
    refetchClaimStatus,
    // Mutation state (aliased from mutation for backward compatibility)
    isLoading: claimMutation.isPending,
    error: claimMutation.error instanceof Error ? claimMutation.error.message : null,
    progress
  };
}
