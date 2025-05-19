'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Course, Professor } from '@/lib/types';

import CourseOverview from './CourseOverview';
import CourseProfessors from './CourseProfessors';
import CourseReviewForm from './CourseReviewForm';
import CourseReviews from './CourseReviews';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface CoursePageProps {
  course: Course & {
    professors: Professor[];
    departmentProfessors: Professor[];
  };
}

export default function CoursePage({ course }: CoursePageProps) {
  const router = useRouter();
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <div className='mb-6 flex items-center gap-2'>
        <Button variant='ghost' size='sm' className='gap-1' onClick={() => router.back()}>
          <ChevronLeft className='h-4 w-4' />
          Back
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Course Overview */}
        <CourseOverview course={course} setModalState={setReviewFormOpen} />

        {/* Professors Section */}
        <CourseProfessors course={course} />

        {/* Reviews Section */}
        <CourseReviews course={course} />
      </motion.div>

      {/* Review Form Dialog */}
      <CourseReviewForm course={course} modalState={reviewFormOpen} setModalState={setReviewFormOpen} />
    </div>
  );
}
