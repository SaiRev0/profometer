'use client';

import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useDeleteComment } from '@/hooks/useDeleteComment';
import { useDeleteReview } from '@/hooks/useDeleteReview';
import { cn } from '@/lib/utils';

import { ReasonBadge } from './ReasonBadge';
import type { CommentReportData, ReviewReportData } from './ReportsTable';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  FileText,
  Flag,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User
} from 'lucide-react';

interface ReportDetailDialogProps {
  type: 'review' | 'comment';
  report: ReviewReportData | CommentReportData;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
}

export function ReportDetailDialog({ type, report, open, onOpenChange, onDelete }: ReportDetailDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { deleteReview, isLoading: isReviewDeleting } = useDeleteReview();
  const { deleteComment, isLoading: isCommentDeleting } = useDeleteComment();

  const isDeleting = isReviewDeleting || isCommentDeleting;

  const handleDelete = async () => {
    try {
      if (type === 'review') {
        const reviewReport = report as ReviewReportData;
        await deleteReview({ reviewId: reviewReport.review.id });
      } else {
        const commentReport = report as CommentReportData;
        await deleteComment({
          commentId: commentReport.comment.id,
          reviewId: commentReport.comment.review.id
        });
      }

      setDeleteDialogOpen(false);
      onOpenChange(false);

      // Refresh the admin data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      // Error is already handled by the hooks
      console.error('Delete error:', error);
    }
  };

  const getContentUrl = () => {
    if (type === 'review') {
      const reviewReport = report as ReviewReportData;
      const baseUrl =
        reviewReport.review.type === 'professor'
          ? `/professor/${reviewReport.review.professor?.id}`
          : `/course/${reviewReport.review.course?.code}`;
      return `${baseUrl}#review-${reviewReport.review.id}`;
    } else {
      const commentReport = report as CommentReportData;
      const baseUrl =
        commentReport.comment.review.type === 'professor'
          ? `/professor/${commentReport.comment.review.professor?.id}`
          : `/course/${commentReport.comment.review.course?.code}`;
      return `${baseUrl}#comment-${commentReport.comment.id}`;
    }
  };

  const getContent = () => {
    if (type === 'review') {
      return (report as ReviewReportData).review.fullComment;
    }
    return (report as CommentReportData).comment.fullContent;
  };

  const getAuthor = () => {
    if (type === 'review') {
      return (report as ReviewReportData).review.author;
    }
    return (report as CommentReportData).comment.author;
  };

  const getVotes = () => {
    if (type === 'review') {
      return {
        upvotes: (report as ReviewReportData).review.upvotes,
        downvotes: (report as ReviewReportData).review.downvotes
      };
    }
    return {
      upvotes: (report as CommentReportData).comment.upvotes,
      downvotes: (report as CommentReportData).comment.downvotes
    };
  };

  const getContext = () => {
    if (type === 'review') {
      const reviewReport = report as ReviewReportData;
      if (reviewReport.review.type === 'professor') {
        return {
          type: 'Professor' as const,
          name: reviewReport.review.professor?.name || 'Unknown'
        };
      }
      return {
        type: 'Course' as const,
        name: reviewReport.review.course?.name || 'Unknown',
        code: reviewReport.review.course?.code
      };
    } else {
      const commentReport = report as CommentReportData;
      if (commentReport.comment.review.type === 'professor') {
        return {
          type: 'Professor' as const,
          name: commentReport.comment.review.professor?.name || 'Unknown'
        };
      }
      return {
        type: 'Course' as const,
        name: commentReport.comment.review.course?.name || 'Unknown',
        code: commentReport.comment.review.course?.code
      };
    }
  };

  const votes = getVotes();
  const author = getAuthor();
  const context = getContext();

  // Determine header color based on reason
  const getReasonColor = () => {
    const reason = report.reason.toLowerCase();
    if (reason === 'inappropriate' || reason === 'spam' || reason === 'fake') {
      return 'from-red-500 to-red-600';
    } else if (reason === 'notrelevant') {
      return 'from-orange-500 to-orange-600';
    } else {
      return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-3xl overflow-y-auto'>
        {/* Color-coded header */}
        <div className={cn('absolute top-0 right-0 left-0 h-2 bg-linear-to-r', getReasonColor())} />

        <DialogHeader className='pt-2'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <DialogTitle className='text-2xl font-bold'>Report Details</DialogTitle>
              <DialogDescription className='mt-1'>Detailed information about this {type} report</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6 pt-2'>
          {/* Report Information Card */}
          <div className='rounded-lg border bg-card p-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <AlertCircle className='h-4 w-4' />
                  Report Reason
                </div>
                <ReasonBadge reason={report.reason} />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <Calendar className='h-4 w-4' />
                  Reported Date
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </p>
                  <p className='text-muted-foreground text-xs'>{format(new Date(report.createdAt), 'PPpp')}</p>
                </div>
              </div>
            </div>

            {report.details && (
              <div className='mt-4 space-y-2'>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <MessageSquare className='h-4 w-4' />
                  Details
                </div>
                <div className='rounded-md border bg-muted/50 p-3 text-sm'>{report.details}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Content Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-base font-bold'>
                <FileText className='h-5 w-5' />
                Reported Content
              </div>
            </div>
            <div className='rounded-lg border-2 border-muted-foreground/20 bg-muted/30 p-4'>
              <p className='text-sm leading-relaxed whitespace-pre-wrap'>{getContent()}</p>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Author Card */}
            <div className='rounded-lg border bg-card p-4'>
              <div className='flex items-center gap-2 text-sm'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Content Author:</span>
                <span className='font-semibold'>{author.username}</span>
              </div>
            </div>

            {/* Reporter Card */}
            <div className='rounded-lg border bg-card p-4'>
              <div className='flex items-center gap-2 text-sm'>
                <Flag className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Reporter:</span>
                <span className='font-semibold'>{report.reporter.username}</span>
              </div>
            </div>
          </div>

          {/* Context & Votes */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border bg-card p-4'>
              <div className='space-y-2'>
                <Badge variant='secondary' className='text-xs'>
                  {context.type}
                </Badge>
                <p className='text-sm font-medium'>{context.name}</p>
                {'code' in context && context.code && (
                  <p className='text-muted-foreground text-xs'>Code: {context.code}</p>
                )}
              </div>
            </div>
            <div className='rounded-lg border bg-card p-4'>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-muted-foreground'>Community Votes:</span>
                <div className='flex items-center gap-1'>
                  <ThumbsUp className='h-4 w-4 text-green-600 dark:text-green-400' />
                  <span className='font-semibold'>{votes.upvotes}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <ThumbsDown className='h-4 w-4 text-red-600 dark:text-red-400' />
                  <span className='font-semibold'>{votes.downvotes}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-between'>
            <Button
              variant='destructive'
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className='gap-2'>
              <Trash2 className='h-4 w-4' />
              Delete {type === 'review' ? 'Review' : 'Comment'}
            </Button>
            <Button
              asChild
              variant='default'
              className='gap-2'>
              <a href={getContentUrl()} target='_blank' rel='noopener noreferrer'>
                <ExternalLink className='h-4 w-4' />
                View in Context
              </a>
            </Button>
            <Button variant='outline' onClick={() => onOpenChange(false)} className='gap-2'>
              Close
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {type === 'review' ? 'Review' : 'Comment'}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {type} and all associated data including
                votes and nested content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className='bg-red-600 hover:bg-red-700 focus:ring-red-600'>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
