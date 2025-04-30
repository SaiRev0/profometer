'use client';

import { useState } from 'react';

import ReviewCard from '@/components/cards/review-card';
import FilterDropdown, { SortOption } from '@/components/filters/filter-dropdown';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Review } from '@/lib/types';

interface ReviewListProps {
  reviews: Review[];
  onReviewSubmit: (review: Review) => void;
}

export default function ReviewList({ reviews, onReviewSubmit }: ReviewListProps) {
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleReviews((prev) => prev + 5);
      setLoadingMore(false);
    }, 800);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const filteredReviews = reviews
    .filter((review) => selectedCourse === 'all' || review.courseCode === selectedCourse)
    .sort((a, b) => {
      if (sortOption === 'recent') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortOption === 'rating-high') {
        return b.ratings.overall - a.ratings.overall;
      } else if (sortOption === 'rating-low') {
        return a.ratings.overall - b.ratings.overall;
      }
      return 0;
    });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <FilterDropdown sortOption={sortOption} onSortChange={handleSortChange} />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className='border-input bg-background h-9 rounded-md border px-3 py-1 text-sm shadow-sm transition-colors'>
            <option value='all'>All Courses</option>
            {Array.from(new Set(reviews.map((review) => review.courseCode))).map((courseCode) => (
              <option key={courseCode} value={courseCode}>
                {courseCode}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='space-y-4'>
        {filteredReviews.slice(0, visibleReviews).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {visibleReviews < filteredReviews.length && (
        <div className='flex justify-center'>
          <Button variant='outline' onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? (
              <>
                <Skeleton className='mr-2 h-4 w-4' />
                Loading...
              </>
            ) : (
              'Load More Reviews'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
