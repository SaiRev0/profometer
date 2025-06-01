'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { Course, Professor, ProfessorReview } from '@/lib/types';

import { Button } from '../ui/button';
import CourseForm from './CourseForm';
import CoursesSection from './CoursesSection';
import RatingSummary from './RatingSummary';
import ReviewList from './ReviewList';
import SideBar from './SideBar';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const ReviewForm = dynamic(() => import('./ReviewForm'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

interface ProfessorDetailsProps {
  professor: Professor;
  courses: Course[];
}

export default function ProfessorDetails({ professor, courses }: ProfessorDetailsProps) {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <div className='mb-6 flex items-center gap-2'>
        <Button variant='ghost' size='sm' className='gap-1' asChild>
          <Link href='/'>
            <ChevronLeft className='h-4 w-4' />
            Back to Home
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='flex flex-col gap-6 md:flex-row'>
        {/* Professor Info Sidebar */}
        <SideBar professor={{ ...professor, numCourses: courses.length }} />
        {/* Main Content */}
        <div className='md:w-2/3'>
          {/* Rating Summary */}
          <RatingSummary professor={professor} setModalState={setReviewFormOpen} />
          {/* Courses Section In Review List */}
          <CoursesSection
            professor={professor}
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseSelect={setSelectedCourse}
          />
          {/* Reviews Section */}
          <ReviewList professor={professor} selectedCourse={selectedCourse} />
          {/* Add Course Dialog */}
          <CourseForm professor={professor} modalState={addCourseDialogOpen} setModalState={setAddCourseDialogOpen} />
        </div>
      </motion.div>
      {/* Review Form Dialog */}
      {reviewFormOpen && (
        <ReviewForm
          professor={professor}
          modalState={reviewFormOpen}
          setModalState={setReviewFormOpen}
          setAddCourseDialogOpen={setAddCourseDialogOpen}
        />
      )}
    </div>
  );
}
