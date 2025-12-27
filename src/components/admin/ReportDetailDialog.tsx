'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { ReasonBadge } from './ReasonBadge';
import type { CommentReportData, ReviewReportData } from './ReportsTable';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  Copy,
  ExternalLink,
  FileText,
  Flag,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  User
} from 'lucide-react';

interface ReportDetailDialogProps {
  type: 'review' | 'comment';
  report: ReviewReportData | CommentReportData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDetailDialog({ type, report, open, onOpenChange }: ReportDetailDialogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  const contentId =
    type === 'review' ? (report as ReviewReportData).review.id : (report as CommentReportData).comment.id;

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
            <div className='rounded-lg bg-red-50 p-2 dark:bg-red-950'>
              <Flag className='h-5 w-5 text-red-600 dark:text-red-400' />
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-6 pt-2'>
          {/* Report Information Card */}
          <div className='rounded-lg border-2 bg-linear-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
                  <AlertCircle className='h-4 w-4' />
                  Report Reason
                </div>
                <ReasonBadge reason={report.reason} />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
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
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
                  <MessageSquare className='h-4 w-4' />
                  Additional Details
                </div>
                <div className='rounded-md border bg-white p-3 text-sm dark:bg-slate-950'>{report.details}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Content Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-base font-bold'>
                <FileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                Reported Content
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => copyToClipboard(contentId, 'content')}
                className='gap-2'>
                <Copy className='h-3.5 w-3.5' />
                {copiedId === 'content' ? 'Copied!' : 'Copy ID'}
              </Button>
            </div>
            <div className='rounded-lg border-2 border-orange-200 bg-orange-50/50 p-4 dark:border-orange-900 dark:bg-orange-950/20'>
              <p className='text-sm leading-relaxed whitespace-pre-wrap'>{getContent()}</p>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Author Card */}
            <div className='rounded-lg border bg-linear-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-950 dark:to-blue-900'>
              <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                <User className='h-4 w-4' />
                Content Author
              </div>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 text-sm font-bold text-blue-900 dark:bg-blue-800 dark:text-blue-100'>
                  {author.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className='font-semibold'>{author.username}</p>
                  <p className='text-muted-foreground text-xs'>ID: {author.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>

            {/* Reporter Card */}
            <div className='rounded-lg border bg-linear-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-950 dark:to-purple-900'>
              <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-purple-900 dark:text-purple-100'>
                <Flag className='h-4 w-4' />
                Reporter
              </div>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-200 text-sm font-bold text-purple-900 dark:bg-purple-800 dark:text-purple-100'>
                  {report.reporter.username.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 overflow-hidden'>
                  <p className='font-semibold'>{report.reporter.username}</p>
                  <p className='text-muted-foreground truncate text-xs'>{report.reporter.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Context & Votes */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
              <h4 className='mb-3 text-sm font-semibold'>Context</h4>
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
            <div className='rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
              <h4 className='mb-3 text-sm font-semibold'>Community Votes</h4>
              <div className='flex gap-4'>
                <div className='flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950'>
                  <ThumbsUp className='h-4 w-4 text-green-600 dark:text-green-400' />
                  <span className='font-bold text-green-700 dark:text-green-300'>{votes.upvotes}</span>
                </div>
                <div className='flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950'>
                  <ThumbsDown className='h-4 w-4 text-red-600 dark:text-red-400' />
                  <span className='font-bold text-red-700 dark:text-red-300'>{votes.downvotes}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
            <Button variant='outline' onClick={() => onOpenChange(false)} className='gap-2'>
              Close
            </Button>
            <Button
              asChild
              className='gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
              <a href={getContentUrl()} target='_blank' rel='noopener noreferrer'>
                <ExternalLink className='h-4 w-4' />
                View in Context
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
