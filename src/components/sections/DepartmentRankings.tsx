'use client';

import React, { Suspense } from 'react';

import Link from 'next/link';

import DepartmentCard, { DepartmentCardSkeleton } from '@/components/cards/DepartmentCard';
import { Button } from '@/components/ui/button';
import { useGetDepartments } from '@/hooks/useGetDepartments';
import { useSmartLoading } from '@/hooks/useSmartLoading';
import { Department } from '@/lib/types';

const DepartmentRankingsUI = ({ isLoading, departments }: { isLoading: boolean; departments?: Department[] }) => (
  <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
    {isLoading
      ? Array.from({ length: 8 }).map((_, index) => <DepartmentCardSkeleton key={index} />)
      : departments?.map((department: Department, index: number) => (
          <DepartmentCard key={department.code} department={department} index={index} />
        ))}
  </div>
);

// Separate component for data fetching
function DepartmentRankingsContent() {
  const { departments, isLoading } = useGetDepartments({ limit: 8 });

  return <DepartmentRankingsUI isLoading={isLoading} departments={departments} />;
}

// Main component
export function DepartmentRankings() {
  const { ref, shouldLoad } = useSmartLoading({
    threshold: 0.1,
    rootMargin: '100px',
    timeThreshold: 5000 // Load after 5 seconds if not scrolled to
  });

  return (
    <section ref={ref} className='pt-16'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>Department Rankings</h2>
          <p className='text-muted-foreground mx-auto max-w-2xl'>
            See how different departments at IIT BHU compare based on student ratings
          </p>
        </div>
        {shouldLoad ? (
          <Suspense fallback={<DepartmentRankingsUI isLoading={true} />}>
            <DepartmentRankingsContent />
          </Suspense>
        ) : (
          <DepartmentRankingsUI isLoading={true} />
        )}
        <div className='mt-10 text-center'>
          <Button asChild>
            <Link href='/department'>View All Departments</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
