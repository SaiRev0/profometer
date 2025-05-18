import ProfessorCard from '@/components/cards/ProfessorCard';
import { useGetProfessors } from '@/hooks/useGetProfessors';

import { Star } from 'lucide-react';

export default function RecentlyReviewedSection() {
  const { data: professors, isLoading } = useGetProfessors({
    limit: 4,
    variant: 'recently-reviewed'
  });

  return (
    <section className='mt-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Star className='text-primary h-5 w-5' />
          <h2 className='text-2xl font-bold'>Recently Reviewed</h2>
        </div>
      </div>
      <div className='scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4'>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className='min-w-[250px] grow snap-start sm:min-w-[280px]'>
                <ProfessorCard professor={professors?.professors[0]} isLoading={true} variant='detailed' />
              </div>
            ))
          : professors?.professors.slice(0, 4).map((professor) => (
              <div key={professor.id} className='min-w-[300px] grow snap-start sm:min-w-[320px]'>
                <ProfessorCard professor={professor} variant='detailed' />
              </div>
            ))}
      </div>
    </section>
  );
}
