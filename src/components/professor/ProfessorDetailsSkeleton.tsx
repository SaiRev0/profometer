import { ReviewCardSkeleton } from '@/components/cards/ReviewCard';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfessorDetailsSkeleton() {
  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <div className='mb-6 flex items-center gap-2'>
        <Skeleton className='h-9 w-24' />
      </div>

      <div className='flex flex-col gap-6 md:flex-row'>
        {/* Sidebar Skeleton */}
        <div className='md:w-1/3'>
          <Card>
            <CardContent className='p-4'>
              <Skeleton className='mb-4 h-48 w-full rounded-lg' />
              <Skeleton className='mb-2 h-8 w-3/4' />
              <Skeleton className='mb-4 h-4 w-1/2' />

              <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='flex items-start gap-2'>
                    <Skeleton className='mt-1 h-4 w-4' />
                    <div className='flex-1'>
                      <Skeleton className='h-4 w-full' />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className='my-4' />

              <div className='space-y-4'>
                {[1, 2].map((i) => (
                  <div key={i} className='flex items-start gap-2'>
                    <Skeleton className='mt-1 h-4 w-4' />
                    <div className='flex-1'>
                      <Skeleton className='mb-1 h-4 w-3/4' />
                      <Skeleton className='h-4 w-1/2' />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Skeleton */}
        <div className='md:w-2/3'>
          {/* Rating Summary Skeleton */}
          <Card className='mb-6'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-6 w-32' />
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
              <Skeleton className='mt-2 h-4 w-48' />
            </CardHeader>

            <CardContent>
              <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Rating Metrics Skeleton */}
                <div className='space-y-3'>
                  <Skeleton className='mb-4 h-5 w-36' />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='flex items-center justify-between gap-2'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-2 flex-1' />
                      <Skeleton className='h-4 w-8' />
                    </div>
                  ))}
                </div>

                {/* Statistics Skeleton */}
                <div>
                  <Skeleton className='mb-4 h-5 w-24' />
                  <div className='space-y-3'>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className='flex items-center justify-between'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-6 w-16' />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags Skeleton */}
              <div>
                <Skeleton className='mb-3 h-5 w-24' />
                <div className='flex flex-wrap gap-1.5'>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className='h-6 w-20' />
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Skeleton className='h-10 w-full' />
            </CardFooter>
          </Card>

          {/* Courses Section Skeleton */}
          <Card className='mb-6'>
            <CardHeader className='pb-2'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-48' />
            </CardHeader>

            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className='h-6 w-24' />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section Skeleton */}
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
      </div>
    </div>
  );
}
