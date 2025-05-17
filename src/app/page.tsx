'use client';

import { DepartmentRankings } from '@/components/sections/DepartmentRankings';
import HeroSection from '@/components/sections/hero-section';
import LovedChallengingSection from '@/components/sections/loved-challenging-section';
import RecentlyReviewedSection from '@/components/sections/recently-reviewed-section';

export default function Home() {
  return (
    <div className='flex flex-col gap-8 pt-4 pb-8 md:pt-8'>
      <HeroSection />
      <RecentlyReviewedSection />
      <LovedChallengingSection />
      <DepartmentRankings />
    </div>
  );
}
