import React from 'react';

import { Course, Professor } from '@/lib/types';

import ProfessorCard from '../cards/ProfessorCard';
import { Users } from 'lucide-react';

export default function CourseProfessors({ course, professors }: { course: Course; professors: Professor[] }) {
  return (
    <div className='mb-8'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-xl font-bold'>
          <Users className='text-primary h-5 w-5' />
          Course Professors
        </h2>
      </div>

      {professors && professors.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {professors.map((professor: Professor) => (
            <ProfessorCard key={professor.id} professor={professor} variant='compact' />
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground text-center text-sm'>No professors found for this course.</p>
      )}
    </div>
  );
}
