import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Professor } from '@/lib/types';

function CoursesSection({ professor }: { professor: Professor }) {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
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
            onClick={() => setSelectedCourse('all')}>
            All Courses
          </Badge>

          {professor.courses.map((course) => (
            <Badge
              key={course.code}
              variant={selectedCourse === course.code ? 'default' : 'outline'}
              className='cursor-pointer'
              onClick={() => setSelectedCourse(course.code)}>
              {course.code} ({course.reviewCount})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CoursesSection;
