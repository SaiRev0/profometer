'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import Pagination from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUnverifiedCourses } from '@/hooks/useUnverifiedCourses';
import { useVerifyCourse } from '@/hooks/useVerifyCourse';
import { cn } from '@/lib/utils';

import { BookCheck, BookOpen, Calendar, CheckCircle, FileQuestion, Hash, Info } from 'lucide-react';

interface CourseVerificationTableProps {
  page: number;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void;
}

interface CourseDetails {
  code: string;
  name: string;
  description: string;
  credits: number;
  departmentCode: string;
  department: {
    code: string;
    name: string;
  };
  createdAt: string;
  _count: {
    reviews: number;
  };
}

export function CourseVerificationTable({ page, onPageChange }: CourseVerificationTableProps) {
  const { data, isLoading } = useUnverifiedCourses({ page, limit: 10 });
  const { mutate: verifyCourse, isPending: isVerifying } = useVerifyCourse();
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(null);
  const [courseToVerify, setCourseToVerify] = useState<string | null>(null);

  const handleVerify = (courseCode: string) => {
    verifyCourse(
      { courseCode },
      {
        onSuccess: () => {
          setCourseToVerify(null);
        }
      }
    );
  };

  if (isLoading) {
    return <CourseVerificationTableSkeleton />;
  }

  if (!data || data.courses.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 py-16 dark:bg-slate-900'>
        <div className='rounded-full bg-slate-100 p-4 dark:bg-slate-800'>
          <FileQuestion className='h-8 w-8 text-slate-400' />
        </div>
        <h3 className='mt-4 text-lg font-semibold'>No unverified courses</h3>
        <p className='text-muted-foreground mt-2 text-sm'>All courses have been verified.</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Summary */}
      <div className='text-muted-foreground flex items-center gap-4 text-sm'>
        <span>
          <strong className='text-foreground'>{data.pagination.totalCount}</strong> courses pending verification
        </span>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-lg border-2 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Code</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Name</TableHead>
              <TableHead className='text-center font-semibold text-slate-700 dark:text-slate-300'>Department</TableHead>
              <TableHead className='text-center font-semibold text-slate-700 dark:text-slate-300'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.courses.map((course, index) => (
              <TableRow
                key={course.code}
                className={cn(
                  'transition-colors hover:bg-slate-50 dark:hover:bg-slate-900',
                  index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'
                )}>
                {/* Course Code */}
                <TableCell className='font-mono text-sm font-semibold'>{course.code}</TableCell>

                {/* Course Name */}
                <TableCell className='max-w-xs'>
                  <div className='truncate' title={course.name}>
                    {course.name}
                  </div>
                </TableCell>

                {/* Department */}
                <TableCell className='text-center'>
                  <Badge variant='outline' className='font-mono text-xs'>
                    {course.department.code}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedCourse(course)}
                      className='h-8 gap-1 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400'>
                      <Info className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className='flex justify-center'>
          <Pagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Course Details Dialog */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-2xl'>
                <BookOpen className='h-6 w-6 text-blue-600' />
                Course Details
              </DialogTitle>
              <DialogDescription>Review the course information before verification</DialogDescription>
            </DialogHeader>

            <div className='space-y-3'>
              {/* Course Code & Credits */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex items-center gap-3 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
                  <Hash className='h-5 w-5 shrink-0 text-slate-500' />
                  <div className='flex flex-1 items-center gap-2'>
                    <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>Code:</span>
                    <span className='font-mono text-sm font-bold'>{selectedCourse.code}</span>
                  </div>
                </div>

                <div className='flex items-center gap-3 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
                  <Hash className='h-5 w-5 shrink-0 text-slate-500' />
                  <div className='flex flex-1 items-center gap-2'>
                    <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>Credits:</span>
                    <span className='text-sm font-bold'>{selectedCourse.credits}</span>
                  </div>
                </div>
              </div>

              {/* Course Name */}
              <div className='flex items-center gap-3 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
                <BookCheck className='h-5 w-5 shrink-0 text-slate-500' />
                <div className='flex flex-1 items-center gap-2'>
                  <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>Name:</span>
                  <span className='text-sm font-semibold'>{selectedCourse.name}</span>
                </div>
              </div>

              {/* Description */}
              <div className='flex items-start gap-3 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
                <Info className='mt-0.5 h-5 w-5 shrink-0 text-slate-500' />
                <div className='flex-1'>
                  <div className='mb-2 text-sm font-medium text-slate-600 dark:text-slate-400'>Description:</div>
                  <div className='text-muted-foreground text-sm'>{selectedCourse.description}</div>
                </div>
              </div>

              {/* Department */}
              <div className='flex items-center gap-3 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
                <BookOpen className='h-5 w-5 shrink-0 text-slate-500' />
                <div className='flex flex-1 items-center gap-2'>
                  <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>Department:</span>
                  <span className='text-sm font-semibold'>
                    {selectedCourse.department.name} ({selectedCourse.department.code})
                  </span>
                </div>
              </div>

              {/* Created At */}
              <div className='flex items-center gap-3 rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
                <Calendar className='h-5 w-5 shrink-0 text-slate-500' />
                <div className='flex flex-1 items-center gap-2'>
                  <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>Created At:</span>
                  <span className='text-sm font-semibold'>
                    {new Date(selectedCourse.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant='outline' onClick={() => setSelectedCourse(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setCourseToVerify(selectedCourse.code);
                  setSelectedCourse(null);
                }}
                className='bg-green-600 hover:bg-green-700'>
                <CheckCircle className='mr-2 h-4 w-4' />
                Verify Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Verification Confirmation Dialog */}
      {courseToVerify && (
        <Dialog open={!!courseToVerify} onOpenChange={(open) => !open && setCourseToVerify(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Course</DialogTitle>
              <DialogDescription>
                Are you sure you want to verify this course? This action will mark the course as verified and it will be
                visible to all users.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant='outline' onClick={() => setCourseToVerify(null)} disabled={isVerifying}>
                Cancel
              </Button>
              <Button
                onClick={() => handleVerify(courseToVerify)}
                disabled={isVerifying}
                className='bg-green-600 hover:bg-green-700'>
                <CheckCircle className='mr-2 h-4 w-4' />
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CourseVerificationTableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-4 w-40' />
      </div>
      <div className='overflow-hidden rounded-lg border-2 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Course Code</TableHead>
              <TableHead className='font-semibold text-slate-700 dark:text-slate-300'>Course Name</TableHead>
              <TableHead className='text-center font-semibold text-slate-700 dark:text-slate-300'>Department</TableHead>
              <TableHead className='text-center font-semibold text-slate-700 dark:text-slate-300'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow
                key={i}
                className={cn(i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50')}>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-48' />
                </TableCell>
                <TableCell className='text-center'>
                  <Skeleton className='mx-auto h-5 w-16 rounded-full' />
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Skeleton className='h-8 w-20' />
                    <Skeleton className='h-8 w-20' />
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
