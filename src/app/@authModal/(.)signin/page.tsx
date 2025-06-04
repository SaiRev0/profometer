import { FC } from 'react';

import Link from 'next/link';

import CloseModal from '@/components/CloseModal';
import UserAuthForm from '@/components/UserAuthForm';

import { GraduationCap } from 'lucide-react';

const page: FC = () => {
  return (
    <div className='bg-background/80 fixed inset-0 z-[1000]'>
      <div className='container mx-auto flex h-full max-w-lg items-center'>
        <div className='bg-card text-card-foreground relative h-fit w-full rounded-lg px-2 py-20 shadow-lg'>
          <div className='absolute top-4 right-4'>
            <CloseModal />
          </div>

          <div className='container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
            <div className='flex flex-col space-y-2 text-center'>
              <GraduationCap className='text-primary mx-auto my-[-0.5rem] h-14 w-14' />
              <h1 className='text-2xl font-semibold tracking-tight'>Welcome to ProfOMeter</h1>
              <p className='text-muted-foreground mx-auto max-w-xs text-sm'>
                By proceeding, you agree to our <br />
                <Link href='/' className='text-primary hover:text-primary/80 underline'>
                  User Agreement
                </Link>{' '}
                and{' '}
                <Link href='/' className='text-primary hover:text-primary/80 underline'>
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
