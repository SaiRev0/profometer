'use client';

import { useState } from 'react';

import { ReportDialog } from '@/components/dialogs/report-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Review } from '@/lib/types';
import { cn } from '@/lib/utils';

import { formatDistanceToNow } from 'date-fns';
import { Flag, MessageSquare, MoreHorizontal, ThumbsDown, ThumbsUp } from 'lucide-react';

export interface ReviewCardType extends Review {
  userVote?: 'up' | 'down' | null;
  userName?: string;
  date?: string;
  courseCode?: string;
}

interface ReviewCardProps {
  review: ReviewCardType;
  isLoading?: boolean;
}

export default function ReviewCard({ review, isLoading = false }: ReviewCardProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(review.userVote || null);
  const [upvoteCount, setUpvoteCount] = useState(review.upvotes);
  const [downvoteCount, setDownvoteCount] = useState(review.downvotes);

  if (isLoading) {
    return <ReviewCardSkeleton />;
  }

  const handleVote = (vote: 'up' | 'down') => {
    // Toggle the vote if already selected
    if (userVote === vote) {
      setUserVote(null);
      if (vote === 'up') {
        setUpvoteCount((prevCount) => prevCount - 1);
      } else {
        setDownvoteCount((prevCount) => prevCount - 1);
      }
    } else {
      // If changing vote, update both counts
      if (userVote === 'up' && vote === 'down') {
        setUpvoteCount((prevCount) => prevCount - 1);
        setDownvoteCount((prevCount) => prevCount + 1);
      } else if (userVote === 'down' && vote === 'up') {
        setDownvoteCount((prevCount) => prevCount - 1);
        setUpvoteCount((prevCount) => prevCount + 1);
      } else {
        // New vote
        if (vote === 'up') {
          setUpvoteCount((prevCount) => prevCount + 1);
        } else {
          setDownvoteCount((prevCount) => prevCount + 1);
        }
      }
      setUserVote(vote);
    }
  };

  return (
    <Card className='mb-4'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {review.anonymous ? (
              <Avatar>
                <AvatarFallback className='bg-secondary text-secondary-foreground'>A</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  {review.userName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            )}

            <div>
              <p className='font-medium'>{review.anonymous ? 'Anonymous Student' : review.userName}</p>
              <div className='text-muted-foreground flex items-center text-sm'>
                <span>{formatDistanceToNow(review.createdAt, { addSuffix: true })}</span>
                {review.courseCode && (
                  <>
                    <span className='mx-1.5'>•</span>
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

          <div className='flex items-center'>
            <Badge
              className='mr-2'
              variant={
                review.ratings.overall >= 4 ? 'default' : review.ratings.overall <= 2 ? 'destructive' : 'secondary'
              }>
              {review.ratings.overall.toFixed(1)}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <MoreHorizontal className='h-4 w-4' />
                  <span className='sr-only'>More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                  <Flag className='mr-2 h-4 w-4' />
                  Report review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3'>
          <div>
            <p className='text-muted-foreground mb-1 text-xs'>Teaching</p>
            <RatingStars value={review.ratings.teaching} size='sm' />
          </div>
          <div>
            <p className='text-muted-foreground mb-1 text-xs'>Helpfulness</p>
            <RatingStars value={review.ratings.helpfulness} size='sm' />
          </div>
          <div>
            <p className='text-muted-foreground mb-1 text-xs'>Fairness</p>
            <RatingStars value={review.ratings.fairness} size='sm' />
          </div>
          <div>
            <p className='text-muted-foreground mb-1 text-xs'>Clarity</p>
            <RatingStars value={review.ratings.clarity} size='sm' />
          </div>
          <div>
            <p className='text-muted-foreground mb-1 text-xs'>Communication</p>
            <RatingStars value={review.ratings.communication} size='sm' />
          </div>
          {review.grade && (
            <div>
              <p className='text-muted-foreground mb-1 text-xs'>Final Grade</p>
              <p className='text-sm font-medium'>{review.grade}</p>
            </div>
          )}
        </div>

        <div className='mt-4'>
          <p className='text-sm whitespace-pre-line'>{review.comment}</p>
        </div>

        <div className='mt-4 flex flex-wrap gap-3'>
          {review.wouldRecommend !== undefined && (
            <Badge variant={review.wouldRecommend ? 'default' : 'destructive'} className='text-xs'>
              {review.wouldRecommend ? 'Would recommend' : 'Would not recommend'}
            </Badge>
          )}
          {review.quizes !== undefined && (
            <Badge variant='secondary' className='text-xs'>
              Quizes {review.quizes ? 'Yes' : 'No'}
            </Badge>
          )}
          {review.assignments !== undefined && (
            <Badge variant='secondary' className='text-xs'>
              Assignments {review.assignments ? 'Yes' : 'No'}
            </Badge>
          )}
          {review.attendance !== undefined && (
            <Badge variant='secondary' className='text-xs'>
              Attendance {review.attendance}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className='flex justify-between px-4 pt-0 pb-3'>
        <div className='flex items-center gap-2'>
          <Button
            variant={userVote === 'up' ? 'secondary' : 'ghost'}
            size='sm'
            className='h-8'
            onClick={() => handleVote('up')}>
            <ThumbsUp className={cn('mr-1.5 h-4 w-4', userVote === 'up' && 'fill-current')} />
            Helpful
            {upvoteCount > 0 && <span className='ml-1.5 text-xs'>({upvoteCount})</span>}
          </Button>

          <Button
            variant={userVote === 'down' ? 'secondary' : 'ghost'}
            size='sm'
            className='h-8'
            onClick={() => handleVote('down')}>
            <ThumbsDown className={cn('mr-1.5 h-4 w-4', userVote === 'down' && 'fill-current')} />
            Unhelpful
            {downvoteCount > 0 && <span className='ml-1.5 text-xs'>({downvoteCount})</span>}
          </Button>
        </div>

        <Button variant='ghost' size='sm' className='h-8' onClick={() => setReportDialogOpen(true)}>
          <Flag className='mr-1.5 h-4 w-4' />
          Report
        </Button>
      </CardFooter>

      <ReportDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen} reviewId={review.id} />
    </Card>
  );
}

function ReviewCardSkeleton() {
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
