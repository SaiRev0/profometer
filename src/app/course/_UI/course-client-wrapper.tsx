'use client';

import { notFound } from 'next/navigation';

import CourseDetails from '@/components/course';
import CoursePageSkeleton from '@/components/course/CourseDetailsSkeleton';
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
