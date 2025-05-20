'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

import DepartmentSkeleton from '@/app/department/_UI/DepartmentSkeleton';
import CourseCard from '@/components/cards/CourseCard';
import ProfessorCard from '@/components/cards/ProfessorCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounce } from '@/hooks/use-debounce';
import { useGetDepartmentByCode } from '@/hooks/useGetDepartmentByCode';

import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Search, Star, Users } from 'lucide-react';

export default function DepartmentPage() {
  const params = useParams();
  const code = params.code as string;
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 100);
  const [activeTab, setActiveTab] = useState<'professors' | 'courses'>('professors');

  const { data: department, isLoading, error } = useGetDepartmentByCode({ code });

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  if (error) {
    if (error.message === 'Department not found') {
      notFound();
    }
    throw error;
  }

  if (isLoading || !department) {
    return <DepartmentSkeleton />;
  }

  // Filter professors and courses based on search term
  const filteredProfessors =
    department?.professors.filter((professor) => {
      const searchLower = debouncedSearch.toLowerCase();
      return professor.name.toLowerCase().includes(searchLower) || professor.email.toLowerCase().includes(searchLower);
    }) ?? [];

  const filteredCourses =
    department?.courses.filter((course) => {
      const searchLower = debouncedSearch.toLowerCase();
      return course.name.toLowerCase().includes(searchLower) || course.code.toLowerCase().includes(searchLower);
    }) ?? [];

  return (
    <div className='container mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mb-8'>
        <Button variant='ghost' size='sm' className='mb-4' asChild>
          <Link href='/department' className='flex items-center'>
            <ChevronLeft className='mr-1 h-4 w-4' />
            Back to Departments
          </Link>
        </Button>

        <div className='flex items-start justify-between'>
          <div>
            <h1 className='mb-2 text-4xl font-bold'>{department.name}</h1>
            <p className='text-muted-foreground text-lg'>{department.code}</p>
          </div>
          <div className='bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full'>
            <BookOpen className='h-8 w-8' />
          </div>
        </div>
      </motion.div>

      {/* Department Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className='mt-8'>
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <div>
                <div className='mb-2 flex items-center'>
                  <Users className='text-primary mr-2 h-5 w-5' />
                  <span className='font-medium'>Number of Professors</span>
                </div>
                <p className='text-2xl font-bold'>{department._count.professors}</p>
              </div>
              <div>
                <div className='mb-2 flex items-center'>
                  <BookOpen className='text-primary mr-2 h-5 w-5' />
                  <span className='font-medium'>Number of Courses</span>
                </div>
                <p className='text-2xl font-bold'>{department._count.courses}</p>
              </div>
              <div>
                <div className='mb-2 flex items-center'>
                  <Star className='mr-2 h-5 w-5 text-amber-500' />
                  <span className='font-medium'>Average Rating</span>
                </div>
                <p className='text-2xl font-bold'>{department.avgRating}/5.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
                    <div key={professor.id} className='min-w-[250px] snap-start sm:min-w-[320px]'>
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
                    <div key={course.code} className='min-w-[250px] snap-start sm:min-w-[320px]'>
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
    </div>
  );
}
