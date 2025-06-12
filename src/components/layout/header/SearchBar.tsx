import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ChevronDown, Search } from 'lucide-react';

interface SearchBarProps {
  onSearchClick: () => void;
}

export function SearchBar({ onSearchClick }: SearchBarProps) {
  return (
    <div className='mx-4 hidden w-full max-w-xl sm:flex'>
      <div className='relative flex w-full gap-2'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
          <Input
            type='search'
            placeholder='Search for professors, courses, departments...'
            className='focus-visible:ring-primary w-full border-2 pr-4 pl-10'
            onClick={onSearchClick}
          />
        </div>
        {/* <Button variant='outline' className='flex items-center gap-2' onClick={onSearchClick}>
          {selectedBranch}
          <ChevronDown className='text-muted-foreground h-4 w-4' />
        </Button> */}
      </div>
    </div>
  );
}
