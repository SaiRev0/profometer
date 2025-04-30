'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDepartments } from '@/hooks/use-departments';
import { cn } from '@/lib/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  GitBranch,
  GitFork,
  History,
  Search,
  Shield,
  Star,
  User
} from 'lucide-react';

// Create a client
const queryClient = new QueryClient();

function BranchesPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);

  const { data: departments, isLoading } = useDepartments();

  const filteredDepartments =
    departments?.filter((dept) => dept.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const defaultDepartment = filteredDepartments.find((d) => d.isDefault);
  const otherDepartments = filteredDepartments.filter((d) => !d.isDefault);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className='mx-auto mt-4 max-w-5xl'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='flex items-center gap-2 text-3xl font-bold'>
              <GitBranch className='text-primary h-7 w-7' />
              Repository Branches
            </h1>
            <p className='text-muted-foreground mt-1'>View and manage repository branches</p>
          </div>

          <Button>
            <GitFork className='mr-2 h-4 w-4' />
            New Branch
          </Button>
        </div>

        <Card className='mb-6'>
          <CardContent className='p-4'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
              <Input
                type='search'
                placeholder='Find a branch...'
                className='pl-9'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-4'>
                    <Skeleton className='h-8 w-8 rounded-full' />
                    <div className='flex-1'>
                      <Skeleton className='mb-2 h-5 w-48' />
                      <Skeleton className='h-4 w-96' />
                    </div>
                    <Skeleton className='h-8 w-24' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredDepartments.length === 0 ? (
          <Card>
            <CardContent className='p-6 text-center'>
              <p className='text-muted-foreground'>No branches found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {/* Default Branch */}
            {defaultDepartment && (
              <Card className='border-primary/20 bg-primary/5'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full'>
                      <GitBranch className='text-primary h-4 w-4' />
                    </div>

                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <h3 className='truncate font-medium'>{defaultDepartment.name}</h3>
                        <Badge variant='secondary' className='shrink-0'>
                          Default
                        </Badge>
                        {defaultDepartment.isProtected && (
                          <Badge variant='outline' className='shrink-0'>
                            <Shield className='mr-1 h-3 w-3' />
                            Protected
                          </Badge>
                        )}
                      </div>

                      <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                        <span className='truncate'>{defaultDepartment.code}</span>
                        <span>•</span>
                        <span className='truncate'>{defaultDepartment.numProfessors} professors</span>
                        <span>•</span>
                        <span className='whitespace-nowrap'>{defaultDepartment.numReviews} reviews</span>
                      </div>
                    </div>

                    <div className='flex shrink-0 items-center gap-2'>
                      <Badge variant='outline'>{defaultDepartment.avgRating.toFixed(1)}</Badge>

                      <Button variant='outline' size='sm' asChild>
                        <Link href={`/branch/${defaultDepartment.name.toLowerCase().replace(/\s+/g, '-')}`}>
                          <ChevronRight className='h-4 w-4' />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Branches */}
            <div className='space-y-2'>
              {otherDepartments.map((dept) => (
                <Card key={dept.id} className='hover:bg-muted/50 transition-colors'>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-4'>
                      <div className='bg-secondary flex h-8 w-8 items-center justify-center rounded-full'>
                        <GitBranch className='h-4 w-4' />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='mb-1 flex items-center gap-2'>
                          <h3 className='truncate font-medium'>{dept.name}</h3>
                          {dept.isProtected && (
                            <Badge variant='outline' className='shrink-0'>
                              <Shield className='mr-1 h-3 w-3' />
                              Protected
                            </Badge>
                          )}
                        </div>

                        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                          <span className='truncate'>{dept.code}</span>
                          <span>•</span>
                          <span className='truncate'>{dept.numProfessors} professors</span>
                          <span>•</span>
                          <span className='whitespace-nowrap'>{dept.numReviews} reviews</span>
                        </div>
                      </div>

                      <div className='flex shrink-0 items-center gap-2'>
                        <Badge variant='outline'>{dept.avgRating.toFixed(1)}</Badge>

                        <Button variant='outline' size='sm' asChild>
                          <Link href={`/branch/${dept.name.toLowerCase().replace(/\s+/g, '-')}`}>
                            <ChevronRight className='h-4 w-4' />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Show More Button */}
            {!searchQuery && (
              <Button variant='outline' className='w-full' onClick={() => setShowMore(!showMore)}>
                <ChevronDown className={cn('mr-2 h-4 w-4 transition-transform', showMore && 'rotate-180')} />
                {showMore ? 'Show Less' : 'Show More Branches'}
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function BranchesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BranchesPageContent />
    </QueryClientProvider>
  );
}
