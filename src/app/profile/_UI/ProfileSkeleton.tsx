import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className='mx-auto mt-4 max-w-4xl space-y-6'>
      {/* Profile Overview Skeleton */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div>
              <Skeleton className='mb-2 h-7 w-48' />
              <Skeleton className='h-5 w-32' />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-48' />
              <Skeleton className='h-5 w-40' />
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='text-center'>
                <Skeleton className='mx-auto mb-1 h-8 w-12' />
                <Skeleton className='mx-auto h-4 w-16' />
              </div>
              <div className='text-center'>
                <Skeleton className='mx-auto mb-1 h-8 w-12' />
                <Skeleton className='mx-auto h-4 w-20' />
              </div>
              <div className='text-center'>
                <Skeleton className='mx-auto mb-1 h-8 w-12' />
                <Skeleton className='mx-auto h-4 w-20' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section Skeleton */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-5 w-5' />
              <Skeleton className='h-7 w-32' />
            </div>
            <Skeleton className='h-9 w-32' />
          </div>
          <Skeleton className='mt-1 h-5 w-48' />
        </CardHeader>

        <CardContent>
          <div className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            {/* Review Cards Skeleton */}
            {[...Array(3)].map((_, index) => (
              <div key={index} className='space-y-4 rounded-lg border p-4'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-2'>
                    <Skeleton className='h-6 w-48' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                  <Skeleton className='h-8 w-24' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
                <div className='flex gap-2'>
                  <Skeleton className='h-8 w-20' />
                  <Skeleton className='h-8 w-20' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
