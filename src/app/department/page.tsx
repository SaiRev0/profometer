'use client';

import React, { useState } from 'react';

import { DepartmentCard } from '@/components/cards/DepartmentCard';
import { Input } from '@/components/ui/input';
import { useGetDepartments } from '@/hooks/useGetDepartments';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  avgRating: number;
  numProfessors: number;
  numCourses: number;
  numReviews: number;
}

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: departments = [], isLoading } = useGetDepartments();

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-success';
    if (rating >= 4.0) return 'bg-primary';
    if (rating >= 3.5) return 'bg-amber-500';
    if (rating >= 3.0) return 'bg-orange-500';
    return 'bg-error';
  };

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>Loading departments...</div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='mb-8'>
        <h1 className='mb-4 text-4xl font-bold'>Departments</h1>
        <p className='text-muted-foreground'>Explore and rate professors from different departments at IIT BHU</p>
      </motion.div>

      <div className='relative mb-8'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          type='text'
          placeholder='Search departments...'
          className='pl-10'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {filteredDepartments.map((department: Department, index: number) => (
          <DepartmentCard key={department.code} department={department} index={index} />
        ))}
      </div>
    </div>
  );
}
