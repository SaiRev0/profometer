'use client';

import { notFound } from 'next/navigation';

import ProfessorDetails from '@/components/professor';
import { useProfessor } from '@/hooks/use-professor';

export default function ProfessorClientWrapper({ id }: { id: string }) {
  const { data: professor, isLoading, error } = useProfessor(id);

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
