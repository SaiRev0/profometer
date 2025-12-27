'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { GroupedCommentReport, GroupedReviewReport } from '@/lib/types/admin-reports';
import { cn } from '@/lib/utils';

import { ReportDetailDialog } from './ReportDetailDialog';
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
  groupedReports: GroupedReviewReport[] | GroupedCommentReport[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    totalReports: number;
    totalGroups: number;
  };
  // eslint-disable-next-line no-unused-vars
  onPageChange?: (page: number) => void;
  onDelete?: () => void;
}

export function ReportsTable({
  type,
  groupedReports,
  isLoading = false,
  pagination,
  meta,
  onPageChange,
  onDelete
}: ReportsTableProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupedReviewReport | GroupedCommentReport | null>(null);

  if (isLoading) {
    return <ReportsTableSkeleton />;
  }

  if (!groupedReports || groupedReports.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 py-16 dark:bg-slate-900'>
        <div className='rounded-full bg-slate-100 p-4 dark:bg-slate-800'>
          <FileQuestion className='h-8 w-8 text-slate-400' />
        </div>
        <h3 className='mt-4 text-lg font-semibold'>No reports found</h3>
        <p className='text-muted-foreground mt-2 text-sm'>There are no {type} reports matching your filters.</p>
        {meta && meta.totalReports > 0 && (
          <p className='text-muted-foreground mt-1 text-xs'>
            ({meta.totalReports} individual reports across {meta.totalGroups} content pieces)
          </p>
        )}
      </div>
    );
  }

  const getContentPreview = (group: GroupedReviewReport | GroupedCommentReport) => {
    if (type === 'review') {
      return (group as GroupedReviewReport).content.comment;
    }
    return (group as GroupedCommentReport).content.content;
  };

  const getCountBadgeClassName = (count: number) => {
    if (count >= 10) {
      return 'bg-red-600 text-white hover:bg-red-700 text-base px-3 py-1.5 font-bold';
    } else if (count >= 5) {
      return 'bg-orange-600 text-white hover:bg-orange-700 text-sm px-2.5 py-1 font-semibold';
    }
    return 'bg-yellow-600 text-white hover:bg-yellow-700 text-xs px-2 py-0.5 font-medium';
  };

  return (
    <div className='space-y-4'>
      {/* Summary Stats */}
      {meta && (
        <div className='text-muted-foreground flex items-center gap-4 text-sm'>
          <span>
            <strong className='text-foreground'>{meta.totalGroups}</strong> content pieces reported
          </span>
          <span>•</span>
          <span>
            <strong className='text-foreground'>{meta.totalReports}</strong> total reports
          </span>
        </div>
      )}

      <div className='overflow-hidden rounded-lg border-2 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'>
              <TableHead className='w-8 p-2 text-center font-semibold text-slate-700 dark:text-slate-300'></TableHead>
              <TableHead className='w-24 text-center font-semibold text-slate-700 dark:text-slate-300'>
                Reports
              </TableHead>
              <TableHead className='text-center font-semibold text-slate-700 dark:text-slate-300'>Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedReports.map((group, index) => (
              <TableRow
                key={group.contentId}
                className={cn(
                  'group transition-colors hover:bg-slate-50 dark:hover:bg-slate-900',
                  index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'
                )}>
                {/* Info Button */}
                <TableCell className='w-8 p-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setSelectedGroup(group)}
                    className='h-6 w-6 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400'>
                    <BadgeInfo className='h-4 w-4' />
                  </Button>
                </TableCell>

                {/* Report Count */}
                <TableCell className='text-center'>
                  <Badge className={cn('whitespace-nowrap', getCountBadgeClassName(group.reportCount))}>
                    {group.reportCount}
                  </Badge>
                </TableCell>

                {/* Content Preview */}
                <TableCell className='max-w-md'>
                  <div className='group/preview relative'>
                    <p className='line-clamp-2 text-center text-sm'>{getContentPreview(group)}</p>
                    <div className='bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 hidden max-w-lg rounded-md border p-2 text-center text-xs shadow-md group-hover/preview:block'>
                      {getContentPreview(group)}
                    </div>
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
      {selectedGroup && (
        <ReportDetailDialog
          type={type}
          groupedReport={selectedGroup}
          open={!!selectedGroup}
          onOpenChange={(open: boolean) => !open && setSelectedGroup(null)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

function ReportsTableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-4 w-32' />
      </div>
      <div className='overflow-hidden rounded-lg border-2 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'>
              <TableHead className='w-8 p-2 font-semibold text-slate-700 dark:text-slate-300'></TableHead>
              <TableHead className='w-24 text-center font-semibold text-slate-700 dark:text-slate-300'>
                Reports
              </TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow
                key={i}
                className={cn(i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50')}>
                <TableCell className='w-8 p-2'>
                  <Skeleton className='h-6 w-6 rounded' />
                </TableCell>
                <TableCell className='text-center'>
                  <Skeleton className='mx-auto h-6 w-16 rounded-full' />
                </TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    <Skeleton className='h-5 w-20 rounded-full' />
                    <Skeleton className='h-5 w-24 rounded-full' />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-64' />
                </TableCell>
                <TableCell className='w-44'>
                  <div className='space-y-1'>
                    <Skeleton className='h-3 w-32' />
                    <Skeleton className='h-3 w-28' />
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
