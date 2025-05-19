'use client';

import { useState } from 'react';

import ReviewCard from '@/components/cards/ReviewCard';
import FilterDropdown, { SortOption } from '@/components/filters/filter-dropdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProfessorReview } from '@/lib/types';

interface ReviewListProps {
  initialReviews: ProfessorReview[];
  selectedCourse: string;
}

export default function ReviewList({ initialReviews, selectedCourse }: ReviewListProps) {
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleReviews((prev) => prev + 5);
      setLoadingMore(false);
    }, 800);
  };

  const filteredReviews = initialReviews
    .filter((review) => selectedCourse === 'all' || review.courseCode === selectedCourse)
    .sort((a, b) => {
      if (sortOption === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOption === 'rating-high') {
        return b.ratings.overall - a.ratings.overall;
      } else if (sortOption === 'rating-low') {
        return a.ratings.overall - b.ratings.overall;
      }
      return 0;
    });

  return (
    <div>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='text-xl font-bold'>Student Reviews</h2>

        <FilterDropdown
          sortOption={sortOption}
          onSortChange={setSortOption}
          variant='outline'
          showActiveFilters={false}
        />
      </div>

      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className='p-6 text-center'>
            <p className='text-muted-foreground mb-4'>No reviews found for the selected filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {filteredReviews.slice(0, visibleReviews).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {visibleReviews < filteredReviews.length && (
            <div className='mt-6 flex justify-center'>
              <Button variant='outline' onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More Reviews'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
