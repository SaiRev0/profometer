import { ReviewCardSkeleton } from '@/components/cards/ReviewCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function CourseDetailsSkeleton() {
  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <div className='mb-6 flex items-center gap-2'>
        <Skeleton className='h-9 w-24' />
      </div>

      {/* Course Overview Card */}
      <Card className='mb-6'>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <Skeleton className='mb-2 h-8 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className='p-4'>
                  <div className='flex flex-col items-center text-center'>
                    <Skeleton className='mb-2 h-6 w-6' />
                    <Skeleton className='mb-1 h-4 w-20' />
                    <Skeleton className='h-6 w-12' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Skeleton className='mb-6 h-16 w-full' />

          <div className='grid gap-4'>
            <div>
              <Skeleton className='mb-2 h-5 w-32' />
              <div className='flex flex-wrap gap-1.5'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className='h-6 w-24' />
                ))}
              </div>
            </div>

            <div>
              <Skeleton className='mb-2 h-5 w-32' />
              <div className='flex flex-wrap gap-1.5'>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className='h-6 w-32' />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professors Section */}
      <div className='mb-8'>
        <div className='mb-4 flex items-center justify-between'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-9 w-24' />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='flex-1'>
                    <Skeleton className='mb-1 h-5 w-32' />
                    <Skeleton className='mb-2 h-4 w-24' />
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Skeleton key={j} className='h-4 w-4' />
                      ))}
                    </div>
                  </div>
                  <Skeleton className='h-8 w-16' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-9 w-32' />
        </div>

        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsSkeleton;
