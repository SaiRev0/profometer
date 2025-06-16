'use client';

import { notFound } from 'next/navigation';

import CourseDetails from '@/components/course';
import CoursePageSkeleton from '@/components/course/CourseDetailsSkeleton';
import { useGetCourseById } from '@/hooks/useGetCourseById';

export default function CourseClientWrapper({ code }: { code: string }) {
  const { data, isLoading, error } = useGetCourseById(code);

  if (isLoading) {
    return <CoursePageSkeleton />;
  }

  if (error || !data) {
    notFound();
  }

  return <CourseDetails course={data.course} professors={data.professors} />;
}
