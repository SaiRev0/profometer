'use client';

import { FC } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from './ui/button';
import { IoClose } from 'react-icons/io5';

const CloseModal: FC = () => {
  const router = useRouter();

  return (
    <Button variant='subtle' className='h-6 w-6 rounded-md p-0' onClick={() => router.back()}>
      <IoClose aria-label='close modal' className='h-4 w-4' />
    </Button>
  );
};

export default CloseModal;
