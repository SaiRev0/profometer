import { User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

export function useProfile() {
  const { status } = useSession();

  const {
    data,
    isLoading: queryLoading,
    ...rest
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

  // Combine session loading and query loading states
  const isLoading = status === 'loading' || (status === 'authenticated' && queryLoading);

  return {
    ...rest,
    profile: data,
    isLoading
  };
}
