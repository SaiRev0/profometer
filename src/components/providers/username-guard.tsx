'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

// Pages that don't require username to be set
const publicPaths = ['/signin', '/setup-username', '/api', '/about', '/terms', '/privacy'];

export function UsernameGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check while loading
    if (status === 'loading') return;

    // Skip check for unauthenticated users or public paths
    if (status === 'unauthenticated') return;
    if (publicPaths.some((path) => pathname.startsWith(path))) return;

    // If user is authenticated but hasn't set username, redirect to setup
    if (session?.user && !session.user.usernameSetAt) {
      router.push('/setup-username');
    }
  }, [status, session, pathname, router]);

  return <>{children}</>;
}
