'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Check, ChevronsUpDown } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  searchLabel?: string; // Optional additional text for search
}

export interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode; // For additional content like "Add New" button
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  className,
  isLoading = false,
  disabled = false,
  triggerClassName,
  contentClassName,
  children
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} modal={true} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn('w-full justify-between', triggerClassName, className)}>
          <span className='truncate'>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('p-0', contentClassName)}
        align='start'
        side='bottom'
        sideOffset={5}
        collisionPadding={{ left: 16, right: 16, bottom: 16 }}
        avoidCollisions={false}
        sticky='always'
        style={{ width: 'var(--radix-popover-trigger-width)', maxWidth: 'calc(100vw - 2rem)' }}>
        <Command className='max-h-[min(300px,50vh)] overflow-hidden'>
          <CommandInput placeholder={searchPlaceholder} className='h-9' />
          {children && <div className='border-b p-2'>{children}</div>}
          <CommandList className='max-h-[min(200px,40vh)] overflow-y-auto'>
            {isLoading ? (
              <div className='text-muted-foreground p-2 text-center text-sm'>Loading...</div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.searchLabel || option.label}
                      onSelect={() => {
                        onValueChange(option.value === value ? '' : option.value);
                        setOpen(false);
                      }}>
                      <span className='flex-1 truncate'>{option.label}</span>
                      <Check
                        className={cn('ml-2 h-4 w-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
