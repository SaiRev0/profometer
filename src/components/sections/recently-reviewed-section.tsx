import { useRef, useState } from 'react';

import Link from 'next/link';

import ProfessorCard, { Professor } from '@/components/cards/professor-card';
import { Button } from '@/components/ui/button';

import { ArrowRight, ChevronRight, Star } from 'lucide-react';

interface RecentlyReviewedSectionProps {
    professors: Professor[];
    isLoading: boolean;
}

export default function RecentlyReviewedSection({ professors, isLoading }: RecentlyReviewedSectionProps) {
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const [visibleRecentCount, setVisibleRecentCount] = useState(5);
    const recentScrollRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = () => {
        setLoadMoreLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            setVisibleRecentCount((prev) => prev + 5);
            setLoadMoreLoading(false);
        }, 800);
    };

    const scrollRecentSection = (direction: 'left' | 'right') => {
        if (!recentScrollRef.current) return;

        const scrollAmount = direction === 'left' ? -300 : 300;
        recentScrollRef.current.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <section className='mt-6'>
            <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <Star className='text-primary h-5 w-5' />
                    <h2 className='text-2xl font-bold'>Recently Reviewed</h2>
                </div>

                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => scrollRecentSection('left')}
                        className='hidden md:flex'>
                        <ChevronRight className='h-4 w-4 rotate-180' />
                    </Button>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => scrollRecentSection('right')}
                        className='hidden md:flex'>
                        <ChevronRight className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' asChild className='hidden items-center sm:flex'>
                        <Link href='/popular'>
                            View All
                            <ArrowRight className='ml-1 h-4 w-4' />
                        </Link>
                    </Button>
                </div>
            </div>

            <div
                ref={recentScrollRef}
                className='scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4'>
                {isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className='min-w-[300px] snap-start sm:min-w-[320px]'>
                              <ProfessorCard professor={professors[0]} isLoading={true} variant='detailed' />
                          </div>
                      ))
                    : professors.slice(0, visibleRecentCount).map((professor) => (
                          <div key={professor.id} className='min-w-[300px] snap-start sm:min-w-[320px]'>
                              <ProfessorCard professor={professor} variant='detailed' />
                          </div>
                      ))}
            </div>

            <div className='mt-4 flex justify-center'>
                <Button
                    variant='outline'
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading || visibleRecentCount >= professors.length}>
                    {loadMoreLoading ? 'Loading...' : 'Load More'}
                </Button>
            </div>
        </section>
    );
}
