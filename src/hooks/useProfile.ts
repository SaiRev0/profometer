import { User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

export function useProfile() {
  const { data: session, status } = useSession();

  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      return response.json();
    },
    enabled: status === 'authenticated'
  });

  return {
    profile,
    isLoading: isLoading || status === 'loading',
    error,
    refetch,
    isAuthenticated: status === 'authenticated'
  };
}
