import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Search } from 'lucide-react';

export default function DepartmentSkeleton() {
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
            <Skeleton className='mb-2 h-10 w-64' />
            <Skeleton className='h-6 w-32' />
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
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className='mb-2 flex items-center'>
                    <Skeleton className='mr-2 h-5 w-5' />
                    <Skeleton className='h-5 w-40' />
                  </div>
                  <Skeleton className='h-8 w-16' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className='my-8'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Skeleton className='h-10 w-full pl-9' />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className='mb-8'>
        <Tabs defaultValue='professors' className='mb-8'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='professors'>
              <Skeleton className='h-5 w-32' />
            </TabsTrigger>
            <TabsTrigger value='courses'>
              <Skeleton className='h-5 w-32' />
            </TabsTrigger>
          </TabsList>

          <TabsContent value='professors'>
            <Card>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className='min-w-[300px] snap-start sm:min-w-[320px]'>
                      <Card>
                        <CardContent className='p-4'>
                          <div className='flex gap-3'>
                            <Skeleton className='h-12 w-12 rounded-full' />
                            <div className='flex-1'>
                              <div className='flex items-start justify-between'>
                                <div>
                                  <Skeleton className='mb-2 h-5 w-32' />
                                  <Skeleton className='h-4 w-24' />
                                </div>
                                <Skeleton className='h-6 w-10' />
                              </div>
                              <div className='mt-2 flex items-center gap-1'>
                                {[...Array(5)].map((_, j) => (
                                  <Skeleton key={j} className='h-4 w-4 rounded-full' />
                                ))}
                                <Skeleton className='ml-2 h-3 w-8' />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
