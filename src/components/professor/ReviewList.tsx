'use client';

import { useState } from 'react';

import ReviewCard, { ReviewCardSkeleton } from '@/components/cards/ReviewCard';
import FilterDropdown, { SortOption } from '@/components/filters/filter-dropdown';
import { useGetProfessorReviews } from '@/hooks/useGetProfessorReviews';
import { Professor } from '@/lib/types';
import { useIntersection } from '@mantine/hooks';

import { useSession } from 'next-auth/react';

interface ReviewListProps {
  professor: Professor;
  selectedCourse: string;
}

export default function ReviewList({ professor, selectedCourse }: ReviewListProps) {
  const { data: session } = useSession();
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  const {
    data: reviewsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage
  } = useGetProfessorReviews(professor.id, 10);

  const { ref, entry } = useIntersection({
    root: null,
    threshold: 0.5
  });

  // Load more reviews when the last review is visible
  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  // Combine initial reviews with fetched reviews
  const allReviews = reviewsData?.pages.flatMap((page) => page.reviews) || [];

  const filteredReviews = allReviews
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

      {isFetching && !isFetchingNextPage ? (
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {filteredReviews.length > 0 ? (
        <div className='mt-8 space-y-6'>
          {filteredReviews.map((review, index) => {
            const isLastReview = index === filteredReviews.length - 1;
            return (
              <div key={review.id} ref={isLastReview ? ref : undefined}>
                <ReviewCard
                  review={review}
                  variant={session?.user?.email && review.user?.email === session.user.email ? 'own' : 'default'}
                  usedIn='professor'
                  professor={professor}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <p className='text-muted-foreground text-center text-sm'>No reviews found for this professor.</p>
      )}
      {isFetchingNextPage && (
        <div className='flex justify-center py-4'>
          <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
        </div>
      )}
      {!hasNextPage && filteredReviews.length > 0 && (
        <div className='text-muted-foreground text-center text-sm'>No more reviews to load</div>
      )}
    </div>
  );
}
