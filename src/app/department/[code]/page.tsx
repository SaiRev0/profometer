'use client';

import React from 'react';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { getDepartmentsByRating } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Star, Users } from 'lucide-react';

interface DepartmentPageProps {
  params: {
    code: string;
  };
}

export default function DepartmentPage({ params }: DepartmentPageProps) {
  const departments = getDepartmentsByRating();
  const department = departments.find((dept) => dept.code.toLowerCase() === params.code.toLowerCase());

  if (!department) {
    notFound();
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-success';
    if (rating >= 4.0) return 'bg-primary';
    if (rating >= 3.5) return 'bg-amber-500';
    if (rating >= 3.0) return 'bg-orange-500';
    return 'bg-error';
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mb-8'>
        <Button variant='ghost' size='sm' className='mb-4' asChild>
          <Link href='/department' className='flex items-center'>
            <ChevronLeft className='mr-1 h-4 w-4' />
            Back to Departments
          </Link>
        </Button>

        <div className='flex items-start justify-between'>
          <div>
            <h1 className='mb-2 text-4xl font-bold'>{department.name}</h1>
            <p className='text-muted-foreground text-lg'>{department.code}</p>
          </div>
          <div className='bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full'>
            <BookOpen className='h-8 w-8' />
          </div>
        </div>
      </motion.div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h2 className='mb-4 text-2xl font-semibold'>Department Overview</h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div>
                <div className='mb-2 flex items-center'>
                  <Users className='text-primary mr-2 h-5 w-5' />
                  <span className='font-medium'>Number of Professors</span>
                </div>
                <p className='text-2xl font-bold'>{department.numProfessors}</p>
              </div>
              <div>
                <div className='mb-2 flex items-center'>
                  <Star className='mr-2 h-5 w-5 text-amber-500' />
                  <span className='font-medium'>Average Rating</span>
                </div>
                <p className='text-2xl font-bold'>{department.avgRating.toFixed(1)}/5.0</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h2 className='mb-4 text-2xl font-semibold'>Rating Distribution</h2>
            <div className='space-y-4'>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className='flex items-center'>
                  <div className='w-12 text-sm font-medium'>{rating} stars</div>
                  <div className='mx-4 h-4 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700'>
                    <div
                      className={cn('h-full rounded-full', getRatingColor(rating))}
                      style={{ width: `${(rating / 5) * 100}%` }}
                    />
                  </div>
                  <div className='w-12 text-right text-sm'>
                    {Math.round((rating / 5) * department.numReviews)} reviews
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h2 className='mb-4 text-2xl font-semibold'>Quick Stats</h2>
            <div className='space-y-4'>
              <div>
                <div className='text-muted-foreground text-sm'>Total Reviews</div>
                <div className='text-2xl font-bold'>{department.numReviews}</div>
              </div>
              <div>
                <div className='text-muted-foreground text-sm'>Department Code</div>
                <div className='text-2xl font-bold'>{department.code}</div>
              </div>
              <div>
                <div className='text-muted-foreground text-sm'>Professors per Review</div>
                <div className='text-2xl font-bold'>
                  {(department.numProfessors / department.numReviews).toFixed(1)}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
