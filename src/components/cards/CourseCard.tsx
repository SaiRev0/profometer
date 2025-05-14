'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Course } from '@/lib/types';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';

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
        'border-border/70 overflow-hidden transition-all duration-200 hover:shadow-md dark:bg-gray-800',
        isCompact ? 'h-30' : 'h-full'
      )}>
      <CardContent className={cn('p-4', isCompact ? 'pb-2' : 'pb-3')}>
        <div className='flex items-start gap-3'>
          <div className='bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full'>
            <BookOpen className='h-6 w-6' />
          </div>
          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className={cn('line-clamp-1 font-bold', isCompact ? 'text-base' : 'text-lg')}>{course.code}</h3>
                <p className='text-muted-foreground line-clamp-1 text-sm'>{course.name}</p>
              </div>

              <Badge variant={course.avgRating >= 4 ? 'default' : course.avgRating <= 2 ? 'destructive' : 'secondary'}>
                {course.avgRating.toFixed(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn('flex items-center justify-between px-4 pt-0 pb-4', isCompact && 'pt-0')}>
        <Button size='sm' variant='ghost' className='h-8 px-2 text-xs' asChild>
          <div>
            View
            <ChevronRight className='ml-1 h-3.5 w-3.5' />
          </div>
        </Button>
      </CardFooter>
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
    <Card className={cn('overflow-hidden', isCompact ? 'h-40' : 'h-full')}>
      <CardContent className={cn('p-4', isCompact ? 'pb-2' : 'pb-3')}>
        <div className='flex gap-3'>
          <div className='bg-muted h-12 w-12 rounded-full' />
          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <div className='bg-muted mb-2 h-5 w-32 rounded' />
                <div className='bg-muted h-4 w-24 rounded' />
              </div>
              <div className='bg-muted h-6 w-10 rounded' />
            </div>

            <div className='mt-2 mb-2 flex items-center gap-1'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn('bg-muted rounded-full', isCompact ? 'h-3 w-3' : 'h-4 w-4')} />
              ))}
              <div className='bg-muted ml-2 h-3 w-8 rounded' />
            </div>

            {!isCompact && (
              <>
                <div className='my-2 flex gap-1'>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className='bg-muted h-5 w-16 rounded' />
                  ))}
                </div>
                <div className='mt-2 space-y-1'>
                  <div className='bg-muted h-3 w-full rounded' />
                  <div className='bg-muted h-3 w-5/6 rounded' />
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex justify-between px-4 pt-0 pb-4'>
        <div className='bg-muted h-8 w-20 rounded' />
        <div className='bg-muted h-8 w-20 rounded' />
      </CardFooter>
    </Card>
  );
}
