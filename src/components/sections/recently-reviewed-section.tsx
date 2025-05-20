import CourseCard from '@/components/cards/CourseCard';
import ProfessorCard from '@/components/cards/ProfessorCard';
import { useGetRecentReviews } from '@/hooks/useGetRecentReviews';
import { Course, Professor } from '@/lib/types';

import { Star } from 'lucide-react';

export default function RecentlyReviewedSection() {
  const { data, isLoading } = useGetRecentReviews({ limit: 2 });
  console.log(data);

  const renderLoadingCards = (type: 'professor' | 'course') =>
    Array.from({ length: 2 }).map((_, index) => (
      <div key={index} className='min-w-[250px] grow snap-start sm:min-w-[280px]'>
        {type === 'professor' ? (
          <ProfessorCard professor={data?.professors[0] as Professor} isLoading={true} variant='detailed' />
        ) : (
          <CourseCard course={data?.courses[0] as Course} isLoading={true} variant='detailed' />
        )}
      </div>
    ));

  return (
    <section className='mt-6 space-y-8'>
      {/* Recently Reviewed Professors */}
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Star className='text-primary h-5 w-5' />
            <h2 className='text-2xl font-bold'>Recently Reviewed</h2>
          </div>
        </div>
        <div className='scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4'>
          {isLoading
            ? renderLoadingCards('professor')
            : data?.professors.map((professor) => (
                <div key={professor.id} className='min-w-[250px] snap-start sm:min-w-[320px]'>
                  <ProfessorCard professor={professor} variant='detailed' showStars={false} />
                </div>
              ))}
          {isLoading
            ? renderLoadingCards('course')
            : data?.courses.map((course) => (
                <div key={course.code} className='min-w-[250px] snap-start sm:min-w-[320px]'>
                  <CourseCard course={course} variant='detailed' />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
