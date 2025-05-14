'use client';

import { notFound } from 'next/navigation';

import ProfessorDetails from '@/components/professor';
import { useGetProfessorById } from '@/hooks/useGetProfessorById';

export default function ProfessorClientWrapper({ id }: { id: string }) {
  const { data: professor, isLoading, error } = useGetProfessorById(id);

  if (error) {
    notFound();
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!professor) {
    notFound();
  }

  return <ProfessorDetails professor={professor} initialReviews={professor.reviews} />;
}
