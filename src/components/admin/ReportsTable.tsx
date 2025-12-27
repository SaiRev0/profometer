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
import { BadgeInfo, FileQuestion } from 'lucide-react';

export interface ReviewReportData {
  id: string;
  reason: string;
  details: string | null;
  createdAt: string;
  reporter: {
    id: string;
    username: string;
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
  // eslint-disable-next-line no-unused-vars
  onPageChange?: (page: number) => void;
  onDelete?: () => void;
}

export function ReportsTable({
  type,
  reports,
  isLoading = false,
  pagination,
  onPageChange,
  onDelete
}: ReportsTableProps) {
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

  const getContentPreview = (report: ReviewReportData | CommentReportData) => {
    if (type === 'review') {
      return (report as ReviewReportData).review.comment;
    }
    return (report as CommentReportData).comment.content;
  };

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-lg border-2 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'>
              <TableHead className='w-8 p-2 text-center font-semibold text-slate-700 dark:text-slate-300'></TableHead>
              <TableHead className='min-w-40 text-center font-semibold text-slate-700 dark:text-slate-300'>
                Reason
              </TableHead>
              <TableHead className='text-center font-semibold text-slate-700 dark:text-slate-300'>Content</TableHead>
              <TableHead className='w-40 text-center font-semibold text-slate-700 dark:text-slate-300'>Date</TableHead>
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
                <TableCell className='w-8 p-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setSelectedReport(report)}
                    className='h-6 w-6 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400'>
                    <BadgeInfo className='h-4 w-4' />
                  </Button>
                </TableCell>
                <TableCell>
                  <ReasonBadge reason={report.reason} />
                </TableCell>
                <TableCell className='max-w-md'>
                  <div className='group relative'>
                    <p className='line-clamp-2 text-sm'>{getContentPreview(report)}</p>
                    <div className='bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 hidden max-w-lg rounded-md border p-2 text-xs shadow-md group-hover:block'>
                      {getContentPreview(report)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground w-40 text-sm whitespace-nowrap'>
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true
                  })}
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
          onDelete={onDelete}
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
              <TableHead className='w-10 p-2 font-semibold text-slate-700 dark:text-slate-300'></TableHead>
              <TableHead className='min-w-35 font-semibold text-slate-700 dark:text-slate-300'>Reason</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Content</TableHead>
              <TableHead className='w-40 font-semibold text-slate-700 dark:text-slate-300'>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow
                key={i}
                className={cn(i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50')}>
                <TableCell className='w-10 p-2'>
                  <Skeleton className='h-8 w-8 rounded' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-6 w-24 rounded-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-64' />
                </TableCell>
                <TableCell className='w-40'>
                  <Skeleton className='h-4 w-28' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
