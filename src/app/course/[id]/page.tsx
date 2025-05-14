import CourseClientWrapper from '@/app/course/_UI/course-client-wrapper';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <CourseClientWrapper code={id} />;
}
