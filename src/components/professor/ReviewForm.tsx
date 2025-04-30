'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RatingStars from '@/components/ui/rating-stars';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Professor, Review } from '@/lib/types';

interface ReviewFormProps {
  professor: Professor;
  onSubmit: (review: Review) => void;
  onClose: () => void;
}

export default function ReviewForm({ professor, onSubmit, onClose }: ReviewFormProps) {
  const [reviewRatings, setReviewRatings] = useState({
    teaching: 0,
    helpfulness: 0,
    fairness: 0,
    clarity: 0,
    communication: 0
  });
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCourse, setReviewCourse] = useState('');
  const [reviewSemester, setReviewSemester] = useState('');
  const [reviewGrade, setReviewGrade] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | undefined>(undefined);
  const [quizes, setQuizes] = useState<boolean | undefined>(undefined);
  const [assignments, setAssignments] = useState<boolean | undefined>(undefined);
  const [attendance, setAttendance] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const calculateOverallRating = () => {
    const values = Object.values(reviewRatings);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return values.every((val) => val > 0) ? sum / values.length : 0;
  };

  const handleSubmit = () => {
    if (Object.values(reviewRatings).some((rating) => rating === 0)) {
      toast({
        title: 'Missing Ratings',
        description: 'Please provide ratings for all categories.',
        variant: 'destructive'
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: 'Missing Comment',
        description: 'Please provide a written review.',
        variant: 'destructive'
      });
      return;
    }

    if (!reviewCourse) {
      toast({
        title: 'Missing Course',
        description: 'Please select the course you took with this professor.',
        variant: 'destructive'
      });
      return;
    }

    const newReview: Review = {
      id: `review-new-${Date.now()}`,
      userId: 'current-user',
      professorId: professor.id,
      courseCode: reviewCourse,
      courseTitle: professor.courses.find((c) => c.code === reviewCourse)?.name || '',
      semester: reviewSemester,
      anonymous: isAnonymous,
      userName: isAnonymous ? undefined : 'Current User',
      date: new Date(),
      ratings: {
        overall: calculateOverallRating(),
        ...reviewRatings
      },
      comment: reviewComment,
      wouldRecommend,
      quizes,
      assignments,
      attendance,
      grade: reviewGrade || undefined,
      tags: [],
      upvotes: 0,
      downvotes: 0
    };

    onSubmit(newReview);
    onClose();
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <div>
          <Label>Course</Label>
          <Select value={reviewCourse} onValueChange={setReviewCourse}>
            <SelectTrigger>
              <SelectValue placeholder='Select a course' />
            </SelectTrigger>
            <SelectContent>
              {professor.courses.map((course) => (
                <SelectItem key={course.code} value={course.code}>
                  {course.code} - {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Semester</Label>
          <Input
            value={reviewSemester}
            onChange={(e) => setReviewSemester(e.target.value)}
            placeholder='e.g., Fall 2023'
          />
        </div>

        <div>
          <Label>Grade</Label>
          <Input value={reviewGrade} onChange={(e) => setReviewGrade(e.target.value)} placeholder='e.g., A, B+, etc.' />
        </div>
      </div>

      <div className='space-y-4'>
        <div>
          <Label>Teaching Quality</Label>
          <RatingStars
            value={reviewRatings.teaching}
            onChange={(value) => setReviewRatings((prev) => ({ ...prev, teaching: value }))}
          />
        </div>
        <div>
          <Label>Helpfulness</Label>
          <RatingStars
            value={reviewRatings.helpfulness}
            onChange={(value) => setReviewRatings((prev) => ({ ...prev, helpfulness: value }))}
          />
        </div>
        <div>
          <Label>Fairness</Label>
          <RatingStars
            value={reviewRatings.fairness}
            onChange={(value) => setReviewRatings((prev) => ({ ...prev, fairness: value }))}
          />
        </div>
        <div>
          <Label>Clarity</Label>
          <RatingStars
            value={reviewRatings.clarity}
            onChange={(value) => setReviewRatings((prev) => ({ ...prev, clarity: value }))}
          />
        </div>
        <div>
          <Label>Communication</Label>
          <RatingStars
            value={reviewRatings.communication}
            onChange={(value) => setReviewRatings((prev) => ({ ...prev, communication: value }))}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div>
          <Label>Would you recommend this professor?</Label>
          <div className='mt-2 flex gap-4'>
            <Button variant={wouldRecommend === true ? 'default' : 'outline'} onClick={() => setWouldRecommend(true)}>
              Yes
            </Button>
            <Button variant={wouldRecommend === false ? 'default' : 'outline'} onClick={() => setWouldRecommend(false)}>
              No
            </Button>
          </div>
        </div>

        <div>
          <Label>Were there any quizes?</Label>
          <div className='mt-2 flex gap-4'>
            <Button variant={quizes === true ? 'default' : 'outline'} onClick={() => setQuizes(true)}>
              Yes
            </Button>
            <Button variant={quizes === false ? 'default' : 'outline'} onClick={() => setQuizes(false)}>
              No
            </Button>
          </div>
        </div>

        <div>
          <Label>Were there any assignments?</Label>
          <div className='mt-2 flex gap-4'>
            <Button variant={assignments === true ? 'default' : 'outline'} onClick={() => setAssignments(true)}>
              Yes
            </Button>
            <Button variant={assignments === false ? 'default' : 'outline'} onClick={() => setAssignments(false)}>
              No
            </Button>
          </div>
        </div>

        <div>
          <Label>How chill was the attendance?</Label>
          <div className='mt-2 flex gap-4'>
            {/* percentage */}
            <Input value={attendance} onChange={(e) => setAttendance(e.target.value)} placeholder='e.g., 50%' />
          </div>
        </div>
      </div>

      <div>
        <Label>Your Review</Label>
        <Textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder='Share your experience with this professor...'
          className='mt-2'
        />
      </div>

      <div className='flex items-center space-x-2'>
        <Switch id='anonymous' checked={isAnonymous} onCheckedChange={setIsAnonymous} />
        <Label htmlFor='anonymous'>Post anonymously</Label>
      </div>

      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Submit Review</Button>
      </div>
    </div>
  );
}
