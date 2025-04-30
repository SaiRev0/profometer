import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Professor } from '@/lib/types';

import { BookOpen, Building, ClipboardList, ExternalLink, Mail } from 'lucide-react';

const SideBar = ({ professor }: { professor: Professor }) => {
  return (
    <div className='md:w-1/3'>
      <Card>
        <CardContent className='p-4'>
          {professor.photoUrl && (
            <div className='relative mb-4 h-48 w-full overflow-hidden rounded-lg'>
              <Image src={professor.photoUrl} alt={professor.name} fill className='object-cover' />
            </div>
          )}

          <h1 className='text-2xl font-bold'>{professor.name}</h1>
          <p className='text-muted-foreground mb-4'>{professor.department.name}</p>

          <div className='space-y-3'>
            <div className='flex items-start gap-2'>
              <Building className='text-muted-foreground mt-1 h-4 w-4' />
              <div>
                <p className='text-sm'>{professor.designation}</p>
              </div>
            </div>

            {professor.email && (
              <div className='flex items-start gap-2'>
                <Mail className='text-muted-foreground mt-1 h-4 w-4' />
                <div>
                  <a href={`mailto:${professor.email}`} className='text-primary text-sm hover:underline'>
                    {professor.email}
                  </a>
                </div>
              </div>
            )}

            {professor.website && (
              <div className='flex items-start gap-2'>
                <ExternalLink className='text-muted-foreground mt-1 h-4 w-4' />
                <div>
                  <a
                    href={professor.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary text-sm hover:underline'>
                    Faculty Website
                  </a>
                </div>
              </div>
            )}
          </div>

          <Separator className='my-4' />

          <div className='space-y-3'>
            <div className='flex items-start gap-2'>
              <BookOpen className='text-muted-foreground mt-1 h-4 w-4' />
              <div>
                <p className='text-sm font-medium'>Courses Taught</p>
                <p className='text-muted-foreground text-sm'>{professor.numCourses} courses</p>
              </div>
            </div>

            <div className='flex items-start gap-2'>
              <ClipboardList className='text-muted-foreground mt-1 h-4 w-4' />
              <div>
                <p className='text-sm font-medium'>Student Reviews</p>
                <p className='text-muted-foreground text-sm'>{professor.numReviews} reviews</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SideBar;
