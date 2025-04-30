'use client';

import { useState } from 'react';

import { Professor, Review } from '@/lib/types';

import ProfessorHeader from './ProfessorHeader';
import ProfessorTabs from './ProfessorTabs';

interface ProfessorDetailsProps {
  professor: Professor;
  initialReviews: Review[];
}

export default function ProfessorDetails({ professor, initialReviews }: ProfessorDetailsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const handleReviewSubmit = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <ProfessorHeader professor={professor} />
      <ProfessorTabs professor={professor} reviews={reviews} onReviewSubmit={handleReviewSubmit} />
    </div>
  );
}
