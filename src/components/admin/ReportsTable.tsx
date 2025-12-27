'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { ReasonBadge } from './ReasonBadge';
import { ReportDetailDialog } from './ReportDetailDialog';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, ExternalLink, Eye, FileQuestion } from 'lucide-react';

export interface ReviewReportData {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
    email: string;
  };
  review: {
    id: string;
    comment: string;
    fullComment: string;
    type: 'professor' | 'course';
    upvotes: number;
    downvotes: number;
    author: {
      id: string;
      username: string;
    };
    professor: {
      id: string;
      name: string;
    } | null;
    course: {
      code: string;
      name: string;
    } | null;
  };
}

export interface CommentReportData {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
    email: string;
  };
  comment: {
    id: string;
    content: string;
    fullContent: string;
    upvotes: number;
    downvotes: number;
    author: {
      id: string;
      username: string;
    };
    review: {
      id: string;
      type: 'professor' | 'course';
      professor: {
        id: string;
        name: string;
      } | null;
      course: {
        code: string;
        name: string;
      } | null;
    };
  };
}

interface ReportsTableProps {
  type: 'review' | 'comment';
  reports: ReviewReportData[] | CommentReportData[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (page: number) => void;
}

export function ReportsTable({ type, reports, isLoading = false, pagination, onPageChange }: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<ReviewReportData | CommentReportData | null>(null);

  if (isLoading) {
    return <ReportsTableSkeleton />;
  }

  if (!reports || reports.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 py-16 dark:bg-slate-900'>
        <div className='rounded-full bg-slate-100 p-4 dark:bg-slate-800'>
          <FileQuestion className='h-8 w-8 text-slate-400' />
        </div>
        <h3 className='mt-4 text-lg font-semibold'>No reports found</h3>
        <p className='text-muted-foreground mt-2 text-sm'>There are no {type} reports matching your filters.</p>
      </div>
    );
  }

  const getContentUrl = (report: ReviewReportData | CommentReportData) => {
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

  const getContentPreview = (report: ReviewReportData | CommentReportData) => {
    if (type === 'review') {
      return (report as ReviewReportData).review.comment;
    }
    return (report as CommentReportData).comment.content;
  };

  const getAuthor = (report: ReviewReportData | CommentReportData) => {
    if (type === 'review') {
      return (report as ReviewReportData).review.author.username;
    }
    return (report as CommentReportData).comment.author.username;
  };

  const getContext = (report: ReviewReportData | CommentReportData) => {
    if (type === 'review') {
      const reviewReport = report as ReviewReportData;
      if (reviewReport.review.type === 'professor') {
        return reviewReport.review.professor?.name || 'Unknown';
      }
      return reviewReport.review.course?.name || 'Unknown';
    } else {
      const commentReport = report as CommentReportData;
      if (commentReport.comment.review.type === 'professor') {
        return commentReport.comment.review.professor?.name || 'Unknown';
      }
      return commentReport.comment.review.course?.name || 'Unknown';
    }
  };

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-lg border-2 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Reporter</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Reason</TableHead>
              <TableHead className='max-w-xs font-semibold text-slate-700 dark:text-slate-300'>
                Content Preview
              </TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Author</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Context</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Date</TableHead>
              <TableHead className='text-right font-semibold text-slate-700 dark:text-slate-300'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report, index) => (
              <TableRow
                key={report.id}
                className={cn(
                  'group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900',
                  index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'
                )}>
                <TableCell className='font-medium'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
                      {report.reporter.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{report.reporter.username}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <ReasonBadge reason={report.reason} />
                </TableCell>
                <TableCell className='max-w-xs'>
                  <div className='group relative'>
                    <p className='truncate text-sm'>{getContentPreview(report)}</p>
                    <div className='bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 hidden max-w-sm rounded-md border p-2 text-xs shadow-md group-hover:block'>
                      {getContentPreview(report)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='h-3.5 w-3.5 text-orange-500' />
                    <span className='font-medium'>{getAuthor(report)}</span>
                  </div>
                </TableCell>
                <TableCell className='max-w-37.5'>
                  <p className='truncate text-sm font-medium'>{getContext(report)}</p>
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  <div className='flex flex-col'>
                    <span>
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedReport(report)}
                      className='hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400'>
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400'>
                      <a href={getContentUrl(report)} target='_blank' rel='noopener noreferrer'>
                        <ExternalLink className='h-4 w-4' />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className='flex justify-center'>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}

      {/* Detail Dialog */}
      {selectedReport && (
        <ReportDetailDialog
          type={type}
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open: boolean) => !open && setSelectedReport(null)}
        />
      )}
    </div>
  );
}

function ReportsTableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-lg border-2 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Reporter</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Reason</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Content Preview</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Author</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Context</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Date</TableHead>
              <TableHead className='text-right font-semibold text-slate-700 dark:text-slate-300'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow
                key={i}
                className={cn(i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50')}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-8 w-8 rounded-full' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className='h-6 w-24 rounded-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-48' />
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-3.5 w-3.5 rounded-full' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <div className='flex justify-end gap-1'>
                    <Skeleton className='h-8 w-8 rounded' />
                    <Skeleton className='h-8 w-8 rounded' />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
