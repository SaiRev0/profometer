'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';

const SignInClient = () => {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: 'Access Denied',
        description: 'Use Your College ID to Sign Up'
      });
    }
  }, []);

  return null;
};

export default SignInClient;
