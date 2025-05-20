import { useState } from 'react';

import ReviewCard from '@/components/cards/ReviewCard';
import FilterDropdown, { SortOption } from '@/components/filters/filter-dropdown';
import { Button } from '@/components/ui/button';
import { Course, CourseReview } from '@/lib/types';

import { Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CourseReviews({ course }: { course: Course }) {
  const { data: session } = useSession();
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(5);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleReviews((prev) => prev + 5);
      setLoadingMore(false);
    }, 800);
  };

  const sortedReviews = [...(course.reviews || [])].sort((a, b) => {
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
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-xl font-bold'>
          <Star className='text-primary h-5 w-5' />
          Course Reviews
        </h2>

        <div className='flex items-center gap-2'>
          <FilterDropdown
            sortOption={sortOption}
            onSortChange={setSortOption}
            variant='outline'
            showActiveFilters={false}
          />
        </div>
      </div>
      {sortedReviews.length > 0 ? (
        <div className='space-y-4'>
          {sortedReviews.slice(0, visibleReviews).map((review: CourseReview) => (
            <ReviewCard
              key={review.id}
              review={review}
              variant={session?.user?.email === review.user.email ? 'own' : 'default'}
              usedIn='course'
            />
          ))}

          {visibleReviews < sortedReviews.length && (
            <div className='mt-6 flex justify-center'>
              <Button variant='outline' onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More Reviews'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className='text-muted-foreground text-center text-sm'>No reviews found for this course.</p>
      )}
    </div>
  );
}
