'use client';

import { useState } from 'react';

import { notFound } from 'next/navigation';

import ProfessorDetails from '@/components/professor/professor-details';
import { useProfessor } from '@/hooks/use-professor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function ProfessorContent({ id }: { id: string }) {
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

export default function ProfessorClientWrapper({ id }: { id: string }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ProfessorContent id={id} />
    </QueryClientProvider>
  );
}
