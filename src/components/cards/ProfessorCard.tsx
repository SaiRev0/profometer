'use client';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import RatingStars from '@/components/ui/rating-stars';
import { Professor } from '@/lib/types';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Star, Users } from 'lucide-react';

interface ProfessorCardProps {
  professor: Professor;
  variant?: 'compact' | 'detailed';
  isLoading?: boolean;
  showStars?: boolean;
}

export default function ProfessorCard({
  professor,
  variant = 'detailed',
  isLoading = false,
  showStars = true
}: ProfessorCardProps) {
  if (isLoading) {
    return <ProfessorCardSkeleton variant={variant} />;
  }

  const isCompact = variant === 'compact';
  const initials = professor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const cardContent = (
    <Card
      className={cn(
        'border-border/70 w-full overflow-hidden transition-all duration-200 hover:shadow-md dark:bg-gray-800',
        isCompact ? 'h-25' : 'h-full'
      )}>
      <CardContent className={cn('p-4', isCompact ? 'pb-2' : 'pb-3')}>
        <div className='flex items-start gap-3'>
          <Avatar className='h-12 w-12'>
            {professor.photoUrl ? (
              <AvatarImage src={professor.photoUrl} alt={professor.name} />
            ) : (
              <AvatarFallback className='bg-primary/10 text-primary'>{initials}</AvatarFallback>
            )}
          </Avatar>

          <div className='flex-1'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className={cn('line-clamp-1 font-bold', isCompact ? 'text-base' : 'text-lg')}>{professor.name}</h3>
                {!isCompact && (
                  <p className='text-muted-foreground mb-1 line-clamp-1 text-sm'>{professor.department.name}</p>
                )}
              </div>

              <Badge
                variant={
                  professor.statistics.ratings.overall >= 3.5
                    ? 'default'
                    : professor.statistics.ratings.overall <= 3.4
                      ? 'destructive'
                      : 'secondary'
                }>
                {professor.statistics.ratings.overall}
              </Badge>
            </div>
            <div className='text-muted-foreground flex items-center gap-4 text-sm'>
              <span className='flex items-center gap-1'>
                <Star className='h-3 w-3' />
                {professor.statistics.totalReviews} reviews
              </span>
              <span className='flex items-center gap-1'>
                <BookOpen className='h-3 w-3' />
                {professor.totalCourses} courses
              </span>
            </div>

            {showStars && (
              <div className='mt-1 mb-2 flex items-center'>
                <RatingStars value={professor.statistics.ratings.overall} size={isCompact ? 'sm' : 'md'} />
                <span className='text-muted-foreground ml-2 text-xs'>({professor.statistics.totalReviews})</span>
              </div>
            )}

            {!isCompact && professor.reviews[0] && (
              <blockquote className='text-muted-foreground border-primary/30 mt-2 line-clamp-2 border-l-2 pl-2 text-sm'>
                "{professor.reviews[0].comment}"
              </blockquote>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={cn('mt-[-1rem] flex flex-row-reverse items-center px-4 pt-0 pb-2', isCompact && 'mt-[-1.5rem]')}>
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
      <Link href={`/professor/${professor.id}`}>{cardContent}</Link>
    </motion.div>
  );
}

function ProfessorCardSkeleton({ variant = 'detailed' }: { variant?: 'compact' | 'detailed' }) {
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
