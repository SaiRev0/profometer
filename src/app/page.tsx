'use client';

import { DepartmentRankings } from '@/components/sections/DepartmentRankings';
import HeroSection from '@/components/sections/hero-section';
import LovedChallengingSection from '@/components/sections/loved-challenging-section';
import RecentlyReviewedSection from '@/components/sections/recently-reviewed-section';
import { useProfessors } from '@/hooks/use-professors';

export default function Home() {
  const { data: professorsData, isLoading: isLoadingProfessors } = useProfessors({
    limit: 20
  });

  const handleSearch = (query: string, branch: string | null) => {
    console.log('Searching for:', query, 'in branch:', branch);
  };

  return (
    <div className='flex flex-col gap-8 pt-4 pb-8 md:pt-8'>
      <HeroSection onSearch={handleSearch} />
      <RecentlyReviewedSection professors={professorsData?.professors || []} isLoading={isLoadingProfessors} />
      <LovedChallengingSection professors={professorsData?.professors || []} isLoading={isLoadingProfessors} />
      <DepartmentRankings />
    </div>
  );
}
