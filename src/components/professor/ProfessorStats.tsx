'use client';

import { Progress } from '@/components/ui/progress';
import { Professor } from '@/lib/types';

interface ProfessorStatsProps {
  professor: Professor;
}

export default function ProfessorStats({ professor }: ProfessorStatsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <div className='space-y-4'>
        <div>
          <h3 className='mb-2 text-sm font-medium'>Would Recommend</h3>
          <div className='flex items-center gap-2'>
            <Progress value={professor.statistics.wouldRecommend} className='h-2' />
            <span className='text-muted-foreground text-sm'>{professor.statistics.wouldRecommend}%</span>
          </div>
        </div>
        <div>
          <h3 className='mb-2 text-sm font-medium'>Attendance Mandatory</h3>
          <div className='flex items-center gap-2'>
            <Progress value={professor.statistics.attendanceMandatory} className='h-2' />
            <span className='text-muted-foreground text-sm'>{professor.statistics.attendanceMandatory}/5</span>
          </div>
        </div>
      </div>
      <div className='space-y-4'>
        <div>
          <h3 className='mb-2 text-sm font-medium'>Quizes</h3>
          <div className='flex items-center gap-2'>
            <Progress value={professor.statistics.quizes} className='h-2' />
            <span className='text-muted-foreground text-sm'>{professor.statistics.quizes}%</span>
          </div>
        </div>
        <div>
          <h3 className='mb-2 text-sm font-medium'>Assignments</h3>
          <div className='flex items-center gap-2'>
            <Progress value={professor.statistics.assignments} className='h-2' />
            <span className='text-muted-foreground text-sm'>{professor.statistics.assignments}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
