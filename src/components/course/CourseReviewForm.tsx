'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RatingStars from '@/components/ui/rating-stars';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview } from '@/hooks/useCreateReview';
import { useEditReview } from '@/hooks/useEditReview';
import { useGetDepartmentProfessors } from '@/hooks/useGetDepartmentProfessors';
import { useSubmitAnonymousReview } from '@/hooks/useSubmitAnonymousReview';
import { getToken } from '@/lib/crypto/token-store';
import {
  getCurrentYear,
  getDefaultCourseRatings,
  getDefaultSemester,
  getDefaultStatistics,
  resetCourseReviewForm
} from '@/lib/review-form-utils';
import { Course, CourseReview } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from '@bprogress/next/app';
import { useIntersection } from '@mantine/hooks';

import { Search, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CourseReviewFormProps {
  course: Course;
  modalState: boolean;
  setModalState: (state: boolean) => void;
  initialData?: CourseReview;
}

export default function CourseReviewForm({ course, modalState, setModalState, initialData }: CourseReviewFormProps) {
  const { status } = useSession();
  const router = useRouter();
  const { createReview, isLoading: isCreating } = useCreateReview();
  const { editReview, isLoading: isEditing } = useEditReview();
  const isLoading = isCreating || isEditing;
  const formRef = useRef<HTMLDivElement>(null);
  const { departmentProfessors, isLoadingDepartmentProfessors } = useGetDepartmentProfessors(course.departmentCode);
  const { submitAnonymousReview, isSubmitting: isSubmittingAnonymous } = useSubmitAnonymousReview();
  const { ref: intersectionRef } = useIntersection({
    root: null,
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Anonymous review token state
  const [hasAnonymousToken, setHasAnonymousToken] = useState(false);
  const [cycleId, setCycleId] = useState<string>('');

  // Check if user has an anonymous token for this course
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Get current cycle from status endpoint
        const response = await fetch('/api/review/status');
        if (response.ok) {
          const data = await response.json();
          const cycle = data.cycleId;
          setCycleId(cycle);
          const token = await getToken(course.code, cycle);
          setHasAnonymousToken(token !== null && !token.used);
        }
      } catch {
        setHasAnonymousToken(false);
      }
    };

    if (status === 'authenticated' && modalState) {
      checkToken();
    }
  }, [course.code, status, modalState]);

  const [reviewProfessor, setReviewProfessor] = useState(initialData?.professorId || '');
  const [semesterType, setSemesterType] = useState<'Odd' | 'Even'>(
    initialData?.semester ? (initialData.semester.split('-')[0] as 'Odd' | 'Even') : 'Odd'
  );
  const [semesterYear, setSemesterYear] = useState<number>(
    initialData?.semester ? parseInt(initialData.semester.split('-')[1]) : getCurrentYear()
  );
  const [reviewSemester, setReviewSemester] = useState<string>(initialData?.semester || getDefaultSemester());
  const [reviewRatings, setReviewRatings] = useState(initialData?.ratings || getDefaultCourseRatings());
  const [reviewStatistics, setReviewStatistics] = useState(initialData?.statistics || getDefaultStatistics());
  const [reviewComment, setReviewComment] = useState(initialData?.comment || '');
  const [reviewGrade, setReviewGrade] = useState(initialData?.grade || '');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.anonymous ?? true);
  const [professorSearch, setProfessorSearch] = useState('');

  // Helper function to reset form to initial state
  const resetForm = () => {
    resetCourseReviewForm({
      setReviewRatings,
      setReviewStatistics,
      setReviewComment,
      setReviewProfessor,
      setProfessorSearch,
      setReviewSemester,
      setReviewGrade,
      setIsAnonymous,
      setModalState
    });
  };

  const handleSemesterTypeChange = (value: 'Odd' | 'Even') => {
    setSemesterType(value);
    setReviewSemester(`${value}-${semesterYear}`);
  };

  const handleSemesterYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    setSemesterYear(year);
    setReviewSemester(`${semesterType}-${year}`);
  };

  const filteredProfessors = departmentProfessors?.filter((professor) =>
    professor.name.toLowerCase().includes(professorSearch.toLowerCase())
  );

  const handleSubmitReview = async (useAnonymousToken: boolean = false) => {
    // Validate year
    const currentYear = getCurrentYear();

    if (isNaN(semesterYear) || semesterYear < 2012 || semesterYear > currentYear) {
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

    // Check if professor is selected
    if (!reviewProfessor) {
      toast.error('Please select the professor who taught this course.');
      return;
    }

    // Validate statistics
    if (Object.values(reviewStatistics).some((stat) => stat === -1)) {
      toast.error('Please provide statistics for all categories.');
      return;
    }

    const overallRating = Number(
      (
        Object.entries(reviewRatings)
          .filter(([key]) => key !== 'overall')
          .reduce((sum, [_, rating]) => sum + rating, 0) / 4
      ).toFixed(1)
    );

    const reviewData = {
      courseCode: course.code,
      professorId: reviewProfessor,
      semester: reviewSemester,
      anonymous: isAnonymous,
      ratings: {
        ...reviewRatings,
        overall: overallRating
      },
      comment: reviewComment,
      statistics: reviewStatistics,
      grade: reviewGrade || undefined,
      type: 'course' as const
    };

    try {
      if (initialData?.id) {
        await editReview({
          reviewId: initialData.id,
          ...reviewData
        });
        toast.success('Review Updated!');
        setModalState(false);
      } else if (useAnonymousToken && isAnonymous && hasAnonymousToken) {
        // Use token-based anonymous submission for enhanced privacy
        const result = await submitAnonymousReview(
          course.code,
          {
            text: reviewComment.trim(),
            rating: overallRating,
            courseCode: course.code,
            semester: reviewSemester,
            timestamp: Date.now(),
            ratings: {
              ...reviewRatings,
              overall: overallRating
            },
            statistics: reviewStatistics,
            grade: reviewGrade || undefined,
            type: 'course'
          },
          cycleId
        );

        if (result.success) {
          toast.success('Anonymous review submitted! It will be published after the next shuffle cycle.');
          setHasAnonymousToken(false);
          // Reset form
          resetForm();
        } else {
          toast.error(result.error || 'Failed to submit anonymous review.');
        }
      } else {
        await createReview(reviewData);
        toast.success('Review Submitted!');
        // Reset form only for new reviews
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleSignInClick = () => {
    setModalState(false);
    router.push('/signin');
  };

  return (
    <div ref={formRef}>
      <Dialog open={modalState} onOpenChange={setModalState}>
        <DialogContent className='sm:max-w-150'>
          <DialogHeader>
            {status === 'authenticated' ? (
              <>
                <DialogTitle>{initialData ? 'Edit Review' : `Rate Course ${course.code}`}</DialogTitle>
                <DialogDescription>
                  {initialData
                    ? 'Update your review to help other students make informed decisions.'
                    : 'Share your experience with this course to help other students. All reviews are moderated for appropriate content.'}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Sign in to Write a Review</DialogTitle>
                <DialogDescription>
                  You need to sign in with your IIT BHU Google account to write a review for this course.
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          {status === 'authenticated' ? (
            <div className='grid gap-6 py-4'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <Label htmlFor='professor'>Professor</Label>
                  <Select value={reviewProfessor} onValueChange={setReviewProfessor}>
                    <SelectTrigger id='professor'>
                      <SelectValue placeholder='Select professor' />
                    </SelectTrigger>
                    <SelectContent showScrollButtons={false}>
                      <div className='bg-background sticky top-0 z-10 border-b p-2'>
                        <div className='relative'>
                          <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                          <Input
                            placeholder='Search professors...'
                            value={professorSearch}
                            onChange={(e) => setProfessorSearch(e.target.value)}
                            className='pl-8'
                          />
                        </div>
                      </div>
                      {isLoadingDepartmentProfessors ? (
                        <div className='text-muted-foreground p-2 text-center text-sm'>Loading...</div>
                      ) : filteredProfessors?.length === 0 ? (
                        <div className='text-muted-foreground p-2 text-center text-sm'>No professors found</div>
                      ) : (
                        filteredProfessors?.map((professor) => (
                          <SelectItem key={professor.id} value={professor.id}>
                            {professor.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='semester'>Semester</Label>
                  <div className='flex gap-2'>
                    <Select value={semesterType} onValueChange={handleSemesterTypeChange}>
                      <SelectTrigger className='w-30'>
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
                      className='w-25'
                      min={2012}
                      max={getCurrentYear()}
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='font-medium'>Course Ratings</h3>
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
                            value={value}
                            interactive={true}
                            onChange={(newValue) =>
                              setReviewRatings({
                                ...reviewRatings,
                                [key]: newValue
                              })
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
                  placeholder='Share your experience with this course...'
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
                      variant={reviewStatistics.wouldRecommend === 1 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setReviewStatistics({ ...reviewStatistics, wouldRecommend: 1 })}>
                      Yes
                    </Button>
                    <Button
                      type='button'
                      variant={reviewStatistics.wouldRecommend === 0 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setReviewStatistics({ ...reviewStatistics, wouldRecommend: 0 })}>
                      No
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Quizzes?</Label>
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant={reviewStatistics.quizes === 1 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setReviewStatistics({ ...reviewStatistics, quizes: 1 })}>
                      Yes
                    </Button>
                    <Button
                      type='button'
                      variant={reviewStatistics.quizes === 0 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setReviewStatistics({ ...reviewStatistics, quizes: 0 })}>
                      No
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Assignments?</Label>
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant={reviewStatistics.assignments === 1 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setReviewStatistics({ ...reviewStatistics, assignments: 1 })}>
                      Yes
                    </Button>
                    <Button
                      type='button'
                      variant={reviewStatistics.assignments === 0 ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setReviewStatistics({ ...reviewStatistics, assignments: 0 })}>
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
                    value={[reviewStatistics.attendanceRating]}
                    onValueChange={(value) => setReviewStatistics({ ...reviewStatistics, attendanceRating: value[0] })}
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
              {!initialData && (
                <>
                  <div className='flex items-center space-x-2'>
                    <Switch id='anonymous' checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    <Label htmlFor='anonymous' className='flex items-center gap-2'>
                      Submit anonymously
                      {hasAnonymousToken && isAnonymous && (
                        <span className='flex items-center gap-1 text-xs text-green-600'>
                          <Shield className='h-3 w-3' />
                          Enhanced privacy
                        </span>
                      )}
                    </Label>
                  </div>
                  <p className={cn('-mt-6 text-sm text-green-600', !isAnonymous && 'hidden')}>
                    {hasAnonymousToken
                      ? 'Your review will be cryptographically unlinkable to your account.'
                      : 'Can not be traced back to you.'}
                  </p>
                </>
              )}

              <div className='mt-2 flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setModalState(false)}
                  disabled={isLoading || isSubmittingAnonymous}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmitReview(hasAnonymousToken)}
                  disabled={isLoading || isSubmittingAnonymous}>
                  {isLoading || isSubmittingAnonymous
                    ? initialData
                      ? 'Updating...'
                      : 'Submitting...'
                    : initialData
                      ? 'Update Review'
                      : 'Submit Review'}
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-4 py-6'>
              <Button onClick={handleSignInClick} size='lg' className='w-full max-w-50'>
                Sign In
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
