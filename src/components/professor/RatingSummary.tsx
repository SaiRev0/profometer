'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Professor } from '@/lib/types';

interface ProfessorStatsProps {
  professor: Professor;
  setModalState: (state: boolean) => void;
}

export default function RatingSummary({ professor, setModalState }: ProfessorStatsProps) {
  return (
    <Card className='mb-6'>
      <CardHeader className='pb-2'>
        <div className='flex flex-wrap items-baseline justify-between gap-2'>
          <CardTitle>Professor Rating</CardTitle>
          <div className='flex items-center'>
            <Badge
              className='mr-2 px-3 py-1 text-lg'
              variant={
                professor.ratings.overall >= 4
                  ? 'success'
                  : professor.ratings.overall <= 2
                    ? 'destructive'
                    : 'secondary'
              }>
              {professor.ratings.overall.toFixed(1)}
            </Badge>
            <p className='text-muted-foreground text-sm'>{professor.numReviews} ratings</p>
          </div>
        </div>
        <CardDescription>Based on student ratings and reviews</CardDescription>
      </CardHeader>

      <CardContent>
        <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* Rating Metrics */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Rating Breakdown</h3>

            {Object.entries(professor.ratings)
              .filter(([key]) => key !== 'overall')
              .map(([key, value]) => (
                <div key={key} className='flex items-center justify-between gap-2'>
                  <p className='w-28 text-sm capitalize'>{key}</p>
                  <Progress value={value * 20} className='h-2 flex-1' />
                  <p className='w-8 text-right text-sm font-medium'>{value.toFixed(1)}</p>
                </div>
              ))}
          </div>

          {/* Statistics */}
          <div>
            <h3 className='mb-3 text-sm font-medium'>Statistics</h3>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-sm'>Would Recommend</p>
                <Badge variant='outline' className='bg-chart-1/10'>
                  {professor.statistics.wouldRecommend}%
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-sm'>Attendance Rating</p>
                <Badge variant='outline' className='bg-chart-2/10'>
                  {professor.statistics.attendanceRating}%
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-sm'>Quizes</p>
                <Badge variant='outline' className='bg-chart-3/10'>
                  {professor.statistics.quizes}%
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-sm'>Assignments</p>
                <Badge variant='outline' className='bg-chart-4/10'>
                  {professor.statistics.assignments}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={() => setModalState(true)} className='w-full'>
          Rate Professor {professor.name.split(' ')[1]}
        </Button>
      </CardFooter>
    </Card>
  );
}
