'use client';

import * as React from 'react';
import { FC, Suspense, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { type AuthError, authErrorMessages } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@mantine/hooks';

import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

// Separate component for search params logic
const SearchParamsHandler: FC = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;

    const errorType = error as AuthError['type'];
    if (errorType in authErrorMessages) {
      // Use setTimeout to ensure the toast is shown after the component is mounted
      setTimeout(() => {
        toast.error(authErrorMessages[errorType]);
      }, 0);
    } else {
      setTimeout(() => {
        toast.error(authErrorMessages.Unknown);
      }, 0);
    }
  }, [searchParams]);

  return null;
};

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const [signInUrl, _, removeSignInUrl] = useLocalStorage<string>({
    key: 'redirectURLfromSignIn',
    defaultValue: '/'
  });

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      const result = await signIn('google', {
        callbackUrl: signInUrl,
        redirect: false
      });

      if (result?.error) {
        const errorType = result.error as AuthError['type'];
        if (errorType in authErrorMessages) {
          toast.error(authErrorMessages[errorType]);
        } else {
          toast.error(authErrorMessages.Unknown);
        }
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      toast.error(authErrorMessages.Unknown);
    } finally {
      setIsLoading(false);
      removeSignInUrl();
    }
  };

  return (
    <div className={cn('flex justify-center', className)} {...props}>
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <Button
        isLoading={isLoading}
        type='button'
        size='sm'
        className='w-full'
        onClick={loginWithGoogle}
        disabled={isLoading}>
        {isLoading ? null : <Icons.google className='mr-2 h-4 w-4' />}
        Google
      </Button>
    </div>
  );
};

export default UserAuthForm;
