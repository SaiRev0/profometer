'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { REPORT_REASONS } from './ReasonBadge';
import { Filter, X } from 'lucide-react';

interface ReportFiltersProps {
  reason: string;
  onReasonChange: (reason: string) => void;
}

export function ReportFilters({ reason, onReasonChange }: ReportFiltersProps) {
  const activeFilters = reason !== 'all';
  const activeFilterCount = activeFilters ? 1 : 0;

  const handleClearFilters = () => {
    onReasonChange('all');
  };

  return (
    <div className='flex flex-col gap-4 rounded-lg border-2 bg-linear-to-r from-slate-50 to-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:from-slate-900 dark:to-slate-800'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
            <Filter className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </div>
          <label htmlFor='reason-filter' className='text-sm font-semibold'>
            Filter by reason:
          </label>
        </div>
        <Select value={reason} onValueChange={onReasonChange}>
          <SelectTrigger
            id='reason-filter'
            className='w-50 border-2 bg-white font-medium shadow-sm transition-all hover:border-blue-300 dark:bg-slate-950 dark:hover:border-blue-700'>
            <SelectValue placeholder='All Reasons' />
          </SelectTrigger>
          <SelectContent>
            {REPORT_REASONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className='font-medium'>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center gap-3'>
        {activeFilters && (
          <>
            <Badge variant='secondary' className='gap-1 px-3 py-1'>
              <span className='text-xs font-semibold'>{activeFilterCount} Active Filter</span>
            </Badge>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClearFilters}
              className='gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300'>
              <X className='h-4 w-4' />
              Clear
            </Button>
          </>
        )}
        {!activeFilters && (
          <Badge variant='outline' className='gap-1 px-3 py-1'>
            <span className='text-xs font-medium'>No Filters Applied</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
