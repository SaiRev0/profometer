'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RatingStars from '@/components/ui/rating-stars';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview } from '@/hooks/use-create-review';
import { Professor, Review } from '@/lib/types';
import { Separator } from '@radix-ui/react-separator';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  professor: Professor;
  modalState: boolean;
  setModalState: (state: boolean) => void;
  setAddCourseDialogOpen: (state: boolean) => void;
}

export default function ReviewForm({ professor, modalState, setModalState, setAddCourseDialogOpen }: ReviewFormProps) {
  const createReview = useCreateReview();
  const [reviewCourse, setReviewCourse] = useState('');
  const [semesterType, setSemesterType] = useState<'Odd' | 'Even'>('Odd');
  const [semesterYear, setSemesterYear] = useState('');
  const [reviewSemester, setReviewSemester] = useState('');
  const [reviewRatings, setReviewRatings] = useState({
    teaching: 0,
    helpfulness: 0,
    fairness: 0,
    clarity: 0,
    communication: 0
  });
  const [reviewComment, setReviewComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | undefined>(undefined);
  const [quizzes, setQuizzes] = useState<boolean | undefined>(undefined);
  const [assignments, setAssignments] = useState<boolean | undefined>(undefined);
  const [attendanceScore, setAttendanceScore] = useState<number>(50);
  const [reviewGrade, setReviewGrade] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Remove useEffect and update the handlers
  const handleSemesterTypeChange = (value: 'Odd' | 'Even') => {
    setSemesterType(value);
    setReviewSemester(`${value}-${semesterYear}`);
  };

  const handleSemesterYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    setSemesterYear(year);
    setReviewSemester(`${semesterType}-${year}`);
  };

  // Submit review function
  const handleSubmitReview = async () => {
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

    try {
      await createReview.mutateAsync({
        professorId: professor.id,
        courseId: reviewCourse,
        semester: reviewSemester,
        anonymous: isAnonymous,
        ratings: reviewRatings,
        comment: reviewComment,
        wouldRecommend: wouldRecommend!,
        attendance: attendanceScore,
        quizes: quizzes!,
        assignments: assignments!,
        grade: reviewGrade || undefined
      });

      toast.success('Review Submitted!');

      // Reset form
      setReviewRatings({
        teaching: 0,
        helpfulness: 0,
        fairness: 0,
        clarity: 0,
        communication: 0
      });
      setReviewComment('');
      setReviewCourse('');
      setReviewSemester('');
      setReviewGrade('');
      setIsAnonymous(true);
      setWouldRecommend(undefined);
      setQuizzes(undefined);
      setAssignments(undefined);
      setAttendanceScore(50);
      setModalState(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  return (
    <Dialog open={modalState} onOpenChange={setModalState}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Rate Professor {professor.name}</DialogTitle>
          <DialogDescription>
            Share your experience with this professor to help other students. All reviews are moderated for appropriate
            content.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            <div>
              <Label htmlFor='course'>Course Taken</Label>
              <Select value={reviewCourse} onValueChange={setReviewCourse}>
                <SelectTrigger id='course'>
                  <SelectValue placeholder='Select a course' />
                </SelectTrigger>
                <SelectContent>
                  <div className='p-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex w-full items-center justify-center gap-2'
                      onClick={() => setAddCourseDialogOpen(true)}>
                      <Plus className='h-4 w-4' />
                      Add New Course
                    </Button>
                  </div>
                  <Separator className='my-2' />
                  {professor.courses.map((course) => (
                    <SelectItem key={course.code} value={course.code}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
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
            <h3 className='font-medium'>Ratings</h3>

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
                  variant={wouldRecommend === true ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setWouldRecommend(true)}>
                  Yes
                </Button>
                <Button
                  type='button'
                  variant={wouldRecommend === false ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setWouldRecommend(false)}>
                  No
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Quizzes?</Label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={quizzes === true ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setQuizzes(true)}>
                  Yes
                </Button>
                <Button
                  type='button'
                  variant={quizzes === false ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setQuizzes(false)}>
                  No
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Assignments?</Label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={assignments === true ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setAssignments(true)}>
                  Yes
                </Button>
                <Button
                  type='button'
                  variant={assignments === false ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setAssignments(false)}>
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
                value={[attendanceScore]}
                onValueChange={(value) => setAttendanceScore(value[0])}
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
            <Button variant='outline' onClick={() => setModalState(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
