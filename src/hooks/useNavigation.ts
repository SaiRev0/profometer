import { usePathname } from 'next/navigation';

import { MoreLink, NavItem } from '@/lib/types/navigation';

import { Home, Menu, Search, User } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function useNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const mobileNavItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      label: 'Search',
      href: '/search',
      icon: Search,
      active: pathname === '/search'
    },
    ...(session?.user?.email
      ? [
          {
            label: 'Profile',
            href: '/profile',
            icon: User,
            active: pathname === '/profile'
          }
        ]
      : [
          {
            label: 'Sign In',
            href: '/signin',
            icon: User,
            active: pathname === '/signin'
          }
        ])
  ];

  const desktopNavItems: NavItem[] = [
    ...(session?.user?.email
      ? [
          {
            label: 'Profile',
            href: '/profile',
            icon: User,
            active: pathname === '/profile'
          }
        ]
      : [
          {
            label: 'Sign In',
            href: '/signin',
            icon: User,
            active: pathname === '/signin'
          }
        ])
  ];

  const moreLinks: MoreLink[] = [
    { label: 'Popular Professors', href: '/popular' },
    { label: 'About', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' }
  ];

  return {
    mobileNavItems,
    desktopNavItems,
    moreLinks
  };
}
