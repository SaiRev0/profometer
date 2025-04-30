import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Professor } from '@/lib/types';

import { Building, ChevronLeft, ExternalLink, Mail } from 'lucide-react';

interface ProfessorHeaderProps {
  professor: Professor;
}

export default function ProfessorHeader({ professor }: ProfessorHeaderProps) {
  return (
    <div className='mb-6 flex items-center gap-2'>
      <Link href='/professors'>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <ChevronLeft className='h-4 w-4' />
        </Button>
      </Link>
      <div className='flex items-center gap-4'>
        <div className='relative h-16 w-16 overflow-hidden rounded-full'>
          {professor.photoUrl ? (
            <Image src={professor.photoUrl} alt={professor.name} fill className='object-cover' />
          ) : (
            <div className='bg-muted flex h-full w-full items-center justify-center'>
              <span className='text-muted-foreground text-2xl font-semibold'>{professor.name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div>
          <h1 className='text-2xl font-bold'>{professor.name}</h1>
          <div className='text-muted-foreground flex items-center gap-2'>
            <Building className='h-4 w-4' />
            <span>{typeof professor.department === 'string' ? professor.department : professor.department.name}</span>
            <span>•</span>
            <span>{professor.designation}</span>
          </div>
        </div>
      </div>
      <div className='ml-auto flex items-center gap-2'>
        {professor.email && (
          <Button variant='outline' size='sm' asChild>
            <a href={`mailto:${professor.email}`}>
              <Mail className='mr-2 h-4 w-4' />
              Contact
            </a>
          </Button>
        )}
        {professor.website && (
          <Button variant='outline' size='sm' asChild>
            <a href={professor.website} target='_blank' rel='noopener noreferrer'>
              <ExternalLink className='mr-2 h-4 w-4' />
              Website
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
