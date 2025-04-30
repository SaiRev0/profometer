'use client';

import { useEffect, useState } from 'react';

import { DepartmentRankings } from '@/components/sections/DepartmentRankings';
import HeroSection from '@/components/sections/hero-section';
import LovedChallengingSection from '@/components/sections/loved-challenging-section';
import RecentlyReviewedSection from '@/components/sections/recently-reviewed-section';
import { useProfessors } from '@/hooks/use-professors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: professorsData, isLoading: isLoadingProfessors } = useProfessors({
    limit: 20
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string, branch: string | null) => {
    console.log('Searching for:', query, 'in branch:', branch);
  };

  return (
    <div className='flex flex-col gap-8 pt-4 pb-8 md:pt-8'>
      <HeroSection onSearch={handleSearch} />
      <RecentlyReviewedSection
        professors={professorsData?.professors || []}
        isLoading={isLoading || isLoadingProfessors}
      />
      <LovedChallengingSection
        professors={professorsData?.professors || []}
        isLoading={isLoading || isLoadingProfessors}
      />
      <DepartmentRankings />
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}
