import { Suspense } from 'react';

import CourseCard, { CourseCardSkeleton } from '@/components/cards/CourseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCourses } from '@/hooks/useGetCourses';
import { useSmartLoading } from '@/hooks/useSmartLoading';
import { Course } from '@/lib/types';

import { BarChart4, Star } from 'lucide-react';

// UI component
const FeaturedCoursesUI = ({
  isLoadingLoved,
  isLoadingChallenging,
  lovedData,
  challengingData
}: {
  isLoadingLoved: boolean;
  isLoadingChallenging: boolean;
  lovedData?: { courses: Course[] };
  challengingData?: { courses: Course[] };
}) => (
  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
    {/* Most Loved Courses */}
    <Card className='border-blue-100 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-blue-600 dark:text-blue-400'>
          <Star className='h-5 w-5' />
          Highest Rated Courses
        </CardTitle>
        <CardDescription>Top-rated courses with exceptional student satisfaction.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 p-3 pt-0 sm:p-6'>
        {isLoadingLoved
          ? Array.from({ length: 2 }).map((_, index) => <CourseCardSkeleton key={index} variant='detailed' />)
          : lovedData?.courses.map((course) => <CourseCard key={course.code} course={course} variant='detailed' />)}
      </CardContent>
    </Card>

    {/* Most Challenging Courses */}
    <Card className='border-purple-100 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-950/20'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-purple-600 dark:text-purple-400'>
          <BarChart4 className='h-5 w-5' />
          Most Difficult Courses
        </CardTitle>
        <CardDescription>Courses that students find most intellectually demanding.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 p-3 pt-0 sm:p-6'>
        {isLoadingChallenging
          ? Array.from({ length: 2 }).map((_, index) => <CourseCardSkeleton key={index} variant='detailed' />)
          : challengingData?.courses.map((course) => (
              <CourseCard key={course.code} course={course} variant='detailed' />
            ))}
      </CardContent>
    </Card>
  </div>
);

// Separate component for data fetching
function FeaturedCoursesContent() {
  const { data: lovedData, isLoading: isLoadingLoved } = useGetCourses({
    variant: 'loved',
    limit: 3
  });

  const { data: challengingData, isLoading: isLoadingChallenging } = useGetCourses({
    variant: 'challenging',
    limit: 3
  });

  return (
    <FeaturedCoursesUI
      isLoadingLoved={isLoadingLoved}
      isLoadingChallenging={isLoadingChallenging}
      lovedData={lovedData}
      challengingData={challengingData}
    />
  );
}

// Main component
export default function FeaturedCourses() {
  const { ref, shouldLoad } = useSmartLoading({
    threshold: 0.1,
    rootMargin: '100px',
    timeThreshold: 4000 // Load after 4 seconds if not scrolled to
  });

  return (
    <section ref={ref} className='mt-8'>
      <h2 className='mb-6 text-2xl font-bold'>Featured Courses</h2>
      {shouldLoad ? (
        <Suspense fallback={<FeaturedCoursesUI isLoadingLoved={true} isLoadingChallenging={true} />}>
          <FeaturedCoursesContent />
        </Suspense>
      ) : (
        <FeaturedCoursesUI isLoadingLoved={true} isLoadingChallenging={true} />
      )}
    </section>
  );
}
