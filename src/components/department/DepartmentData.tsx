'use client';

import { useCallback, useState } from 'react';

import CourseCard from '@/components/cards/CourseCard';
import ProfessorCard from '@/components/cards/ProfessorCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { Department } from '@/lib/types';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function DepartmentData({ department }: { department: Department }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 100);
  const [activeTab, setActiveTab] = useState<'professors' | 'courses'>('professors');

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  // Filter professors and courses based on search term
  const filteredProfessors =
    (department?.professors ?? []).filter((professor) => {
      const searchLower = debouncedSearch.toLowerCase();
      return professor.name.toLowerCase().includes(searchLower) || professor.email.toLowerCase().includes(searchLower);
    }) ?? [];

  const filteredCourses =
    (department?.courses ?? []).filter((course) => {
      const searchLower = debouncedSearch.toLowerCase();
      return course.name.toLowerCase().includes(searchLower) || course.code.toLowerCase().includes(searchLower);
    }) ?? [];

  return (
    <>
      <div className='my-8'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search professors or courses...'
            value={search}
            onChange={handleSearch}
            className='pl-9'
          />
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as 'professors' | 'courses');
          setSearch(''); // Clear search when changing tabs
        }}
        className='mb-8'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='professors'>Professors ({filteredProfessors.length})</TabsTrigger>
          <TabsTrigger value='courses'>Courses ({filteredCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value='professors'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {filteredProfessors.map((professor) => (
                    <div key={professor.id} className='min-w-[280px] snap-start sm:min-w-[280px]'>
                      <ProfessorCard professor={professor} variant='compact' />
                    </div>
                  ))}
                  {filteredProfessors.length === 0 && (
                    <p className='text-muted-foreground text-center'>
                      {search ? 'No professors found matching your search' : 'No professors found'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='courses'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <Card>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {filteredCourses.map((course) => (
                    <div key={course.code} className='min-w-[280px] snap-start sm:min-w-[280px]'>
                      <CourseCard course={course} variant='compact' />
                    </div>
                  ))}
                  {filteredCourses.length === 0 && (
                    <p className='text-muted-foreground col-span-full text-center'>
                      {search ? 'No courses found matching your search' : 'No courses found'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </>
  );
}
