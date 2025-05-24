'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RatingStars from '@/components/ui/rating-stars';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useEditReview } from '@/hooks/useEditReview';
import { CourseReview, ProfessorReview } from '@/lib/types';
import { cn } from '@/lib/utils';

import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface EditReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: (ProfessorReview | CourseReview) & {
    professor?: { id: string; name: string };
    course?: { code: string; name: string };
  };
}

export function EditReviewForm({ open, onOpenChange, review }: EditReviewFormProps) {
  const { status } = useSession();
  const router = useRouter();
  const { editReview, isLoading } = useEditReview();

  // Add helper function to get current year
  const getCurrentYear = () => new Date().getFullYear();

  // Initialize state with review data
  const [reviewRatings, setReviewRatings] = useState(review.ratings);
  const [reviewStatistics, setReviewStatistics] = useState(review.statistics);
  const [reviewComment, setReviewComment] = useState(review.comment);
  const [reviewGrade, setReviewGrade] = useState(review.grade || 'none');
  const [reviewSemester, setReviewSemester] = useState(review.semester);
  const [semesterType, setSemesterType] = useState<'Odd' | 'Even'>(review.semester.split('-')[0] as 'Odd' | 'Even');
  const [semesterYear, setSemesterYear] = useState<number>(parseInt(review.semester.split('-')[1]));

  const handleSemesterTypeChange = (value: 'Odd' | 'Even') => {
    setSemesterType(value);
    setReviewSemester(`${value}-${semesterYear}`);
  };

  const handleSemesterYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    setSemesterYear(year);
    setReviewSemester(`${semesterType}-${year}`);
  };

  const handleSignInClick = () => {
    onOpenChange(false);
    router.push('/signin');
  };

  const handleSubmitReview = async () => {
    // Validate year
    const year = semesterYear;
    const currentYear = getCurrentYear();

    if (isNaN(year) || year < 2012 || year > currentYear) {
      toast.error(`Year must be between 2012 and ${currentYear}`);
      return;
    }

    // Validate semester
    if (!semesterType || !semesterYear) {
      toast.error('Please select both semester type and year.');
      return;
    }

    // Check if all ratings are provided
    if (Object.values(reviewRatings).some((rating) => rating === 0)) {
      toast.error('Please provide ratings for all categories.');
      return;
    }

    // Check if comment is provided
    if (!reviewComment.trim()) {
      toast.error('Please provide a written review.');
      return;
    }

    // Validate statistics
    if (Object.values(reviewStatistics).some((stat) => stat === -1)) {
      toast.error('Please provide statistics for all categories.');
      return;
    }

    // Calculate overall rating based on review type
    const overallRating =
      review.type === 'professor'
        ? Number(
            (
              (reviewRatings as any).teaching +
              (reviewRatings as any).helpfulness +
              (reviewRatings as any).fairness +
              (reviewRatings as any).clarity +
              (reviewRatings as any).communication
            ).toFixed(1)
          ) / 5
        : Number(
            (
              (reviewRatings as any).difficulty +
              (reviewRatings as any).workload +
              (reviewRatings as any).content +
              (reviewRatings as any).numerical
            ).toFixed(1)
          ) / 4;

    try {
      await editReview({
        reviewId: review.id,
        professorId: review.professor?.id || review.professorId,
        courseCode: review.course?.code || review.courseCode,
        semester: reviewSemester,
        anonymous: review.anonymous, // Keep the original anonymous setting
        ratings: {
          ...reviewRatings,
          overall: overallRating
        },
        comment: reviewComment,
        statistics: reviewStatistics,
        grade: reviewGrade === 'none' ? undefined : reviewGrade,
        type: review.type
      });

      toast.success('Review Updated!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review. Please try again.', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (isLoading) return; // Prevent closing while loading
        onOpenChange(newOpen);
      }}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          {status === 'authenticated' ? (
            <>
              <DialogTitle>Edit Review</DialogTitle>
              <DialogDescription>Update your review to help other students make informed decisions.</DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Sign in to Edit Review</DialogTitle>
              <DialogDescription>
                You need to sign in with your IIT BHU Google account to edit this review.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {status === 'authenticated' ? (
          <div className='grid gap-6 py-4'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div>
                <Label>Course</Label>
                <div className='mt-1.5 rounded-md border px-3 py-2 text-sm'>
                  {review.course?.code || review.courseCode} - {review.course?.name}
                </div>
              </div>

              <div>
                <Label htmlFor='semester'>Semester</Label>
                <div className='flex gap-2'>
                  <Select value={semesterType} onValueChange={handleSemesterTypeChange}>
                    <SelectTrigger className='w-[120px]'>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Odd'>Odd</SelectItem>
                      <SelectItem value='Even'>Even</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type='number'
                    placeholder='Year'
                    value={semesterYear}
                    onChange={handleSemesterYearChange}
                    className='w-[100px]'
                    min={2012}
                    max={getCurrentYear()}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='font-medium'>Ratings</h3>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {Object.entries(reviewRatings)
                  .filter(([key]) => key !== 'overall')
                  .map(([key, value]) => (
                    <div key={key} className='space-y-1.5'>
                      <Label htmlFor={key} className='capitalize'>
                        {key}
                      </Label>
                      <div id={key}>
                        <RatingStars
                          value={value as number}
                          interactive={true}
                          onChange={(newValue) =>
                            setReviewRatings((prev) => ({
                              ...prev,
                              [key]: newValue
                            }))
                          }
                          showValue={true}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='review'>Your Review</Label>
              <Textarea
                id='review'
                rows={5}
                placeholder='Share your experience...'
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='space-y-2'>
                <Label>Would Recommend?</Label>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant={(reviewStatistics as any).wouldRecommend === 1 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setReviewStatistics((prev) => ({
                        ...prev,
                        wouldRecommend: 1
                      }))
                    }>
                    Yes
                  </Button>
                  <Button
                    type='button'
                    variant={(reviewStatistics as any).wouldRecommend === 0 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setReviewStatistics((prev) => ({
                        ...prev,
                        wouldRecommend: 0
                      }))
                    }>
                    No
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Quizzes?</Label>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant={(reviewStatistics as any).quizes === 1 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setReviewStatistics((prev) => ({
                        ...prev,
                        quizes: 1
                      }))
                    }>
                    Yes
                  </Button>
                  <Button
                    type='button'
                    variant={(reviewStatistics as any).quizes === 0 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setReviewStatistics((prev) => ({
                        ...prev,
                        quizes: 0
                      }))
                    }>
                    No
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Assignments?</Label>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant={(reviewStatistics as any).assignments === 1 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setReviewStatistics((prev) => ({
                        ...prev,
                        assignments: 1
                      }))
                    }>
                    Yes
                  </Button>
                  <Button
                    type='button'
                    variant={(reviewStatistics as any).assignments === 0 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() =>
                      setReviewStatistics((prev) => ({
                        ...prev,
                        assignments: 0
                      }))
                    }>
                    No
                  </Button>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Attendance Rating</Label>
              <div className='relative mx-auto w-[95%] pt-12'>
                <div className='pointer-events-none absolute top-0 left-0 flex w-full'>
                  <div className='absolute left-0 flex w-12 translate-x-[-35%] flex-col items-center'>
                    <span className='text-base sm:text-lg'>🚫</span>
                    <span className='text-center text-xs leading-tight sm:text-sm'>Strict</span>
                  </div>
                  <div className='absolute left-1/4 flex w-12 translate-x-[-50%] flex-col items-center'>
                    <span className='text-base sm:text-lg'>😓</span>
                    <span className='text-center text-xs leading-tight sm:text-sm'>Tight</span>
                  </div>
                  <div className='absolute left-1/2 flex w-12 translate-x-[-50%] flex-col items-center'>
                    <span className='text-base sm:text-lg'>😐</span>
                    <span className='text-center text-xs leading-tight sm:text-sm'>Okay</span>
                  </div>
                  <div className='absolute left-3/4 flex w-12 translate-x-[-50%] flex-col items-center'>
                    <span className='text-base sm:text-lg'>🙂</span>
                    <span className='text-center text-xs leading-tight sm:text-sm'>Chill</span>
                  </div>
                  <div className='absolute left-full flex w-12 translate-x-[-65%] flex-col items-center'>
                    <span className='text-base sm:text-lg'>😎</span>
                    <span className='text-center text-xs leading-tight sm:text-sm'>Loose</span>
                  </div>
                </div>
                <Slider
                  id='attendanceScore'
                  min={0}
                  max={100}
                  step={12.5}
                  value={[(reviewStatistics as any).attendanceRating]}
                  onValueChange={(value) =>
                    setReviewStatistics((prev) => ({
                      ...prev,
                      attendanceRating: value[0]
                    }))
                  }
                  className='mt-2'
                />
              </div>
            </div>

            <div>
              <Label htmlFor='grade'>Your Grade (Optional)</Label>
              <Select value={reviewGrade} onValueChange={setReviewGrade}>
                <SelectTrigger id='grade'>
                  <SelectValue placeholder='Select your grade' />
                </SelectTrigger>
                <SelectContent>
                  {['A*', 'A', 'A-', 'B', 'B-', 'C', 'C-', 'F', 'Z', 'S', 'I'].map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='mt-2 flex justify-end gap-2'>
              <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Review'}
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-4 py-6'>
            <Button onClick={handleSignInClick} size='lg' className='w-full max-w-[200px]'>
              Sign In
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
