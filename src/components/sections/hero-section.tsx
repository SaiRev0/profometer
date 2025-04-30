'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// Mock branches for search filters
const searchBranches = [
  'Computer Science',
  'Business',
  'Engineering',
  'Psychology',
  'Arts',
  'Medicine',
  'Law',
  'Education',
  'Mathematics',
  'Physics'
];

interface HeroSectionProps {
  onSearch: (query: string, branch: string | null) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery, selectedBranch);
    }
  };

  return (
    <section className='from-primary/10 to-background relative overflow-hidden rounded-xl bg-gradient-to-b p-6 md:p-10'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mx-auto max-w-3xl text-center'>
        <h1 className='mb-4 text-3xl font-bold md:text-4xl lg:text-5xl'>Find & Rate Your Professors</h1>
        <p className='text-muted-foreground mx-auto mb-8 max-w-xl text-lg'>
          Make informed decisions about your education with real student reviews and ratings for professors across
          universities.
        </p>

        <form onSubmit={handleSearch} className='relative mx-auto mb-6 max-w-2xl'>
          <div className='relative flex items-center'>
            <Search className='text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform' />
            <Input
              type='search'
              placeholder='Search by professor name, department, or university...'
              className='border-primary/20 focus-visible:ring-primary w-full rounded-full py-6 pr-24 pl-12 text-lg'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type='submit'
              size='lg'
              className='absolute top-1/2 right-1.5 -translate-y-1/2 transform rounded-full px-6'>
              Search
            </Button>
          </div>
        </form>

        <div className='flex flex-wrap justify-center gap-2'>
          {searchBranches.map((branch) => (
            <Button
              key={branch}
              variant={selectedBranch === branch ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedBranch(selectedBranch === branch ? null : branch)}
              className={cn(
                'rounded-full transition-colors',
                selectedBranch === branch && 'bg-primary text-primary-foreground'
              )}>
              {branch}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Abstract decorative elements */}
      <div className='bg-primary/5 absolute top-10 right-10 h-20 w-20 rounded-full blur-2xl' />
      <div className='bg-primary/10 absolute bottom-10 left-10 h-32 w-32 rounded-full blur-3xl' />
    </section>
  );
}
