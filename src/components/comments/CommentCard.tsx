'use client';

import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCommentVote } from '@/hooks/useCommentVote';
import { ReviewComment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from '@bprogress/next/app';

import CommentDeleteDialog from './CommentDeleteDialog';
import CommentForm from './CommentForm';
import CommentReportDialog from './CommentReportDialog';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronRight, Edit, Flag, MessageCircle, MoreHorizontal, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CommentCardProps {
  comment: ReviewComment & {
    votes?: { voteType: 'up' | 'down' }[];
  };
  reviewId: string;
  depth?: number;
  maxDepth?: number;
}

export default function CommentCard({ comment, reviewId, depth = 0, maxDepth = 3 }: CommentCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const userVote = (comment.votes?.[0]?.voteType || null) as 'up' | 'down' | null;
  const [currentUserVote, setCurrentUserVote] = useState<'up' | 'down' | null>(userVote);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvotes);
  const [downvoteCount, setDownvoteCount] = useState(comment.downvotes);

  const { voteComment, isLoading: isVoting } = useCommentVote();
  const isOwner = session?.user?.id === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;

  const handleVote = async (voteType: 'up' | 'down') => {
    if (isVoting) return;

    if (!session?.user) {
      router.push('/signin?error=Unauthorized');
      return;
    }

    const previousVote = currentUserVote;
    const previousUpvotes = upvoteCount;
    const previousDownvotes = downvoteCount;

    // Optimistic update
    if (voteType === 'up') {
      if (previousVote === 'down') setDownvoteCount((prev) => prev - 1);
      if (previousVote !== 'up') setUpvoteCount((prev) => prev + 1);
      setCurrentUserVote(previousVote === 'up' ? null : 'up');
    } else {
      if (previousVote === 'up') setUpvoteCount((prev) => prev - 1);
      if (previousVote !== 'down') setDownvoteCount((prev) => prev + 1);
      setCurrentUserVote(previousVote === 'down' ? null : 'down');
    }

    try {
      const result = await voteComment({ commentId: comment.id, voteType });
      setCurrentUserVote(result.userVote);
      setUpvoteCount(result.comment.upvotes);
      setDownvoteCount(result.comment.downvotes);
    } catch (error) {
      setCurrentUserVote(previousVote);
      setUpvoteCount(previousUpvotes);
      setDownvoteCount(previousDownvotes);
      toast.error('Failed to submit vote. Please try again.');
    }
  };

  return (
    <div className={cn('border-muted border-l-2 pl-2', depth > 0 && 'mt-3 ml-1')}>
      <div className='flex items-start gap-3'>
        <Avatar className='h-8 w-8'>
          <AvatarFallback className='bg-secondary text-secondary-foreground text-xs'>
            {comment.user?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-sm font-medium'>@{comment.user?.username || 'Unknown'}</span>
            <span className='text-muted-foreground text-xs'>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt && new Date(comment.updatedAt).getTime() > new Date(comment.createdAt).getTime() && (
              <span className='text-muted-foreground text-xs'>(edited)</span>
            )}
          </div>

          {showEditForm ? (
            <CommentForm
              reviewId={reviewId}
              editMode
              initialContent={comment.content}
              commentId={comment.id}
              onCancel={() => setShowEditForm(false)}
              onSuccess={() => setShowEditForm(false)}
            />
          ) : (
            <p className='mt-1 text-sm whitespace-pre-line wrap-break-word overflow-wrap-anywhere'>{comment.content}</p>
          )}

          {!showEditForm && (
            <div className='mt-2 flex items-center gap-2'>
              <Button
                variant={currentUserVote === 'up' ? 'secondary' : 'ghost'}
                size='sm'
                className='h-7 px-2'
                onClick={() => handleVote('up')}>
                <ThumbsUp className={cn('h-3 w-3', currentUserVote === 'up' && 'text-primary fill-current')} />
                {upvoteCount > 0 && <span className='ml-1 text-xs'>{upvoteCount}</span>}
              </Button>

              <Button
                variant={currentUserVote === 'down' ? 'secondary' : 'ghost'}
                size='sm'
                className='h-7 px-2'
                onClick={() => handleVote('down')}>
                <ThumbsDown className={cn('h-3 w-3', currentUserVote === 'down' && 'fill-current text-red-500')} />
                {downvoteCount > 0 && <span className='ml-1 text-xs'>{downvoteCount}</span>}
              </Button>

              {depth < maxDepth && (
                <Button variant='ghost' size='sm' className='h-7 px-2' onClick={() => setShowReplyForm(!showReplyForm)}>
                  <MessageCircle className='mr-1 h-3 w-3' />
                  <span className='text-xs'>Reply</span>
                </Button>
              )}

              {hasReplies && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2'
                  onClick={() => setShowReplies(!showReplies)}>
                  {showReplies ? (
                    <ChevronDown className='mr-1 h-3 w-3' />
                  ) : (
                    <ChevronRight className='mr-1 h-3 w-3' />
                  )}
                  <span className='text-xs'>
                    {showReplies ? 'Hide' : 'Show'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-7 w-7 p-0'>
                    <MoreHorizontal className='h-3 w-3' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {isOwner && (
                    <>
                      <DropdownMenuItem onClick={() => setShowEditForm(true)}>
                        <Edit className='text-primary mr-2 h-4 w-4' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className='mr-2 h-4 w-4 text-red-500' />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {session?.user && !isOwner && (
                    <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                      <Flag className='mr-2 h-4 w-4 text-red-500' />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {showReplyForm && (
            <div className='mt-3'>
              <CommentForm
                reviewId={reviewId}
                parentId={comment.id}
                onCancel={() => setShowReplyForm(false)}
                onSuccess={() => setShowReplyForm(false)}
                placeholder='Write a reply...'
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies - collapsible */}
      {hasReplies && showReplies && (
        <div className='mt-3'>
          {comment.replies!.map((reply) => (
            <CommentCard key={reply.id} comment={reply} reviewId={reviewId} depth={depth + 1} maxDepth={maxDepth} />
          ))}
        </div>
      )}

      <CommentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        commentId={comment.id}
        reviewId={reviewId}
      />

      <CommentReportDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen} commentId={comment.id} />
    </div>
  );
}
