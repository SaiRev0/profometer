'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Course } from '@/lib/types';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Star, Users } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  variant?: 'compact' | 'detailed';
  isLoading?: boolean;
}

export default function CourseCard({ course, variant = 'detailed', isLoading = false }: CourseCardProps) {
  if (isLoading) {
    return <CourseCardSkeleton variant={variant} />;
  }

  const isCompact = variant === 'compact';

  const cardContent = (
    <Card
      className={cn(
        'border-border/70 w-full overflow-hidden transition-all duration-200 hover:shadow-md dark:bg-gray-800',
        isCompact ? 'h-25' : 'h-full'
      )}>
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full'>
            <BookOpen className='h-6 w-6' />
          </div>
          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className={cn('line-clamp-1 font-bold', isCompact ? 'text-base' : 'text-lg')}>{course.code}</h3>
                <p className='text-muted-foreground mb-1 line-clamp-1 text-sm'>{course.name}</p>
              </div>

              <Badge
                variant={
                  course.statistics.ratings.overall >= 3.5
                    ? 'default'
                    : course.statistics.ratings.overall <= 3.4
                      ? 'destructive'
                      : 'secondary'
                }>
                {course.statistics.ratings.overall.toFixed(1)}
              </Badge>
            </div>
            <div className='text-muted-foreground flex items-center gap-4 text-sm'>
              <span className='flex items-center gap-1'>
                <Star className='h-3 w-3' />
                {course.statistics.totalReviews} reviews
              </span>
              <span className='flex items-center gap-1'>
                <Users className='h-3 w-3' />
                {course.totalProfessors} profs
              </span>
            </div>

            {!isCompact && course.reviews[0] && (
              <blockquote className='text-muted-foreground border-primary/30 mt-2 line-clamp-1 border-l-2 pl-2 text-sm'>
                "{course.reviews[0].comment}"
              </blockquote>
            )}
          </div>
        </div>
      </CardContent>

      {/* <CardFooter
        className={cn('mt-[-1rem] flex flex-row-reverse items-center px-4 pt-0 pb-2', isCompact && 'mt-[-1.5rem]')}>
        <Button size='sm' variant='ghost' className='h-8 px-2 text-xs' asChild>
          <div>
            View
            <ChevronRight className='ml-1 h-3.5 w-3.5' />
          </div>
        </Button>
      </CardFooter> */}
    </Card>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Link href={`/course/${course.code}`}>{cardContent}</Link>
    </motion.div>
  );
}

function CourseCardSkeleton({ variant = 'detailed' }: { variant?: 'compact' | 'detailed' }) {
  const isCompact = variant === 'compact';

  return (
    <Card className={cn('overflow-hidden', isCompact ? 'h-25' : 'h-full')}>
      <CardContent className={cn('p-4', isCompact ? 'pb-2' : 'pb-3')}>
        <div className='flex gap-3'>
          <div className='bg-muted h-12 w-12 rounded-full dark:bg-gray-700' />
          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <div className='bg-muted mb-2 h-5 w-32 rounded dark:bg-gray-700' />
                <div className='bg-muted h-4 w-24 rounded dark:bg-gray-700' />
              </div>
              <div className='bg-muted h-6 w-10 rounded dark:bg-gray-700' />
            </div>

            {/* <div className='mt-2 mb-2 flex items-center gap-1'>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn('bg-muted rounded-full dark:bg-gray-700', isCompact ? 'h-3 w-3' : 'h-4 w-4')}
                />
              ))}
              <div className='bg-muted ml-2 h-3 w-8 rounded dark:bg-gray-700' /> */}
            {/* </div> */}

            {!isCompact && (
              <>
                <div className='my-2 flex gap-1'>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className='bg-muted h-5 w-16 rounded dark:bg-gray-700' />
                  ))}
                </div>
                <div className='mt-2 space-y-1'>
                  <div className='bg-muted h-3 w-full rounded dark:bg-gray-700' />
                  <div className='bg-muted h-3 w-5/6 rounded dark:bg-gray-700' />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      {/*
      <CardFooter className='flex justify-between px-4 pt-0 pb-4'>
        <div className='bg-muted h-8 w-20 rounded dark:bg-gray-700' />
        <div className='bg-muted h-8 w-20 rounded dark:bg-gray-700' />
      </CardFooter> */}
    </Card>
  );
}
