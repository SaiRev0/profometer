'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import ProfessorCard, { Professor } from '@/components/cards/professor-card';
import FilterDropdown, { FilterOption, SortOption } from '@/components/filters/filter-dropdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Pagination from '@/components/ui/pagination';
import RatingStars from '@/components/ui/rating-stars';
import { Separator } from '@/components/ui/separator';
import { useDepartments } from '@/hooks/use-departments';
import { useProfessors } from '@/hooks/use-professors';
import { Department } from '@/lib/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import { ArrowUpDown, BookCheck, BookOpen, BookmarkX, ChevronLeft, Filter, Star, Users } from 'lucide-react';

// Create a client
const queryClient = new QueryClient();

function BranchPageContent() {
  const params = useParams();
  const decodedName = decodeURIComponent(params.name as string);
  const [sortOption, setSortOption] = useState<SortOption>('rating-high');
  const [filters, setFilters] = useState<FilterOption>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  const { data: professorsData, isLoading: isLoadingProfessors } = useProfessors({
    page: currentPage,
    limit: pageSize,
    branch: decodedName,
    ...filters
  });

  const { data: departmentsData, isLoading: isLoadingDepartments } = useDepartments();

  const department = departmentsData?.find((d: Department) => d.name === decodedName);

  if (isLoadingProfessors || isLoadingDepartments) {
    return <div>Loading...</div>;
  }

  if (!professorsData || !department) {
    return <div>Branch not found</div>;
  }

  const { professors, total, totalPages } = professorsData;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Branch Overview Card */}
      <Card className='mb-6'>
        <CardHeader>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div>
              <CardTitle className='text-2xl'>
                <span className='flex items-center gap-2'>
                  <BookOpen className='text-primary h-5 w-5' />
                  {department.name}
                </span>
              </CardTitle>
              <CardDescription>
                {department.numProfessors} professors • {department.numReviews} reviews
              </CardDescription>
            </div>

            <div className='flex items-center gap-2'>
              <Badge
                className='px-3 py-1 text-lg'
                variant={
                  department.avgRating >= 4 ? 'default' : department.avgRating <= 3 ? 'destructive' : 'secondary'
                }>
                {department.avgRating.toFixed(1)}
              </Badge>
              <RatingStars value={department.avgRating} size='sm' />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
            <Card className='bg-primary/5 border-primary/20'>
              <CardContent className='p-4'>
                <div className='flex flex-col items-center text-center'>
                  <Users className='text-primary mb-2 h-6 w-6' />
                  <p className='text-sm font-medium'>Professors</p>
                  <p className='text-2xl font-bold'>{department.numProfessors}</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-chart-1/5 border-chart-1/20'>
              <CardContent className='p-4'>
                <div className='flex flex-col items-center text-center'>
                  <BookCheck className='text-chart-1 mb-2 h-6 w-6' />
                  <p className='text-sm font-medium'>Would Take Again</p>
                  <p className='text-2xl font-bold'>85%</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-chart-2/5 border-chart-2/20'>
              <CardContent className='p-4'>
                <div className='flex flex-col items-center text-center'>
                  <ArrowUpDown className='text-chart-2 mb-2 h-6 w-6' />
                  <p className='text-sm font-medium'>Difficulty</p>
                  <p className='text-2xl font-bold'>3.8</p>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-chart-3/5 border-chart-3/20'>
              <CardContent className='p-4'>
                <div className='flex flex-col items-center text-center'>
                  <BookmarkX className='text-chart-3 mb-2 h-6 w-6' />
                  <p className='text-sm font-medium'>Textbook Required</p>
                  <p className='text-2xl font-bold'>55%</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/*
          <p className='text-muted-foreground mb-6'>{department.description}</p> */}

          <Separator className='my-6' />
        </CardContent>
      </Card>

      {/* Professors List */}
      <div>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <h2 className='flex items-center gap-2 text-xl font-bold'>
            <Users className='text-primary h-5 w-5' />
            {department.name} Professors
          </h2>

          <FilterDropdown
            sortOption={sortOption}
            onSortChange={setSortOption}
            filters={filters}
            onFilterChange={setFilters}
            departments={[department.name]}
            variant='outline'
          />
        </div>

        {professors.length === 0 ? (
          <Card>
            <CardContent className='p-6 text-center'>
              <p className='text-muted-foreground mb-4'>No professors found with the selected filters.</p>
              <Button onClick={() => setFilters({})}>Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {professors.map((professor: Professor) => (
                <ProfessorCard key={professor.id} professor={professor} variant='detailed' />
              ))}
            </div>

            {totalPages > 1 && (
              <div className='mt-6 flex justify-center'>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function BranchPage() {
  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <div className='mb-6 flex items-center gap-2'>
        <Button variant='ghost' size='sm' className='gap-1' asChild>
          <Link href='/branches'>
            <ChevronLeft className='h-4 w-4' />
            All Branches
          </Link>
        </Button>
      </div>

      <QueryClientProvider client={queryClient}>
        <BranchPageContent />
      </QueryClientProvider>
    </div>
  );
}
