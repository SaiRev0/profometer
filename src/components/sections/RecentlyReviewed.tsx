import { Suspense } from 'react';

import CourseCard, { CourseCardSkeleton } from '@/components/cards/CourseCard';
import ProfessorCard, { ProfessorCardSkeleton } from '@/components/cards/ProfessorCard';
import { useGetRecentReviews } from '@/hooks/useGetRecentReviews';
import { useSmartLoading } from '@/hooks/useSmartLoading';

import { Star } from 'lucide-react';

const renderLoadingCards = (type: 'professor' | 'course', length: number) =>
  Array.from({ length }).map((_, index) => (
    <div key={index} className='w-full snap-start md:min-w-62.5 md:grow lg:min-w-70'>
      {type === 'professor' ? (
        <ProfessorCardSkeleton key={index} variant='detailed' />
      ) : (
        <CourseCardSkeleton key={index} variant='detailed' />
      )}
    </div>
  ));

// Loading fallback
const LoadingFallback = () => (
  <div className='scrollbar-hide flex flex-col gap-4 scroll-smooth pb-4 md:snap-x md:snap-mandatory md:flex-row md:overflow-x-auto'>
    {renderLoadingCards('professor', 4)}
  </div>
);

// Separate component for data fetching
function RecentlyReviewedContent() {
  const { data, isLoading } = useGetRecentReviews({ limit: 2 });

  return (
    <div className='scrollbar-hide flex flex-col gap-4 scroll-smooth pb-4 md:snap-x md:snap-mandatory md:flex-row md:overflow-x-auto'>
      {isLoading
        ? renderLoadingCards('professor', 2)
        : data?.professors.map((professor) => (
            <div key={professor.id} className='w-full snap-start md:min-w-75 lg:min-w-[320px]'>
              <ProfessorCard professor={professor} variant='detailed' />
            </div>
          ))}
      {isLoading
        ? renderLoadingCards('course', 2)
        : data?.courses.map((course) => (
            <div key={course.code} className='w-full snap-start md:min-w-75 lg:min-w-[320px]'>
              <CourseCard course={course} variant='detailed' />
            </div>
          ))}
    </div>
  );
}

// Main component
export default function RecentlyReviewedSection() {
  const { ref, shouldLoad } = useSmartLoading({
    threshold: 0.1,
    rootMargin: '100px',
    timeThreshold: 2000 // Load after 2 seconds if not scrolled to
  });

  return (
    <section ref={ref} className='mt-6 space-y-8'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Star className='text-primary h-5 w-5' />
          <h2 className='text-2xl font-bold'>Recently Reviewed</h2>
        </div>
      </div>
      {shouldLoad ? (
        <Suspense fallback={<LoadingFallback />}>
          <RecentlyReviewedContent />
        </Suspense>
      ) : (
        <LoadingFallback />
      )}
    </section>
  );
}
