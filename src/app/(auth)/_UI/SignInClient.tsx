'use client';

import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { useToast } from '@/hooks/use-toast';

const SignInClient = () => {
  const { toast } = useToast();
  const productID = useSearchParams().get('error');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (productID) {
      timeoutId = setTimeout(() => {
        toast({
          title: 'Access Denied',
          description: 'Use Your College ID to Sign Up'
        });
      }, 100);
    }

    // Clear the timeout if the component unmounts or productID changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [productID]);

  return null; // This component doesn't render anything
};

export default SignInClient;
