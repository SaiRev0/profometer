'use client';

import { notFound } from 'next/navigation';

import CourseDetails, { CoursePageSkeleton } from '@/components/course';
import { useCourse } from '@/hooks/use-course';

export default function CourseClientWrapper({ code }: { code: string }) {
  const { data: course, isLoading, error } = useCourse(code);

  if (error) {
    notFound();
  }

  if (isLoading) {
    return <CoursePageSkeleton />;
  }

  if (!course) {
    notFound();
  }

  return <CourseDetails course={course} />;
}
