'use client';

import { useState } from 'react';

import CourseReviewForm from '@/components/course/CourseReviewForm';
import { DeleteDialog } from '@/components/dialogs/DeleteDialog';
import { ReportDialog } from '@/components/dialogs/ReportDialog';
import ReviewForm from '@/components/professor/ReviewForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import RatingStars from '@/components/ui/rating-stars';
import { useReviewVote } from '@/hooks/useReviewVote';
import { Course, CourseReview, Professor, ProfessorReview } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from '@bprogress/next/app';

import { formatDistanceToNow } from 'date-fns';
import { Edit, Flag, MoreHorizontal, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: (ProfessorReview | CourseReview) & {
    votes?: { voteType: 'up' | 'down' }[];
  };
  professor?: Professor;
  course?: Course;
  variant?: 'default' | 'own';
  usedIn?: 'professor' | 'course';
}

export default function ReviewCard({
  review,
  professor,
  course,
  variant = 'default',
  usedIn = 'professor'
}: ReviewCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const userVote = (review.votes?.[0]?.voteType || null) as 'up' | 'down' | null;
  const [currentUserVote, setCurrentUserVote] = useState<'up' | 'down' | null>(userVote);
  const [upvoteCount, setUpvoteCount] = useState(review.upvotes);
  const [downvoteCount, setDownvoteCount] = useState(review.downvotes);

  const { voteReview, isLoading: isVoting, error } = useReviewVote();

  if (error) {
    setCurrentUserVote(userVote);
    setUpvoteCount(review.upvotes);
    setDownvoteCount(review.downvotes);
  }

  const handleVote = async (reviewId: string, voteType: 'up' | 'down') => {
    if (isVoting) return;

    if (!session?.user) {
      router.push('/signin?error=Unauthorized');
      return;
    }

    // Store previous state for potential rollback
    const previousVote = currentUserVote;
    const previousUpvotes = upvoteCount;
    const previousDownvotes = downvoteCount;

    // Optimistically update UI
    setCurrentUserVote(voteType);

    // Update vote counts optimistically
    if (voteType === 'up') {
      if (previousVote === 'down') {
        setDownvoteCount((prev) => prev - 1);
      }
      if (previousVote !== 'up') {
        setUpvoteCount((prev) => prev + 1);
      }
    } else {
      if (previousVote === 'up') {
        setUpvoteCount((prev) => prev - 1);
      }
      if (previousVote !== 'down') {
        setDownvoteCount((prev) => prev + 1);
      }
    }

    try {
      const result = await voteReview({
        reviewId,
        voteType
      });

      // Update with actual server response
      setCurrentUserVote(result.userVote);
      setUpvoteCount(result.review.upvotes);
      setDownvoteCount(result.review.downvotes);
    } catch (error) {
      // Revert optimistic updates on error
      setCurrentUserVote(previousVote);
      setUpvoteCount(previousUpvotes);
      setDownvoteCount(previousDownvotes);
      toast.error('Failed to submit vote. Please try again.');
    }
  };

  return (
    <Card className='mb-4'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar>
              <AvatarImage src={review.user?.image} alt={review.user?.name ?? 'Anonymous'} />
              <AvatarFallback className='bg-secondary text-secondary-foreground'>A</AvatarFallback>
            </Avatar>

            {/* User Details */}
            <div>
              <p className='font-medium'>{review.user?.name ?? 'Anonymous'}</p>
              <div className='text-muted-foreground flex flex-col text-sm'>
                <div className='flex items-center gap-1'>
                  <span>{formatDistanceToNow(review.createdAt, { addSuffix: true })}</span>
                  {!review.anonymous &&
                    review.updatedAt &&
                    new Date(review.updatedAt).getTime() > new Date(review.createdAt).getTime() && (
                      <span className='text-muted-foreground text-xs'>(edited)</span>
                    )}
                </div>
                <div className='flex flex-row items-center'>
                  {usedIn !== 'professor' && review.professor && (
                    <>
                      {/* <span className='mx-1.5'>•</span> */}
                      <span>{review.professor.name}</span>
                    </>
                  )}
                  {usedIn !== 'course' && review.courseCode && (
                    <>
                      {/* <span className='mx-1.5'>•</span> */}
                      <span>{review.courseCode}</span>
                    </>
                  )}
                  {review.semester && (
                    <>
                      <span className='mx-1.5'>•</span>
                      <span>{review.semester}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Dot Options */}
          <div className='flex items-center'>
            <Badge
              className='mr-2'
              variant={
                review.ratings.overall >= 4 ? 'default' : review.ratings.overall <= 2 ? 'destructive' : 'secondary'
              }>
              {review.ratings.overall}
            </Badge>

            {variant === 'own' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <MoreHorizontal className='h-4 w-4' />
                    <span className='sr-only'>More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className='text-primary mr-2 h-4 w-4' />
                    Edit review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className='mr-2 h-4 w-4 text-red-500' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Ratings and Grades */}
        <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3'>
          {Object.entries(review.ratings).map(([key, value]) => (
            <div key={key}>
              <p className='text-muted-foreground mb-1 text-sm'>{key}</p>
              <RatingStars value={value} size='sm' />
            </div>
          ))}
          {review.grade && (
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>Final Grade</p>
              <p className='text-sm font-medium'>{review.grade}</p>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className='mt-4'>
          <p className='text-sm whitespace-pre-line'>{review.comment}</p>
        </div>

        {/* Stats */}
        <div className='mt-4 flex flex-wrap gap-3'>
          {review.statistics.wouldRecommend !== undefined && (
            <Badge variant={review.statistics.wouldRecommend ? 'default' : 'destructive'} className='text-xs'>
              {review.statistics.wouldRecommend ? 'Would recommend' : 'Would not recommend'}
            </Badge>
          )}
          {review.statistics.quizes !== undefined && (
            <Badge variant='secondary' className='text-xs'>
              Quizes {review.statistics.quizes ? 'Yes' : 'No'}
            </Badge>
          )}
          {review.statistics.assignments !== undefined && (
            <Badge variant='secondary' className='text-xs'>
              Assignments {review.statistics.assignments ? 'Yes' : 'No'}
            </Badge>
          )}
          {review.statistics.attendanceRating !== undefined && (
            <Badge variant='secondary' className='text-xs'>
              Attendance {review.statistics.attendanceRating}
            </Badge>
          )}
        </div>
      </CardContent>

      {variant === 'default' && (
        <CardFooter className='flex justify-between px-4 pt-0 pb-3'>
          <div className='flex items-center gap-2'>
            <Button
              variant={currentUserVote === 'up' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8'
              onClick={() => handleVote(review.id, 'up')}>
              <ThumbsUp className={cn('mr-1.5 h-4 w-4', currentUserVote === 'up' && 'text-primary fill-current')} />
              <p className='hidden text-sm sm:block'>Helpful</p>
              {upvoteCount > 0 && <span className='ml-1.5 text-xs'>({upvoteCount})</span>}
            </Button>

            <Button
              variant={currentUserVote === 'down' ? 'secondary' : 'ghost'}
              size='sm'
              className='h-8'
              onClick={() => handleVote(review.id, 'down')}>
              <ThumbsDown className={cn('mr-1.5 h-4 w-4', currentUserVote === 'down' && 'fill-current text-red-500')} />
              <p className='hidden text-sm sm:block'>Not helpful</p>
              {downvoteCount > 0 && <span className='ml-1.5 text-xs'>({downvoteCount})</span>}
            </Button>
          </div>

          {session?.user && (
            <Button variant='ghost' size='sm' className='h-8' onClick={() => setReportDialogOpen(true)}>
              <Flag className='mr-1.5 h-4 w-4 fill-current text-red-500' />
              <p className='hidden text-sm sm:block'>Report</p>
            </Button>
          )}
        </CardFooter>
      )}

      <ReportDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen} reviewId={review.id} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} reviewId={review.id} />
      {review.type === 'professor' && professor && editDialogOpen && (
        <ReviewForm
          professor={professor}
          modalState={editDialogOpen}
          setModalState={setEditDialogOpen}
          setAddCourseDialogOpen={setEditDialogOpen}
          initialData={review as ProfessorReview}
        />
      )}
      {review.type === 'course' && course && (
        <CourseReviewForm
          course={course as Course & { professors: Professor[]; departmentProfessors: Professor[] }}
          modalState={editDialogOpen}
          setModalState={setEditDialogOpen}
          initialData={review as CourseReview}
        />
      )}
    </Card>
  );
}

export function ReviewCardSkeleton() {
  return (
    <Card className='mb-4'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-muted h-10 w-10 rounded-full' />
            <div>
              <div className='bg-muted mb-2 h-5 w-32 rounded' />
              <div className='bg-muted h-4 w-40 rounded' />
            </div>
          </div>
          <div className='bg-muted h-6 w-12 rounded' />
        </div>

        <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3'>
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className='bg-muted mb-1.5 h-3 w-16 rounded' />
              <div className='flex gap-0.5'>
                {[...Array(5)].map((_, j) => (
                  <div key={j} className='bg-muted h-3 w-3 rounded-full' />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 space-y-2'>
          <div className='bg-muted h-4 w-full rounded' />
          <div className='bg-muted h-4 w-full rounded' />
          <div className='bg-muted h-4 w-3/4 rounded' />
        </div>

        <div className='mt-4 flex gap-2'>
          {[...Array(2)].map((_, i) => (
            <div key={i} className='bg-muted h-5 w-24 rounded' />
          ))}
        </div>
      </CardContent>

      <CardFooter className='flex justify-between px-4 pt-0 pb-3'>
        <div className='flex gap-2'>
          <div className='bg-muted h-8 w-20 rounded' />
          <div className='bg-muted h-8 w-20 rounded' />
        </div>
        <div className='bg-muted h-8 w-16 rounded' />
      </CardFooter>
    </Card>
  );
}
