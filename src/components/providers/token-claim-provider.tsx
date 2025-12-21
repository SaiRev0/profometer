'use client';

import { useEffect, useRef } from 'react';

import { useSession } from 'next-auth/react';

import { useClaimTokens } from '@/hooks/useClaimTokens';

/**
 * Automatically claims anonymous review tokens when user signs in.
 * Runs silently in the background - no UI.
 */
export function TokenClaimProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { claimTokens, claimStatus, isCheckingStatus } = useClaimTokens();
  const hasAttemptedClaim = useRef(false);

  useEffect(() => {
    const autoClaimTokens = async () => {
      // Wait for session and claim status to be ready
      if (!session?.user || isCheckingStatus) return;

      // Prevent multiple claim attempts
      if (hasAttemptedClaim.current) return;

      // claimStatus is null if not authenticated (already checked above)
      // or if there was an error fetching status
      if (!claimStatus) {
        console.log('[Anonymous Reviews] No claim status available');
        return;
      }

      console.log('[Anonymous Reviews] Status:', claimStatus);

      if (!claimStatus.hasClaimed) {
        // User hasn't claimed tokens yet - claim them
        hasAttemptedClaim.current = true;
        console.log('[Anonymous Reviews] Starting token claim process...');

        try {
          const success = await claimTokens(true); // silent mode = true

          if (success) {
            console.log('[Anonymous Reviews] ✅ Tokens claimed successfully');
          } else {
            console.error('[Anonymous Reviews] ❌ Token claiming returned false');
          }
        } catch (error) {
          console.error('[Anonymous Reviews] ❌ Auto-claim error:', error);
          // Fail silently - user can still use regular reviews
        }
      } else {
        console.log('[Anonymous Reviews] Already have tokens:', claimStatus.tokenCount, 'tokens');
        hasAttemptedClaim.current = true; // Mark as checked to prevent re-runs
      }
    };

    autoClaimTokens();
  }, [session, claimStatus, isCheckingStatus, claimTokens]);

  return <>{children}</>;
}
