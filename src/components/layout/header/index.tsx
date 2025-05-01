'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useTheme } from 'next-themes';

import { useNavigation } from '@/hooks/useNavigation';
import { SearchResults } from '@/lib/types/navigation';
import { cn } from '@/lib/utils';

import { MobileMenu } from './MobileMenu';
import { Navigation } from './Navigation';
import { SearchBar } from './SearchBar';
import { SearchDialog } from './SearchDialog';
import { GraduationCap } from 'lucide-react';

// Mock search results
const mockSearchResults: SearchResults = {
  professors: [
    { id: 'prof-1', name: 'Dr. Sarah Johnson', department: 'Computer Science' },
    { id: 'prof-2', name: 'Prof. Michael Williams', department: 'Engineering' },
    { id: 'prof-3', name: 'Dr. Emily Chen', department: 'Physics' }
  ],
  branches: [
    { id: 'cs', name: 'Computer Science', professors: 48 },
    { id: 'eng', name: 'Engineering', professors: 62 },
    { id: 'bus', name: 'Business', professors: 45 }
  ],
  popular: ['Machine Learning', 'Data Structures', 'Web Development', 'Artificial Intelligence']
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
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

          <SearchBar onSearchClick={() => setSearchOpen(true)} selectedBranch={selectedBranch} />
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
            onSearchClick={() => setSearchOpen(true)}
          />
        </div>
      </header>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        searchResults={mockSearchResults}
        onBranchSelect={setSelectedBranch}
      />
    </>
  );
}
