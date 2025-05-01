'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { BookOpen, BookmarkCheck, Check, Clock, SlidersHorizontal, SortAsc, SortDesc, Star } from 'lucide-react';

export type SortOption = 'rating-high' | 'rating-low' | 'reviews' | 'recent' | 'name-asc' | 'name-desc';

export type FilterOption = {
  department?: string;
  minRating?: number;
  maxRating?: number;
  courseLevel?: string;
};

interface FilterDropdownProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  filters?: FilterOption;
  onFilterChange?: (filters: FilterOption) => void;
  departments?: string[];
  variant?: 'default' | 'outline';
  showActiveFilters?: boolean;
  className?: string;
}

export default function FilterDropdown({
  sortOption,
  onSortChange,
  filters = {},
  onFilterChange,
  departments = [],
  variant = 'default',
  showActiveFilters = true,
  className
}: FilterDropdownProps) {
  const [activeFilters, setActiveFilters] = useState<FilterOption>(filters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'rating-high', label: 'Highest Rated', icon: <Star className='mr-2 h-4 w-4' /> },
    { value: 'rating-low', label: 'Lowest Rated', icon: <Star className='mr-2 h-4 w-4' /> },
    { value: 'reviews', label: 'Most Reviews', icon: <BookmarkCheck className='mr-2 h-4 w-4' /> },
    { value: 'recent', label: 'Most Recent', icon: <Clock className='mr-2 h-4 w-4' /> },
    { value: 'name-asc', label: 'Name (A-Z)', icon: <SortAsc className='mr-2 h-4 w-4' /> },
    { value: 'name-desc', label: 'Name (Z-A)', icon: <SortDesc className='mr-2 h-4 w-4' /> }
  ];

  const getSortLabel = (value: SortOption) => {
    return sortOptions.find((option) => option.value === value)?.label || 'Sort By';
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.department) count++;
    if (activeFilters.minRating) count++;
    if (activeFilters.courseLevel) count++;
    return count;
  };

  const handleFilterApply = () => {
    if (onFilterChange) {
      onFilterChange(activeFilters);
    }
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    const emptyFilters: FilterOption = {};
    setActiveFilters(emptyFilters);
    if (onFilterChange) {
      onFilterChange(emptyFilters);
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size='sm' className='gap-1'>
            <SortAsc className='mr-1 h-4 w-4' />
            {getSortLabel(sortOption)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='start'>
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className='cursor-pointer'>
                {option.icon}
                <span>{option.label}</span>
                {sortOption === option.value && <Check className='ml-auto h-4 w-4' />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {onFilterChange && (
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant={variant} size='sm' className='gap-1'>
              <SlidersHorizontal className='mr-1 h-4 w-4' />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant='secondary' className='ml-1 rounded-full px-1.5 py-0 text-xs'>
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80' align='start'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <h4 className='leading-none font-medium'>Filters</h4>
                <p className='text-muted-foreground text-sm'>Refine results by applying filters.</p>
              </div>

              <div className='grid gap-2'>
                <div className='grid gap-1'>
                  <label className='text-sm font-medium'>Department</label>
                  <Select
                    value={activeFilters.department || ''}
                    onValueChange={(value) => setActiveFilters({ ...activeFilters, department: value || undefined })}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Departments' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid gap-1'>
                  <label className='text-sm font-medium'>Minimum Rating</label>
                  <Select
                    value={activeFilters.minRating?.toString() || ''}
                    onValueChange={(value) =>
                      setActiveFilters({ ...activeFilters, minRating: value ? Number(value) : undefined })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder='Any Rating' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>Any Rating</SelectItem>
                      <SelectItem value='4'>4+ Stars</SelectItem>
                      <SelectItem value='3'>3+ Stars</SelectItem>
                      <SelectItem value='2'>2+ Stars</SelectItem>
                      <SelectItem value='1'>1+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid gap-1'>
                  <label className='text-sm font-medium'>Course Level</label>
                  <Select
                    value={activeFilters.courseLevel || ''}
                    onValueChange={(value) => setActiveFilters({ ...activeFilters, courseLevel: value || undefined })}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Levels' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>All Levels</SelectItem>
                      <SelectItem value='100'>100 Level (Introductory)</SelectItem>
                      <SelectItem value='200'>200 Level</SelectItem>
                      <SelectItem value='300'>300 Level</SelectItem>
                      <SelectItem value='400'>400 Level (Advanced)</SelectItem>
                      <SelectItem value='graduate'>Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant='outline' size='sm' onClick={resetFilters} disabled={activeFilterCount === 0}>
                  Reset
                </Button>
                <Button size='sm' onClick={handleFilterApply}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {showActiveFilters && activeFilterCount > 0 && (
        <div className='mt-1 flex flex-wrap gap-1.5 sm:mt-0'>
          {activeFilters.department && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1'
              onClick={() => {
                setActiveFilters({ ...activeFilters, department: undefined });
                if (onFilterChange) {
                  onFilterChange({ ...activeFilters, department: undefined });
                }
              }}>
              <BookOpen className='h-3 w-3' />
              {activeFilters.department}
              <button className='ml-1 text-xs'>&times;</button>
            </Badge>
          )}

          {activeFilters.minRating && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1'
              onClick={() => {
                setActiveFilters({ ...activeFilters, minRating: undefined });
                if (onFilterChange) {
                  onFilterChange({ ...activeFilters, minRating: undefined });
                }
              }}>
              <Star className='h-3 w-3' />
              {activeFilters.minRating}+ stars
              <button className='ml-1 text-xs'>&times;</button>
            </Badge>
          )}

          <Button variant='ghost' size='sm' className='h-6 px-2 text-xs' onClick={resetFilters}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
