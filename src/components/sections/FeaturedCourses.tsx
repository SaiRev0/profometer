import CourseCard from '@/components/cards/CourseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCourses } from '@/hooks/useGetCourses';

import { BarChart4, Star } from 'lucide-react';

export default function FeaturedCourses() {
  const { data: lovedData, isLoading: isLoadingLoved } = useGetCourses({
    variant: 'loved',
    limit: 3
  });

  const { data: challengingData, isLoading: isLoadingChallenging } = useGetCourses({
    variant: 'challenging',
    limit: 3
  });

  return (
    <section className='mt-8'>
      <h2 className='mb-6 text-2xl font-bold'>Featured Courses</h2>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card className='border-blue-100 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-blue-600 dark:text-blue-400'>
              <Star className='h-5 w-5' />
              Highest Rated Courses
            </CardTitle>
            <CardDescription>Top-rated courses with exceptional student satisfaction.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isLoadingLoved
              ? Array.from({ length: 2 }).map((_, index) => (
                  <CourseCard key={index} course={lovedData?.courses[0]} isLoading={true} variant='detailed' />
                ))
              : lovedData?.courses.map((course) => <CourseCard key={course.id} course={course} variant='detailed' />)}
          </CardContent>
        </Card>

        {/* Challenging Courses */}
        <Card className='border-purple-100 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-950/20'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-purple-600 dark:text-purple-400'>
              <BarChart4 className='h-5 w-5' />
              Most Difficult Courses
            </CardTitle>
            <CardDescription>Courses that students find most intellectually demanding.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isLoadingChallenging
              ? Array.from({ length: 2 }).map((_, index) => (
                  <CourseCard key={index} course={challengingData?.courses[0]} isLoading={true} variant='detailed' />
                ))
              : challengingData?.courses.map((course) => (
                  <CourseCard key={course.id} course={course} variant='detailed' />
                ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
