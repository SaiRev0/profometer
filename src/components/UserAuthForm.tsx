'use client';

import * as React from 'react';
import { FC } from 'react';

import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@mantine/hooks';

import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [signInUrl, _, removeSignInUrl] = useLocalStorage<string>({
    key: 'redirectURLfromSignIn',
    defaultValue: '/'
  });

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn('google', { callbackUrl: signInUrl });
    } catch (error) {
      toast.error('Error', {
        description: 'There was an error logging in with Google'
      });
    } finally {
      setIsLoading(false);
      removeSignInUrl();
    }
  };

  return (
    <div className={cn('flex justify-center', className)} {...props}>
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
