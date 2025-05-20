'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Department } from '@/lib/types';

import { motion } from 'framer-motion';
import { BookOpen, Star, Users } from 'lucide-react';

export default function DepartmentOverview({ department }: { department: Department }) {
  return (
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
              <p className='text-2xl font-bold'>{department._count?.professors ?? 0}</p>
            </div>
            <div>
              <div className='mb-2 flex items-center'>
                <BookOpen className='text-primary mr-2 h-5 w-5' />
                <span className='font-medium'>Number of Courses</span>
              </div>
              <p className='text-2xl font-bold'>{department._count?.courses ?? 0}</p>
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
  );
}
