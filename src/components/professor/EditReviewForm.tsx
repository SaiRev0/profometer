'use client';

import { useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import { useGetProfessorById } from '@/hooks/useGetProfessorById';
import { CourseReview, ProfessorReview } from '@/lib/types';

import ReviewForm from './ReviewForm';
import { useSession } from 'next-auth/react';

interface EditReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ProfessorReview & {
    professor?: { id: string; name: string };
    course?: { code: string; name: string };
  };
}

export function EditReviewForm({ open, onOpenChange, review }: EditReviewFormProps) {
  const { status } = useSession();
  const router = useRouter();
  const { data: professorData, isLoading } = useGetProfessorById(review.professorId);

  const initialData = useMemo(
    () => ({
      professorId: review.professorId,
      courseCode: review.courseCode,
      semester: review.semester,
      anonymous: review.anonymous,
      ratings: {
        teaching: review.ratings.teaching,
        helpfulness: review.ratings.helpfulness,
        fairness: review.ratings.fairness,
        clarity: review.ratings.clarity,
        communication: review.ratings.communication,
        overall: review.ratings.overall
      },
      comment: review.comment,
      statistics: review.statistics,
      grade: review.grade || '',
      reviewId: review.id
    }),
    [review]
  );

  const handleSignInClick = () => {
    onOpenChange(false);
    router.push('/signin');
  };

  return status === 'authenticated' ? (
    isLoading ? (
      <div className='grid gap-6 py-4'>
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-6 w-32' />
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-full' />
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : professorData ? (
      <ReviewForm
        professor={professorData}
        modalState={open}
        setModalState={onOpenChange}
        setAddCourseDialogOpen={() => {}}
        initialData={initialData}
      />
    ) : null
  ) : (
    <div className='flex flex-col items-center gap-4 py-6'>
      <button onClick={handleSignInClick} className='bg-primary w-full max-w-[200px] rounded-lg px-4 py-2 text-white'>
        Sign In
      </button>
    </div>
  );
}
