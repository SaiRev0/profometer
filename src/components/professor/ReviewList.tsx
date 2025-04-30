'use client';

import { useState } from 'react';



import ReviewCard from '@/components/cards/review-card';
import FilterDropdown, { SortOption } from '@/components/filters/filter-dropdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Review } from '@/lib/types';





interface ReviewListProps {
  initialReviews: Review[];
}

export default function ReviewList({ initialReviews }: ReviewListProps) {
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

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
    .filter((review) => selectedCourse === 'all' || review.courseId === selectedCourse)
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
            <Button onClick={() => setSelectedCourse('all')}>View All Reviews</Button>
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