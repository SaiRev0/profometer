'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RatingStars from '@/components/ui/rating-stars';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  const [reviewCourse, setReviewCourse] = useState('');
  const [reviewSemester, setReviewSemester] = useState('');
  const [reviewRatings, setReviewRatings] = useState({
    teaching: 0,
    helpfulness: 0,
    fairness: 0,
    clarity: 0,
    communication: 0
  });
  const [reviewComment, setReviewComment] = useState('');
  const [wouldTakeAgain, setWouldTakeAgain] = useState<boolean | undefined>(undefined);
  const [textbookRequired, setTextbookRequired] = useState<boolean | undefined>(undefined);
  const [attendanceMandatory, setAttendanceMandatory] = useState<'mandatory' | 'optional' | undefined>(undefined);
  const [reviewGrade, setReviewGrade] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Submit review function
  const handleSubmitReview = () => {
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
    setWouldTakeAgain(undefined);
    setTextbookRequired(undefined);
    setAttendanceMandatory(undefined);
    setModalState(false);
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
              <Select value={reviewSemester} onValueChange={setReviewSemester}>
                <SelectTrigger id='semester'>
                  <SelectValue placeholder='Select a semester' />
                </SelectTrigger>
                <SelectContent>
                  {['Fall 2023', 'Summer 2023', 'Spring 2023', 'Fall 2022', 'Summer 2022', 'Spring 2022'].map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Would Take Again?</Label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={wouldTakeAgain === true ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setWouldTakeAgain(true)}>
                  Yes
                </Button>
                <Button
                  type='button'
                  variant={wouldTakeAgain === false ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setWouldTakeAgain(false)}>
                  No
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Textbook Required?</Label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={textbookRequired === true ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTextbookRequired(true)}>
                  Yes
                </Button>
                <Button
                  type='button'
                  variant={textbookRequired === false ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setTextbookRequired(false)}>
                  No
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Attendance</Label>
              <div className='flex gap-2'>
                <Button
                  type='button'
                  variant={attendanceMandatory === 'mandatory' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setAttendanceMandatory('mandatory')}>
                  Mandatory
                </Button>
                <Button
                  type='button'
                  variant={attendanceMandatory === 'optional' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setAttendanceMandatory('optional')}>
                  Optional
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor='grade'>Your Grade (Optional)</Label>
            <Select value={reviewGrade} onValueChange={setReviewGrade}>
              <SelectTrigger id='grade'>
                <SelectValue placeholder='Select your grade' />
              </SelectTrigger>
              <SelectContent>
                {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'Audit', 'Withdraw', 'Incomplete'].map(
                  (grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  )
                )}
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
