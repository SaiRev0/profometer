import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Professor } from '@/lib/types';

interface CoursesSectionProps {
  professor: Professor;
  selectedCourse: string;
  onCourseSelect: (courseCode: string) => void;
}

function CoursesSection({ professor, selectedCourse, onCourseSelect }: CoursesSectionProps) {
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
            All Courses
          </Badge>

          {professor.courses.map((course) => (
            <Badge
              key={course.code}
              variant={selectedCourse === course.id ? 'default' : 'outline'}
              className='cursor-pointer'
              onClick={() => onCourseSelect(course.id)}>
              {course.code} ({course.reviewCount || 0})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CoursesSection;
