'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ProfessorCard from '@/components/cards/ProfessorCard';
import ReviewCard, { ReviewCardSkeleton, ReviewCardType } from '@/components/cards/ReviewCard';
import FilterDropdown, { SortOption } from '@/components/filters/filter-dropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Professor, Review } from '@/lib/types';

import { motion } from 'framer-motion';
import { ArrowUpDown, BookCheck, BookOpen, Building, ChevronLeft, GraduationCap, Star, Users } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  description: string;
  credits: number;
  prerequisites?: string[];
  professors: Professor[];
  statistics: {
    averageRating: number;
    totalReviews: number;
    difficultyLevel: number;
    wouldTakeAgain: number;
    averageGrade: string;
    textbookRequired: number;
    attendanceMandatory: number;
  };
  learningOutcomes: string[];
  topics: string[];
  reviews: Review[];
}

export function CoursePageSkeleton() {
  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <div className='mb-6 flex items-center gap-2'>
        <Skeleton className='h-9 w-24' />
      </div>

      {/* Course Overview Card */}
      <Card className='mb-6'>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <Skeleton className='mb-2 h-8 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className='p-4'>
                  <div className='flex flex-col items-center text-center'>
                    <Skeleton className='mb-2 h-6 w-6' />
                    <Skeleton className='mb-1 h-4 w-20' />
                    <Skeleton className='h-6 w-12' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Skeleton className='mb-6 h-16 w-full' />

          <div className='grid gap-4'>
            <div>
              <Skeleton className='mb-2 h-5 w-32' />
              <div className='flex flex-wrap gap-1.5'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className='h-6 w-24' />
                ))}
              </div>
            </div>

            <div>
              <Skeleton className='mb-2 h-5 w-32' />
              <div className='flex flex-wrap gap-1.5'>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className='h-6 w-32' />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professors Section */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-9 w-24' />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='flex-1'>
                    <Skeleton className='mb-1 h-5 w-32' />
                    <Skeleton className='mb-2 h-4 w-24' />
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Skeleton key={j} className='h-4 w-4' />
                      ))}
                    </div>
                  </div>
                  <Skeleton className='h-8 w-16' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-9 w-32' />
        </div>

        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CoursePageProps {
  course: any; // Use the correct type if available
}

export default function CoursePage({ course }: CoursePageProps) {
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  // Sort reviews based on selected option
  const sortedReviews = [...(course.reviews || [])].sort((a, b) => {
    if (sortOption === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOption === 'rating-high') {
      return b.ratings.overall - a.ratings.overall;
    } else if (sortOption === 'rating-low') {
      return a.ratings.overall - b.ratings.overall;
    }
    return 0;
  });

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleReviews((prev) => prev + 5);
      setLoadingMore(false);
    }, 800);
  };

  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <div className='mb-6 flex items-center gap-2'>
        <Button variant='ghost' size='sm' className='gap-1' onClick={() => router.back()}>
          <ChevronLeft className='h-4 w-4' />
          Back
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Course Overview */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <div>
                <CardTitle className='flex items-center gap-2 text-2xl'>
                  <BookOpen className='text-primary h-5 w-5' />
                  {course.code}: {course.name}
                </CardTitle>
                <CardDescription className='flex items-center gap-1'>
                  <Building className='h-4 w-4' />
                  {course.department?.name || ''} • {course.credits} Credits
                </CardDescription>
              </div>

              <div className='flex items-center'>
                <Badge
                  className='mr-2 px-3 py-1 text-lg'
                  variant={
                    (course.avgRating || 0) >= 4
                      ? 'default'
                      : (course.avgRating || 0) <= 3
                        ? 'destructive'
                        : 'secondary'
                  }>
                  {(course.avgRating || 0).toFixed(1)}
                </Badge>
                <p className='text-muted-foreground text-sm'>{course.numReviews || 0} reviews</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
              <Card className='bg-primary/5 border-primary/20'>
                <CardContent className='p-4'>
                  <div className='flex flex-col items-center text-center'>
                    <Users className='text-primary mb-2 h-6 w-6' />
                    <p className='text-sm font-medium'>Professors</p>
                    <p className='text-2xl font-bold'>{course.professors?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
              {/* Add more cards for other statistics if available */}
            </div>

            <p className='text-muted-foreground mb-6'>{course.description}</p>

            {/* Add more course details if available */}
          </CardContent>
        </Card>

        {/* Professors Section */}
        <div className='mb-8'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='flex items-center gap-2 text-xl font-bold'>
              <Users className='text-primary h-5 w-5' />
              Course Professors
            </h2>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {(course.professors || []).map((professor: any) => (
              <ProfessorCard key={professor.id} professor={professor} variant='detailed' />
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='flex items-center gap-2 text-xl font-bold'>
              <Star className='text-primary h-5 w-5' />
              Course Reviews
            </h2>

            <FilterDropdown
              sortOption={sortOption}
              onSortChange={setSortOption}
              variant='outline'
              showActiveFilters={false}
            />
          </div>

          <div className='space-y-4'>
            {sortedReviews.slice(0, visibleReviews).map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {visibleReviews < sortedReviews.length && (
              <div className='mt-6 flex justify-center'>
                <Button variant='outline' onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load More Reviews'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
