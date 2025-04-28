import { FC } from 'react';

import Link from 'next/link';

import CloseModal from '@/components/CloseModal';
import UserAuthForm from '@/components/UserAuthForm';

import { GraduationCap } from 'lucide-react';

const page: FC = () => {
  return (
    <div className='fixed inset-0 z-[1000] bg-zinc-900/20'>
      <div className='container mx-auto flex h-full max-w-lg items-center'>
        <div className='relative h-fit w-full rounded-lg bg-white px-2 py-20'>
          <div className='absolute top-4 right-4'>
            <CloseModal />
          </div>

          <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
            <div className='flex flex-col space-y-2 text-center'>
              <GraduationCap className='text-primary mx-auto my-[-0.5rem] h-14 w-14' />
              <h1 className='text-2xl font-semibold tracking-tight'>Welcome to RateThatProf</h1>
              <p className='mx-auto max-w-xs text-sm'>
                By proceeding, you agree to our <br />
                <Link href='/' className='underline'>
                  User Agreement
                </Link>{' '}
                and{' '}
                <Link href='/' className='underline'>
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
    </div>
  );
};

export default page;
