'use client';

import { notFound } from 'next/navigation';

import CourseDetails, { CoursePageSkeleton } from '@/components/course';
import { useGetCourse } from '@/hooks/useGetCourse';

export default function CourseClientWrapper({ code }: { code: string }) {
  const { data: course, isLoading, error } = useGetCourse(code);

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
