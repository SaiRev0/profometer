'use client';

import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RatingStars from '@/components/ui/rating-stars';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAnonymousTokenStatus } from '@/hooks/useAnonymousTokenStatus';
import { useCreateReview } from '@/hooks/useCreateReview';
import { useEditReview } from '@/hooks/useEditReview';
import { useGetDepartmentCourses } from '@/hooks/useGetDepartmentCourses';
import { useSubmitAnonymousReview } from '@/hooks/useSubmitAnonymousReview';
import {
  getCurrentYear,
  getDefaultProfessorRatings,
  getDefaultSemester,
  getDefaultStatistics,
  resetProfessorReviewForm
} from '@/lib/review-form-utils';
import { Professor, ProfessorPercentages, ProfessorReview } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from '@bprogress/next/app';
import { useIntersection } from '@mantine/hooks';

import { Plus, Search, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface ReviewFormProps {
  professor: Professor;
  modalState: boolean;
  setModalState: (state: boolean) => void;
  setAddCourseDialogOpen: (state: boolean) => void;
  initialData?: ProfessorReview;
}

export default function ReviewForm({
  professor,
  modalState,
  setModalState,
  setAddCourseDialogOpen,
  initialData
}: ReviewFormProps) {
  const { status } = useSession();
  const router = useRouter();
  const { createReview, isLoading: isCreating } = useCreateReview();
  const { editReview, isLoading: isEditing } = useEditReview();
  const isLoading = isCreating || isEditing;
  const formRef = useRef<HTMLDivElement>(null);
  const { departmentCourses, isLoadingDepartmentCourses } = useGetDepartmentCourses(professor.departmentCode);
  const { submitAnonymousReview, isSubmitting: isSubmittingAnonymous } = useSubmitAnonymousReview();
  const { ref: intersectionRef } = useIntersection({
    root: null,
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Use React Query hook for anonymous token status
  const {
    hasToken: hasAnonymousToken,
    hasUsedToken,
    cycleId,
    refetch: refetchTokenStatus
  } = useAnonymousTokenStatus(professor.id, status === 'authenticated' && modalState);

  if (status !== 'authenticated') {
    return <div className='text-muted-foreground mt-8 text-center'>Please sign in to leave a review.</div>;
  }

  const [reviewCourse, setReviewCourse] = useState(initialData?.courseCode || '');
  const [semesterType, setSemesterType] = useState<'Odd' | 'Even'>(
    initialData?.semester ? (initialData.semester.split('-')[0] as 'Odd' | 'Even') : 'Odd'
  );
  const [semesterYear, setSemesterYear] = useState<number>(
    initialData?.semester ? parseInt(initialData.semester.split('-')[1]) : getCurrentYear()
  );
  const [reviewSemester, setReviewSemester] = useState<string>(initialData?.semester || getDefaultSemester());
  const [reviewRatings, setReviewRatings] = useState(initialData?.ratings || getDefaultProfessorRatings());
  const [reviewComment, setReviewComment] = useState(initialData?.comment || '');
  const [reviewStatistics, setReviewStatistics] = useState<ProfessorPercentages>(
    initialData?.statistics || getDefaultStatistics()
  );
  const [reviewGrade, setReviewGrade] = useState(initialData?.grade || '');
  const [isAnonymous, setIsAnonymous] = useState(initialData?.anonymous ?? true);
  const [courseSearch, setCourseSearch] = useState('');

  // Helper function to reset form to initial state
  const resetForm = () => {
    resetProfessorReviewForm({
      setReviewRatings,
      setReviewStatistics,
      setReviewComment,
      setReviewCourse,
      setReviewSemester,
      setReviewGrade,
      setIsAnonymous,
      setModalState
    });
  };

  // Remove useEffect and update the handlers
  const handleSemesterTypeChange = (value: 'Odd' | 'Even') => {
    setSemesterType(value);
    setReviewSemester(`${value}-${semesterYear}`);
  };

  const handleSemesterYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSemesterYear(parseInt(e.target.value));
    setReviewSemester(`${semesterType}-${semesterYear}`);
  };

  // Add this function to filter courses
  const filteredCourses = departmentCourses?.filter((course) => {
    const searchTerm = courseSearch.toLowerCase();
    return course.code.toLowerCase().includes(searchTerm) || course.name.toLowerCase().includes(searchTerm);
  });

  // Submit review function
  const handleSubmitReview = async (useAnonymousToken: boolean = false) => {
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

    // Check if course is selected
    if (!reviewCourse) {
      toast.error('Please select the course you took with this professor.');
      return;
    }

    // Validate statistics
    if (Object.values(reviewStatistics).some((stat) => stat === -1)) {
      toast.error('Please provide statistics for all categories.');
      return;
    }

    // Check anonymous token status when user wants to submit anonymously
    if (isAnonymous && !initialData) {
      // Token already used this cycle
      if (hasUsedToken) {
        toast.error(
          "You've already submitted an anonymous review for this professor this cycle. You can submit another anonymous review in the next cycle (approximately 2 months)."
        );
        return;
      }
      // No token available and not used - tokens haven't been claimed yet
      if (!hasAnonymousToken && !hasUsedToken) {
        toast.info('Please wait while your anonymous tokens are being prepared...');
        return;
      }
    }

    // Calculate overall rating as average of all ratings
    const overallRating = Number(
      (
        (reviewRatings.teaching +
          reviewRatings.helpfulness +
          reviewRatings.fairness +
          reviewRatings.clarity +
          reviewRatings.communication) /
        5
      ).toFixed(1)
    );

    const reviewData = {
      professorId: professor.id,
      courseCode: reviewCourse,
      semester: reviewSemester,
      ratings: {
        ...reviewRatings,
        overall: overallRating
      },
      comment: reviewComment,
      statistics: reviewStatistics,
      grade: reviewGrade || undefined,
      type: 'professor' as const
    };

    try {
      if (initialData?.id) {
        await editReview({
          reviewId: initialData.id,
          ...reviewData
        });
        toast.success('Review Updated!');
        setModalState(false);
      } else if (useAnonymousToken && isAnonymous && hasAnonymousToken && cycleId) {
        // Use token-based anonymous submission for enhanced privacy
        const result = await submitAnonymousReview(
          professor.id,
          {
            text: reviewComment.trim(),
            rating: overallRating,
            courseCode: reviewCourse,
            semester: reviewSemester,
            timestamp: Date.now(),
            ratings: {
              ...reviewRatings,
              overall: overallRating
            },
            statistics: reviewStatistics,
            grade: reviewGrade || undefined,
            type: 'professor'
          },
          cycleId
        );

        if (result.success) {
          toast.success('Anonymous review submitted! It will be published after the next shuffle cycle.');
          // Refetch token status to update hasAnonymousToken (token is now marked as used)
          refetchTokenStatus();
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
                <DialogTitle>{initialData ? 'Edit Review' : `Rate Professor ${professor.name}`}</DialogTitle>
                <DialogDescription>
                  {initialData
                    ? 'Update your review to help other students make informed decisions'
                    : 'Share your experience with this professor to help other students. All reviews are moderated for appropriate content'}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Sign in to Write a Review</DialogTitle>
                <DialogDescription>
                  You need to sign in with your IIT BHU Google account to write a review for this professor.
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          {status === 'authenticated' ? (
            <div className='grid gap-6 py-4'>
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <Label htmlFor='course'>Course Taken</Label>
                  <Select value={reviewCourse} onValueChange={setReviewCourse}>
                    <SelectTrigger id='course'>
                      <SelectValue placeholder='Select a course' className='flex-1 truncate' />
                    </SelectTrigger>
                    <SelectContent showScrollButtons={false}>
                      <div className='bg-background sticky top-0 z-10 border-b p-2'>
                        <div className='relative'>
                          <Search className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                          <Input
                            placeholder='Search courses...'
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            className='pl-8'
                          />
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          className='mt-2 flex w-full items-center justify-center gap-2'
                          onClick={() => setAddCourseDialogOpen(true)}>
                          <Plus className='h-4 w-4' />
                          Add New Course
                        </Button>
                      </div>
                      {isLoadingDepartmentCourses ? (
                        <div className='text-muted-foreground p-2 text-center text-sm'>Loading...</div>
                      ) : filteredCourses?.length === 0 ? (
                        <div className='text-muted-foreground p-2 text-center text-sm'>No courses found</div>
                      ) : (
                        filteredCourses?.map((course) => (
                          <SelectItem key={course.code} value={course.code} className='py-2'>
                            {course.code} - {course.name}
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
                  placeholder='Share your experience with this professor...'
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
