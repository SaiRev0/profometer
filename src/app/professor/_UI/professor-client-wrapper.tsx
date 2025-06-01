'use client';

import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import ProfessorDetails from '@/components/professor';
import ProfessorDetailsSkeleton from '@/components/professor/ProfessorDetailsSkeleton';
import { useGetProfessorById } from '@/hooks/useGetProfessorById';

export default function ProfessorClientWrapper({ id }: { id: string }) {
  const { data, isLoading, error } = useGetProfessorById(id);

  if (error) {
    notFound();
  }

  if (isLoading) {
    return <ProfessorDetailsSkeleton />;
  }

  if (!data || !data.professor) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfessorDetailsSkeleton />}>
      <ProfessorDetails professor={data.professor} courses={data.courses} />
    </Suspense>
  );
}
