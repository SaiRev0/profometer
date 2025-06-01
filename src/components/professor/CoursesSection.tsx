'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Course, Professor } from '@/lib/types';

interface CoursesSectionProps {
  professor: Professor;
  courses: Course[];
  selectedCourse: string;
  onCourseSelect: (courseCode: string) => void;
}

function CoursesSection({ professor, courses, selectedCourse, onCourseSelect }: CoursesSectionProps) {
  return (
    <Card className='mb-6'>
      <CardHeader className='pb-2'>
        <CardTitle>Courses Taught</CardTitle>
        <CardDescription>Select a course to filter reviews</CardDescription>
      </CardHeader>

      <CardContent>
        <div className='flex flex-wrap gap-2'>
          <Badge
            variant={selectedCourse === 'all' ? 'default' : 'outline'}
            className='cursor-pointer'
            onClick={() => onCourseSelect('all')}>
            All Courses ({professor.statistics.totalReviews || 0})
          </Badge>

          {courses.map((course) => (
            <Badge
              key={course.code}
              variant={selectedCourse === course.code ? 'default' : 'outline'}
              className='cursor-pointer'
              onClick={() => onCourseSelect(course.code)}>
              {course.code}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CoursesSection;
