'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Department } from '@/lib/types';

import DepartmentData from './DepartmentData';
import DepartmentOverview from './DepartmentOverview';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft } from 'lucide-react';

export default function DepartmentDetails({ department }: { department: Department }) {
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
          <div className='bg-primary/10 text-primary flex aspect-square h-16 items-center justify-center rounded-full'>
            <BookOpen className='h-8 w-8' />
          </div>
        </div>
      </motion.div>

      {/* Department Stats */}
      <DepartmentOverview department={department} />

      <DepartmentData department={department} />
    </div>
  );
}
