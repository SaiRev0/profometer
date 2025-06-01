import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Course, Professor } from '@/lib/types';

import { BookOpen, Building, GraduationCap, NotebookPen, Star, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface CourseOverviewProps {
  course: Course;
  setModalState: (state: boolean) => void;
  professors: Professor[];
}

export default function CourseOverview({ course, setModalState, professors }: CourseOverviewProps) {
  const { status } = useSession();
  const router = useRouter();

  const handleButtonClick = () => {
    if (status === 'authenticated') {
      setModalState(true);
    } else {
      router.push('/signin');
    }
  };

  return (
    <Card className='mb-6'>
      {/* Course Header */}
      <CardHeader>
        <div className='flex flex-wrap items-baseline justify-between gap-2'>
          <div>
            <CardTitle className='flex items-center gap-2 text-2xl'>
              <BookOpen className='text-primary h-5 w-5' />
              {course.code}: {course.name}
            </CardTitle>
            <CardDescription className='flex items-center gap-1'>
              <Building className='h-4 w-4' />
              {course.department?.name || ''} • {course.credits} Credits
            </CardDescription>
          </div>

          {/* <div className='flex items-center'>
            <Badge
              className='mr-2 px-3 py-1 text-lg'
              variant={
                course.statistics.ratings.overall >= 4
                  ? 'default'
                  : course.statistics.ratings.overall <= 3
                    ? 'destructive'
                    : 'secondary'
              }>
              {course.statistics.ratings.overall}
            </Badge>
            <p className='text-muted-foreground text-sm'>{course.statistics.totalReviews || 0} reviews</p>
          </div> */}
        </div>
      </CardHeader>

      {/* General Stats */}
      <CardContent>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <Card className='bg-primary/5 border-primary/20'>
            <CardContent className='p-4'>
              <div className='flex flex-col items-center text-center'>
                <Users className='text-primary mb-2 h-6 w-6' />
                <p className='text-sm font-medium'>Professors</p>
                <p className='text-2xl font-bold'>{professors.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-chart-4/5 border-chart-4/20'>
            <CardContent className='p-4'>
              <div className='flex flex-col items-center text-center'>
                <Star className='text-chart-4 mb-2 h-6 w-6' />
                <p className='text-sm font-medium'>Average Rating</p>
                <p className='text-2xl font-bold'>{course.statistics.ratings.overall}</p>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-chart-1/5 border-chart-1/20'>
            <CardContent className='p-4'>
              <div className='flex flex-col items-center text-center'>
                <NotebookPen className='text-chart-1 mb-2 h-6 w-6' />
                <p className='text-sm font-medium'>Total Reviews</p>
                <p className='text-2xl font-bold'>{course.statistics.totalReviews}</p>
              </div>
            </CardContent>
          </Card>
          <Card className='bg-chart-3/5 border-chart-3/20'>
            <CardContent className='p-4'>
              <div className='flex flex-col items-center text-center'>
                <GraduationCap className='text-chart-3 mb-2 h-6 w-6' />
                <p className='text-sm font-medium'>Average Grade</p>
                <p className='text-2xl font-bold'>{course.statistics.percentages.averageGrade}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      {/* Rating Breakdown */}
      <CardContent>
        <div className='mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* Rating Metrics */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium'>Rating Breakdown</h3>

            {Object.entries(course.statistics.ratings)
              .filter(([key]) => key !== 'overall')
              .map(([key, value]) => (
                <div key={key} className='flex items-center justify-between gap-2'>
                  <p className='w-28 text-sm capitalize'>{key}</p>
                  <Progress value={value * 20} className='h-2 flex-1' />
                  <p className='w-8 text-right text-sm font-medium'>{value}</p>
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
                  {course.statistics.percentages.wouldRecommend}%
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-sm'>Attendance Rating</p>
                <Badge variant='outline' className='bg-chart-2/10'>
                  {course.statistics.percentages.attendanceRating}%
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-sm'>Quizes</p>
                <Badge variant='outline' className='bg-chart-3/10'>
                  {course.statistics.percentages.quizes}%
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <p className='text-sm'>Assignments</p>
                <Badge variant='outline' className='bg-chart-4/10'>
                  {course.statistics.percentages.assignments}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Review Button */}
      <CardFooter>
        <Button onClick={handleButtonClick} className='w-full'>
          {status === 'authenticated' ? `Rate Course ${course.code}` : 'Sign in to Write a Review'}
        </Button>
      </CardFooter>
    </Card>
  );
}
