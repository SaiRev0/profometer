import React from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Star, Users } from 'lucide-react';

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    code: string;
    avgRating: number;
    numProfessors: number;
    numCourses?: number;
    numReviews: number;
  };
  index?: number;
}

export function DepartmentCard({ department, index = 0 }: DepartmentCardProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-success';
    if (rating >= 4.0) return 'bg-primary';
    if (rating >= 3.5) return 'bg-amber-500';
    if (rating >= 3.0) return 'bg-orange-500';
    return 'bg-error';
  };

  return (
    <motion.div
      key={department.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className='border-border overflow-hidden rounded-lg border bg-white shadow-md dark:bg-gray-800'>
      <div className='p-6'>
        <div className='mb-4 flex items-start justify-between'>
          <div className='bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full'>
            <BookOpen className='h-5 w-5' />
          </div>
          <div className='flex items-center'>
            <Star className='mr-1 h-4 w-4 fill-amber-500 text-amber-500' />
            <span className='font-bold'>{department.avgRating}</span>
          </div>
        </div>

        <h3 className='font-heading mb-1 line-clamp-1 text-lg font-semibold'>{department.name}</h3>
        <div className='text-muted-foreground mb-4 flex items-center text-sm'>
          <span className='text-primary font-medium'>{department.code}</span>
          <span className='mx-2'>•</span>
          <div className='flex items-center'>
            <Users className='mr-1 h-3 w-3' />
            {department.numProfessors} profs
          </div>
          <div className='flex items-center'>
            <BookOpen className='mr-1 ml-2 h-3 w-3' />
            {department.numCourses} courses
          </div>
        </div>

        <div className='mb-4'>
          <div className='mb-1 flex justify-between text-sm'>
            <span>Average Rating</span>
            <span className='font-medium'>{department.avgRating}/5.0</span>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700'>
            <div
              className={cn('h-full rounded-full', getRatingColor(department.avgRating))}
              style={{ width: `${(department.avgRating / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className='flex items-center justify-between text-sm'>
          <span>{department.numReviews} reviews</span>
          <Button variant='ghost' size='sm' className='h-auto p-0' asChild>
            <Link href={`/department/${department.code}`} className='text-primary flex items-center'>
              View Department <ChevronRight className='ml-1 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
