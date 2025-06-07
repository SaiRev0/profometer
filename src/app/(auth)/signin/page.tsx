import type { Metadata } from 'next';
import Link from 'next/link';

import UserAuthForm from '@/components/UserAuthForm';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { GraduationCap } from 'lucide-react';
import { FaChevronLeft } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Sign In | ProfOMeter'
};

export default function Page() {
  return (
    <div className='mt-20'>
      <div className='mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-12'>
        <Link href='/' className={cn(buttonVariants({ variant: 'ghost' }), '-mt-20 self-start')}>
          <FaChevronLeft className='mr-2 h-4 w-4' />
          Home
        </Link>
        <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <GraduationCap className='text-primary mx-auto my-[-0.5rem] h-14 w-14' />
            <h1 className='text-2xl font-semibold tracking-tight'>Welcome to ProfOMeter</h1>
            <p className='mx-auto max-w-xs text-sm'>
              By proceeding, you agree to our <br />
              <Link href='/terms' className='underline'>
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href='/privacy' className='underline'>
                Privacy Policy
              </Link>
              .
            </p>
            <p className='text-palette-primary mx-auto max-w-xs text-lg font-semibold'>
              Use Your IITBHU Google ID to Sign In
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
