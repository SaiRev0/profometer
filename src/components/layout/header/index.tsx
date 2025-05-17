'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useTheme } from 'next-themes';

import { useDebounce } from '@/hooks/use-debounce';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';

import { MobileMenu } from './MobileMenu';
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { SearchDialog } from './SearchDialog';
import { GraduationCap } from 'lucide-react';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { mobileNavItems, desktopNavItems, moreLinks } = useNavigation();

  const handleSearchOpen = (open: boolean) => {
    if (open) {
      setSearchTerm(''); // Clear search term when opening dialog
    }
    setSearchOpen(open);
  };

  // Monitor scroll position for header styling
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <header className='bg-background border-border fixed top-0 right-0 left-0 z-50 h-16 border-b'>
        <div className='container mx-auto flex h-full items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <GraduationCap className='text-primary h-6 w-6' />
            <span className='text-lg font-bold'>RateThatProf</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 h-16 transition-all duration-200',
          isScrolled
            ? 'bg-background/95 border-border border-b shadow-sm backdrop-blur-md'
            : 'bg-background border-border/50 border-b'
        )}>
        <div className='container mx-auto flex h-full items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <Link href='/' className='flex items-center gap-2'>
              <GraduationCap className='text-primary h-6 w-6' />
              <span className='inline text-lg font-bold'>RateThatProf</span>
            </Link>
          </div>

          <SearchBar onSearchClick={() => handleSearchOpen(true)} />
          <Navigation
            navItems={desktopNavItems}
            theme={theme || 'light'}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
          <MobileMenu
            navItems={mobileNavItems}
            moreLinks={moreLinks}
            theme={theme || 'light'}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onSearchClick={() => handleSearchOpen(true)}
          />
        </div>
      </header>

      <SearchDialog
        open={searchOpen}
        onOpenChange={handleSearchOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </>
  );
}
