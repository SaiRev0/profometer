'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useTheme } from 'next-themes';

import { useSearch } from '@/contexts/SearchContext';
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
  const { isSearchOpen, searchTerm, setSearchTerm, openSearch, closeSearch } = useSearch();
  const { mobileNavItems, desktopNavItems, moreLinks } = useNavigation();

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
            <Link href='/' className='flex items-center gap-2'>
              <Image src='/images/logo.png' alt='ProfOMeter' width={35} height={35} className='rounded-full' />
              <span className='inline text-lg font-bold'>ProfOMeter</span>
            </Link>
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
              <Image src='/images/logo.png' alt='ProfOMeter' width={35} height={35} className='rounded-full' />
              <span className='inline text-lg font-bold'>ProfOMeter</span>
            </Link>
          </div>

          <SearchBar onSearchClick={openSearch} />
          <Navigation
            navItems={desktopNavItems}
            theme={theme || 'dark'}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
          <MobileMenu
            navItems={mobileNavItems}
            moreLinks={moreLinks}
            theme={theme || 'dark'}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onSearchClick={openSearch}
          />
        </div>
      </header>

      <SearchDialog
        open={isSearchOpen}
        onOpenChange={(open) => (open ? openSearch() : closeSearch())}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </>
  );
}
