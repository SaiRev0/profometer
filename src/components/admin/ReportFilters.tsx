'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { REPORT_REASONS } from './ReasonBadge';
import { Filter, X } from 'lucide-react';

interface ReportFiltersProps {
  reason: string;
  // eslint-disable-next-line no-unused-vars
  onReasonChange: (reason: string) => void;
}

export function ReportFilters({ reason, onReasonChange }: ReportFiltersProps) {
  const activeFilters = reason !== 'all';

  const handleClearFilters = () => {
    onReasonChange('all');
  };

  return (
    <div className='bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg border p-3'>
      <div className='flex items-center gap-2'>
        <Filter className='text-muted-foreground h-4 w-4' />
        <label htmlFor='reason-filter' className='text-sm font-medium'>
          Filter:
        </label>
      </div>
      <Select value={reason} onValueChange={onReasonChange}>
        <SelectTrigger id='reason-filter' className='bg-background h-9 w-40 font-medium'>
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
      {activeFilters && (
        <Button
          variant='ghost'
          size='sm'
          onClick={handleClearFilters}
          className='h-9 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300'>
          <X className='h-3.5 w-3.5' />
          Clear
        </Button>
      )}
    </div>
  );
}
