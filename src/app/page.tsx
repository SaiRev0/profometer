'use client';

import { DepartmentRankings } from '@/components/sections/DepartmentRankings';
import FeaturedCourses from '@/components/sections/FeaturedCourses';
import LovedChallengingSection from '@/components/sections/FeaturedProfessors';
import HeroSection from '@/components/sections/Hero';
import RecentlyReviewedSection from '@/components/sections/RecentlyReviewed';

export default function Home() {
  return (
    <div className='flex flex-col gap-8 pt-4 pb-8 md:pt-8'>
      <HeroSection />
      <RecentlyReviewedSection />
      <LovedChallengingSection />
      <FeaturedCourses />
      <DepartmentRankings />
    </div>
  );
}
