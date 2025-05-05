'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  interactive?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
}

export default function RatingStars({
  value,
  max = 5,
  size = 'md',
  color = 'text-yellow-400',
  interactive = false,
  onChange,
  showValue = false
}: RatingStarsProps) {
  const [rating, setRating] = useState(value);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(value);
  }, [value]);

  const handleClick = (index: number) => {
    if (!interactive) return;
    const newRating = index + 1;
    setRating(newRating);
    onChange && onChange(newRating);
  };

  const sizeStyles = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizeStyles[size];

  return (
    <div className='flex items-center'>
      <div className='flex items-center'>
        {[...Array(max)].map((_, index) => {
          const filled = interactive
            ? hoverRating
              ? index < hoverRating
              : index < rating
            : index < Math.floor(rating);
          const halfFilled = !interactive && !filled && index < rating;

          return (
            <button
              key={index}
              type='button'
              className={cn(
                'transition-transform focus:outline-none',
                interactive && 'hover:scale-110',
                !interactive && 'cursor-default'
              )}
              onClick={() => handleClick(index)}
              onMouseEnter={() => interactive && setHoverRating(index + 1)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              disabled={!interactive}>
              <Star
                className={cn(
                  starSize,
                  filled ? color : 'text-muted stroke-muted-foreground/50',
                  // For partial stars (non-interactive only)
                  halfFilled && 'text-gradient-to-r from-yellow-400 to-transparent'
                )}
                fill={filled ? 'currentColor' : 'transparent'}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className='ml-2 text-sm font-medium'>
          {interactive && hoverRating ? hoverRating.toFixed(0) : rating.toFixed(0)}
        </span>
      )}
    </div>
  );
}
