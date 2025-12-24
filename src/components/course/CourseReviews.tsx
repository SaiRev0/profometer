import { useState } from 'react';

import ReviewCard, { ReviewCardSkeleton } from '@/components/cards/ReviewCard';
import FilterDropdown, { SortOption } from '@/components/filters/filter-dropdown';
import { useGetCourseReviews } from '@/hooks/useGetCourseReviews';
import { Course } from '@/lib/types';
import { useIntersection } from '@mantine/hooks';

import { Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CourseReviews({ course }: { course: Course }) {
  const { data: session } = useSession();
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const {
    data: reviews,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useGetCourseReviews(course.code, 10);

  const { ref, entry } = useIntersection({
    root: null,
    threshold: 0.5
  });

  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const allReviews = reviews?.pages.flatMap((page) => page.reviews) || [];

  const sortedReviews = allReviews.sort((a, b) => {
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

      {isFetching && !isFetchingNextPage ? (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {sortedReviews.length > 0 ? (
        <div className='space-y-4'>
          {sortedReviews.map((review, index) => {
            const isLastReview = index === sortedReviews.length - 1;
            return (
              <div key={review.id} ref={isLastReview ? ref : undefined}>
                <ReviewCard
                  review={review}
                  variant={session?.user?.id === review.user.id ? 'own' : 'default'}
                  usedIn='course'
                  course={course}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className='text-muted-foreground text-center text-sm'>No reviews found for this course.</p>
      )}
      {isFetchingNextPage && (
        <div className='flex justify-center py-4'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
        </div>
      )}
      {!hasNextPage && sortedReviews.length > 0 && (
        <div className='text-muted-foreground text-center text-sm'>No more reviews to load</div>
      )}
    </div>
  );
}
