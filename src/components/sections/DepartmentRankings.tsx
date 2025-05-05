'use client';

import React from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useDepartments } from '@/hooks/use-departments';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Star, Users } from 'lucide-react';

export function DepartmentRankings() {
  const { data: departments = [], isLoading } = useDepartments({ limit: 8 });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-success';
    if (rating >= 4.0) return 'bg-primary';
    if (rating >= 3.5) return 'bg-amber-500';
    if (rating >= 3.0) return 'bg-orange-500';

    return 'bg-error';
  };

  if (isLoading) {
    return (
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>Loading departments...</div>
        </div>
      </section>
    );
  }

  return (
    <section className='py-16'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>Department Rankings</h2>
          <p className='text-muted-foreground mx-auto max-w-2xl'>
            See how different departments at IIT BHU compare based on student ratings.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {departments.map((department, index) => (
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
                    {department.numProfessors} professors
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
          ))}
        </div>

        <div className='mt-10 text-center'>
          <Button asChild>
            <Link href='/department'>View All Departments</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
