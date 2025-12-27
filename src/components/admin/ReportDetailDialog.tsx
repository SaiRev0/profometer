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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDeleteComment } from '@/hooks/useDeleteComment';
import { useDeleteReview } from '@/hooks/useDeleteReview';
import type { GroupedCommentReport, GroupedReviewReport } from '@/lib/types/admin-reports';
import { cn } from '@/lib/utils';

import { ReasonBadge } from './ReasonBadge';
import { ReasonBreakdownBadges } from './ReasonBreakdownBadges';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, ExternalLink, FileText, ThumbsDown, ThumbsUp, Trash2, User, Users } from 'lucide-react';

interface ReportDetailDialogProps {
  type: 'review' | 'comment';
  groupedReport: GroupedReviewReport | GroupedCommentReport;
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
}

export function ReportDetailDialog({ type, groupedReport, open, onOpenChange, onDelete }: ReportDetailDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showAllReporters, setShowAllReporters] = useState(false);

  const { deleteReview, isLoading: isReviewDeleting } = useDeleteReview();
  const { deleteComment, isLoading: isCommentDeleting } = useDeleteComment();

  const isDeleting = isReviewDeleting || isCommentDeleting;

  const MAX_VISIBLE_REPORTERS = 5;

  const handleDelete = async () => {
    try {
      if (type === 'review') {
        const reviewGroup = groupedReport as GroupedReviewReport;
        await deleteReview({ reviewId: reviewGroup.content.id });
      } else {
        const commentGroup = groupedReport as GroupedCommentReport;
        await deleteComment({
          commentId: commentGroup.content.id,
          reviewId: commentGroup.content.review.id
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
      const reviewGroup = groupedReport as GroupedReviewReport;
      const baseUrl =
        reviewGroup.content.type === 'professor'
          ? `/professor/${reviewGroup.content.professor?.id}`
          : `/course/${reviewGroup.content.course?.code}`;
      return `${baseUrl}#review-${reviewGroup.content.id}`;
    } else {
      const commentGroup = groupedReport as GroupedCommentReport;
      const baseUrl =
        commentGroup.content.review.type === 'professor'
          ? `/professor/${commentGroup.content.review.professor?.id}`
          : `/course/${commentGroup.content.review.course?.code}`;
      return `${baseUrl}#comment-${commentGroup.content.id}`;
    }
  };

  const getContent = () => {
    if (type === 'review') {
      return (groupedReport as GroupedReviewReport).content.fullComment;
    }
    return (groupedReport as GroupedCommentReport).content.fullContent;
  };

  const getAuthor = () => {
    if (type === 'review') {
      return (groupedReport as GroupedReviewReport).content.author;
    }
    return (groupedReport as GroupedCommentReport).content.author;
  };

  const getVotes = () => {
    if (type === 'review') {
      return {
        upvotes: (groupedReport as GroupedReviewReport).content.upvotes,
        downvotes: (groupedReport as GroupedReviewReport).content.downvotes
      };
    }
    return {
      upvotes: (groupedReport as GroupedCommentReport).content.upvotes,
      downvotes: (groupedReport as GroupedCommentReport).content.downvotes
    };
  };

  const getContext = () => {
    if (type === 'review') {
      const reviewGroup = groupedReport as GroupedReviewReport;
      if (reviewGroup.content.type === 'professor') {
        return {
          type: 'Professor' as const,
          name: reviewGroup.content.professor?.name || 'Unknown'
        };
      }
      return {
        type: 'Course' as const,
        name: reviewGroup.content.course?.name || 'Unknown',
        code: reviewGroup.content.course?.code
      };
    } else {
      const commentGroup = groupedReport as GroupedCommentReport;
      if (commentGroup.content.review.type === 'professor') {
        return {
          type: 'Professor' as const,
          name: commentGroup.content.review.professor?.name || 'Unknown'
        };
      }
      return {
        type: 'Course' as const,
        name: commentGroup.content.review.course?.name || 'Unknown',
        code: commentGroup.content.review.course?.code
      };
    }
  };

  const votes = getVotes();
  const author = getAuthor();
  const context = getContext();

  // Determine header color based on most common reason
  const getReasonColor = () => {
    const reasons = Object.keys(groupedReport.reasonBreakdown);
    if (reasons.some((r) => ['inappropriate', 'spam', 'fake'].includes(r))) {
      return 'from-red-500 to-red-600';
    } else if (reasons.includes('notRelevant')) {
      return 'from-orange-500 to-orange-600';
    } else {
      return 'from-slate-500 to-slate-600';
    }
  };

  const visibleReporters = showAllReporters
    ? groupedReport.reporters
    : groupedReport.reporters.slice(0, MAX_VISIBLE_REPORTERS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        {/* Color-coded header */}
        <div className={cn('absolute top-0 right-0 left-0 h-2 bg-linear-to-r', getReasonColor())} />

        <DialogHeader className='pt-2'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1'>
              <DialogTitle className='text-2xl font-bold'>Report Details</DialogTitle>
              <DialogDescription className='mt-1'>
                {groupedReport.reportCount} {groupedReport.reportCount === 1 ? 'report' : 'reports'} for this {type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4 pt-2'>
          {/* Reason Breakdown Summary */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <AlertCircle className='h-4 w-4' />
                Reason Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReasonBreakdownBadges reasonBreakdown={groupedReport.reasonBreakdown} />
            </CardContent>
          </Card>

          <Separator />

          {/* All Reporters Section */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Users className='h-4 w-4' />
                All Reporters ({groupedReport.reporters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className={cn(groupedReport.reporters.length > 5 ? 'h-64' : 'h-auto')}>
                <div className='space-y-3'>
                  {visibleReporters.map((reporter, index) => (
                    <div
                      key={reporter.reportId}
                      className={cn(
                        'rounded-lg border p-3',
                        index % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900' : 'bg-white dark:bg-slate-950'
                      )}>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex flex-1 items-center gap-2'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback className='text-xs'>
                              {reporter.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='text-sm font-semibold'>{reporter.username}</p>
                            <p className='text-muted-foreground text-xs'>
                              {formatDistanceToNow(new Date(reporter.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <ReasonBadge reason={reporter.reason} showIcon={false} />
                      </div>
                      {reporter.details && (
                        <p className='text-muted-foreground mt-2 border-l-2 border-slate-300 pl-2 text-sm'>
                          {reporter.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {groupedReport.reporters.length > MAX_VISIBLE_REPORTERS && !showAllReporters && (
                <Button variant='ghost' onClick={() => setShowAllReporters(true)} className='mt-3 w-full text-sm'>
                  Show {groupedReport.reporters.length - MAX_VISIBLE_REPORTERS} more reporters
                </Button>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Reported Content Section */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <FileText className='h-4 w-4' />
                Reported Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='border-muted-foreground/20 bg-muted/30 rounded-lg border-2 p-4'>
                <p className='text-sm leading-relaxed whitespace-pre-wrap'>{getContent()}</p>
              </div>

              {/* Metadata Grid */}
              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-muted-foreground text-xs font-medium'>Author</p>
                  <div className='mt-1 flex items-center gap-2'>
                    <User className='text-muted-foreground h-3 w-3' />
                    <p className='text-sm font-semibold'>{author.username}</p>
                  </div>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs font-medium'>Posted</p>
                  <p className='mt-1 text-sm font-semibold'>
                    {formatDistanceToNow(new Date(groupedReport.content.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs font-medium'>Community Votes</p>
                  <div className='mt-1 flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      <ThumbsUp className='h-3 w-3 text-green-600 dark:text-green-400' />
                      <span className='text-sm font-semibold'>{votes.upvotes}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <ThumbsDown className='h-3 w-3 text-red-600 dark:text-red-400' />
                      <span className='text-sm font-semibold'>{votes.downvotes}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs font-medium'>Context</p>
                  <div className='mt-1'>
                    <Badge variant='secondary' className='text-xs'>
                      {context.type}
                    </Badge>
                    <p className='mt-1 text-sm font-medium'>{context.name}</p>
                    {'code' in context && context.code && (
                      <p className='text-muted-foreground text-xs'>Code: {context.code}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
            <div className='grid grid-cols-2 gap-2'>
              <Button asChild variant='default' className='gap-2'>
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
