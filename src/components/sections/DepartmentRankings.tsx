'use client';

import React from 'react';

import Link from 'next/link';

import { DepartmentCard } from '@/components/cards/DepartmentCard';
import { Button } from '@/components/ui/button';
import { useGetDepartments } from '@/hooks/useGetDepartments';
import { Department } from '@/lib/types';

import { motion } from 'framer-motion';

export function DepartmentRankings() {
  const { data: departments = [], isLoading } = useGetDepartments({ limit: 6 });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-success';
    if (rating >= 4.0) return 'bg-primary';
    if (rating >= 3.5) return 'bg-amber-500';
    if (rating >= 3.0) return 'bg-orange-500';

    return 'bg-error';
  };

  return (
    <section className='pt-16'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>Department Rankings</h2>
          <p className='text-muted-foreground mx-auto max-w-2xl'>
            See how different departments at IIT BHU compare based on student ratings
          </p>
        </motion.div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <DepartmentCard department={departments[0]} key={index} isLoading={true} />
              ))
            : departments.map((department: Department, index: number) => (
                <DepartmentCard key={department.code} department={department} index={index} />
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
