import { Suspense } from 'react';

import CourseCard, { CourseCardSkeleton } from '@/components/cards/CourseCard';
import ProfessorCard, { ProfessorCardSkeleton } from '@/components/cards/ProfessorCard';
import { useGetRecentReviews } from '@/hooks/useGetRecentReviews';
import { useSmartLoading } from '@/hooks/useSmartLoading';

import { Star } from 'lucide-react';

const renderLoadingCards = (type: 'professor' | 'course', length: number) =>
  Array.from({ length }).map((_, index) => (
    <div key={index} className='min-w-[250px] grow snap-start sm:min-w-[280px]'>
      {type === 'professor' ? (
        <ProfessorCardSkeleton key={index} variant='detailed' />
      ) : (
        <CourseCardSkeleton key={index} variant='detailed' />
      )}
    </div>
  ));

// Loading fallback
const LoadingFallback = () => (
  <div className='scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4'>
    {renderLoadingCards('professor', 4)}
  </div>
);

// Separate component for data fetching
function RecentlyReviewedContent() {
  const { data, isLoading } = useGetRecentReviews({ limit: 2 });

  return (
    <div className='scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4'>
      {isLoading
        ? renderLoadingCards('professor', 2)
        : data?.professors.map((professor) => (
            <div key={professor.id} className='min-w-[300px] snap-start sm:min-w-[320px]'>
              <ProfessorCard professor={professor} variant='detailed' />
            </div>
          ))}
      {isLoading
        ? renderLoadingCards('course', 2)
        : data?.courses.map((course) => (
            <div key={course.code} className='min-w-[300px] snap-start sm:min-w-[320px]'>
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
