'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Professor, Review } from '@/lib/types';

import ProfessorStats from './ProfessorStats';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface ProfessorTabsProps {
  professor: Professor;
  reviews: Review[];
  onReviewSubmit: (review: Review) => void;
}

export default function ProfessorTabs({ professor, reviews, onReviewSubmit }: ProfessorTabsProps) {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  return (
    <Tabs defaultValue='overview' className='w-full'>
      <div className='mb-4 flex items-center justify-between'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='reviews'>Reviews</TabsTrigger>
          <TabsTrigger value='courses'>Courses</TabsTrigger>
        </TabsList>
        <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
          <DialogTrigger asChild>
            <Button>Write a Review</Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>Share your experience with {professor.name}</DialogDescription>
            </DialogHeader>
            <ReviewForm professor={professor} onSubmit={onReviewSubmit} onClose={() => setReviewFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <TabsContent value='overview' className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold'>Statistics</h2>
            <ProfessorStats professor={professor} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value='reviews'>
        <ReviewList reviews={reviews} onReviewSubmit={onReviewSubmit} />
      </TabsContent>

      <TabsContent value='courses'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {professor.courses && professor.courses.length > 0 ? (
            professor.courses.map((course) => (
              <div key={course.code} className='bg-card text-card-foreground rounded-lg border p-4 shadow-sm'>
                <h3 className='font-semibold'>{course.code}</h3>
                <p className='text-muted-foreground text-sm'>{course.name}</p>
                <p className='text-muted-foreground mt-2 text-sm'>{course.reviews.length} reviews</p>
              </div>
            ))
          ) : (
            <div className='col-span-full py-8 text-center'>
              <p className='text-muted-foreground'>No courses available for this professor.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
