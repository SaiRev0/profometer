'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Professor, Review } from '@/lib/types';

import { Button } from '../ui/button';
import CoursesSection from './CoursesSection';
import RatingSummary from './RatingSummary';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import SideBar from './SideBar';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface ProfessorDetailsProps {
  professor: Professor;
  initialReviews: Review[];
}

export default function ProfessorDetails({ professor, initialReviews }: ProfessorDetailsProps) {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

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
        <SideBar professor={professor} />
        {/* Main Content */}
        <div className='md:w-2/3'>
          {/* Rating Summary */}
          <RatingSummary professor={professor} setModalState={setReviewFormOpen} />
          {/* Courses Section */}
          <CoursesSection professor={professor} />
          {/* Reviews Section */}
          <ReviewList initialReviews={initialReviews} />
        </div>
      </motion.div>
      {/* Review Form Dialog */}
      <ReviewForm professor={professor} modalState={reviewFormOpen} setModalState={setReviewFormOpen} />
    </div>
  );
}
