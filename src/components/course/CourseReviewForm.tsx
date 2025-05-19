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
import { useCreateReview } from '@/hooks/useCreateReview';
import { Course, Professor } from '@/lib/types';

import { Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CourseReviewFormProps {
  course: Course & {
    professors: Professor[];
    departmentProfessors: Professor[];
  };
  modalState: boolean;
  setModalState: (state: boolean) => void;
}

export default function CourseReviewForm({ course, modalState, setModalState }: CourseReviewFormProps) {
  const { status } = useSession();
  const router = useRouter();
  const { createReview, isLoading } = useCreateReview();
  const [reviewProfessor, setReviewProfessor] = useState('');
  const [semesterType, setSemesterType] = useState<'Odd' | 'Even'>('Odd');
  const [semesterYear, setSemesterYear] = useState('');
  const [reviewSemester, setReviewSemester] = useState('');
  const [reviewRatings, setReviewRatings] = useState({
    difficulty: 0,
    workload: 0,
    content: 0,
    numerical: 0
  });
  const [reviewStatistics, setReviewStatistics] = useState<{
    wouldRecommend: number;
    quizes: number;
    assignments: number;
    attendanceRating: number;
  }>({
    wouldRecommend: -1,
    quizes: -1,
    assignments: -1,
    attendanceRating: 50
  });
  const [reviewComment, setReviewComment] = useState('');
  const [reviewGrade, setReviewGrade] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [professorSearch, setProfessorSearch] = useState('');

  // Add helper function to get current year
  const getCurrentYear = () => new Date().getFullYear();

  const handleSemesterTypeChange = (value: 'Odd' | 'Even') => {
    setSemesterType(value);
    setReviewSemester(`${value}-${semesterYear}`);
  };

  const handleSemesterYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    setSemesterYear(year);
    setReviewSemester(`${semesterType}-${year}`);
  };

  const filteredProfessors = course.departmentProfessors?.filter((professor) =>
    professor.name.toLowerCase().includes(professorSearch.toLowerCase())
  );

  // Submit review function
  const handleSubmitReview = async () => {
    // Validate year
    const year = parseInt(semesterYear);
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

    // Check if professor is selected
    if (!reviewProfessor) {
      toast.error('Please select the professor who taught this course.');
      return;
    }

    // Validate statistics
    if (Object.values(reviewStatistics).some((stat) => stat === undefined)) {
      toast.error('Please provide statistics for all categories.');
      return;
    }

    const overallRating = Number(
      (
        Object.values(reviewRatings).reduce((sum, rating) => sum + rating, 0) / Object.keys(reviewRatings).length
      ).toFixed(1)
    );

    try {
      await createReview({
        courseId: course.code,
        professorId: reviewProfessor,
        semester: reviewSemester,
        anonymous: isAnonymous,
        ratings: {
          ...reviewRatings,
          // Map course-specific ratings to the expected format
          overall: overallRating
        },
        comment: reviewComment,
        statistics: {
          wouldRecommend: reviewStatistics.wouldRecommend,
          quizes: reviewStatistics.quizes,
          assignments: reviewStatistics.assignments,
          attendanceRating: reviewStatistics.attendanceRating
        },
        grade: reviewGrade || undefined,
        type: 'course'
      });

      toast.success('Review Submitted!');

      // Reset form
      setReviewRatings({
        difficulty: 0,
        workload: 0,
        content: 0,
        numerical: 0
      });
      setReviewStatistics({
        wouldRecommend: -1,
        quizes: -1,
        assignments: -1,
        attendanceRating: 50
      });
      setReviewComment('');
      setReviewProfessor('');
      setReviewSemester('');
      setReviewGrade('');
      setIsAnonymous(true);
      setModalState(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const handleSignInClick = () => {
    setModalState(false);
    router.push('/signin');
  };

  return (
    <Dialog open={modalState} onOpenChange={setModalState}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          {status === 'authenticated' ? (
            <>
              <DialogTitle>Rate Course {course.code}</DialogTitle>
              <DialogDescription>
                Share your experience with this course to help other students. All reviews are moderated for appropriate
                content.
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
                  {/* <SelectContent>
                    {departmentProfessors?.map((professor) => (
                      <SelectItem key={professor.id} value={professor.id}>
                        {professor.name}
                      </SelectItem>
                    ))}
                  </SelectContent> */}
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
                    <div className='max-h-[300px] overflow-y-auto pt-1 pb-1'>
                      {filteredProfessors?.length === 0 ? (
                        <div className='text-muted-foreground p-2 text-center text-sm'>No professors found</div>
                      ) : (
                        filteredProfessors?.map((professor) => (
                          <SelectItem key={professor.id} value={professor.id} className='py-2'>
                            {professor.name}
                          </SelectItem>
                        ))
                      )}
                    </div>
                  </SelectContent>
                </Select>
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
                  />
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='font-medium'>Course Ratings</h3>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {Object.entries(reviewRatings).map(([key, value]) => (
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

            <div className='flex items-center space-x-2'>
              <Switch id='anonymous' checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor='anonymous'>Submit review anonymously</Label>
            </div>

            <div className='mt-2 flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setModalState(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={isLoading}>
                Submit Review
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
