'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { useConfirmUsername } from '@/hooks/useConfirmUsername';
import { useGenerateUsername } from '@/hooks/useGenerateUsername';
import { AlertTriangle, Check, RefreshCw, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function SetupUsernamePage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [displayUsername, setDisplayUsername] = useState<string>('');
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [useHyphens, setUseHyphens] = useState<boolean>(false);
  const [noSeparator, setNoSeparator] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  // Generate username hook - always enabled on this page
  const { username: generatedUsername, isLoading: isGenerating, refetch: generateNext } = useGenerateUsername(
    true,
    includeNumbers,
    useHyphens,
    noSeparator
  );

  // Confirm username hook
  const { confirmUsername, isLoading: isConfirming } = useConfirmUsername();

  // Check if user needs username setup
  useEffect(() => {
    if (status === 'loading') return;

    // If not authenticated, redirect to sign in
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    // If user already has username set, redirect to home
    if (session?.user?.usernameSetAt) {
      router.push('/');
      return;
    }

    // If user has a username but hasn't confirmed it, use it as default
    if (session?.user?.username) {
      setDisplayUsername(session.user.username);
    }
  }, [status, session, router]);

  // Update display username when generated
  useEffect(() => {
    if (generatedUsername) {
      setDisplayUsername(generatedUsername);
    }
  }, [generatedUsername]);

  const handleGenerateNext = useCallback(async () => {
    try {
      const result = await generateNext();
      if (result.data?.username) {
        setDisplayUsername(result.data.username);
      } else {
        toast.error('Failed to generate username');
      }
    } catch (error) {
      toast.error('Failed to generate username');
    }
  }, [generateNext]);

  // Regenerate username when options change
  useEffect(() => {
    // Skip on initial mount - let the normal flow handle it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Regenerate when options change
    generateNext();
    // Only include the option states in dependencies, not displayUsername or generateNext
  }, [includeNumbers, useHyphens, noSeparator]);

  const handleConfirmUsername = async () => {
    if (!displayUsername) {
      toast.error('No username to confirm');
      return;
    }

    try {
      const data = await confirmUsername({ username: displayUsername });

      if (data.success) {
        toast.success('Username confirmed successfully!');
        // Update the session to reflect the new usernameSetAt value
        await update();
        // Small delay to ensure session is updated
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Redirect to home page after successful confirmation
        window.location.href = '/';
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to confirm username');
    }
  };

  // Show loading while checking session or generating initial username
  if (status === 'loading' || (isGenerating && !displayUsername)) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl'>Setting Up Your Account</CardTitle>
            <CardDescription>Please wait while we generate your username...</CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center py-8'>
            <RefreshCw className='text-muted-foreground h-8 w-8 animate-spin' />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
            <User className='text-primary h-6 w-6' />
          </div>
          <CardTitle className='text-2xl'>Choose Your Username</CardTitle>
          <CardDescription>This is how you&apos;ll appear to others on ProfOMeter</CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Username Display */}
          <div className='text-center'>
            <div className='bg-muted flex items-center justify-center rounded-lg px-4 py-4 mx-auto max-w-full'>
              <span className='text-primary text-xl sm:text-2xl font-bold break-all'>@{displayUsername}</span>
            </div>
          </div>

          {/* Username Options */}
          <div className='space-y-3 border rounded-lg p-4'>
            <div className='text-sm font-medium mb-3'>Username Options</div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='includeNumbers'
                checked={includeNumbers}
                onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
                disabled={isGenerating || isConfirming}
              />
              <Label
                htmlFor='includeNumbers'
                className='text-sm font-normal cursor-pointer'>
                Include numbers (e.g., user123)
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='useHyphens'
                checked={useHyphens}
                onCheckedChange={(checked) => {
                  setUseHyphens(checked as boolean);
                  if (checked) setNoSeparator(false);
                }}
                disabled={isGenerating || isConfirming || noSeparator}
              />
              <Label
                htmlFor='useHyphens'
                className='text-sm font-normal cursor-pointer'>
                Use hyphens instead of underscores (e.g., cool-user)
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='noSeparator'
                checked={noSeparator}
                onCheckedChange={(checked) => {
                  setNoSeparator(checked as boolean);
                  if (checked) setUseHyphens(false);
                }}
                disabled={isGenerating || isConfirming}
              />
              <Label
                htmlFor='noSeparator'
                className='text-sm font-normal cursor-pointer'>
                No separators (e.g., cooluser)
              </Label>
            </div>
          </div>

          {/* Buttons */}
          <div className='flex flex-col gap-3'>
            <Button
              variant='outline'
              onClick={handleGenerateNext}
              disabled={isGenerating || isConfirming}
              className='w-full'>
              {isGenerating ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Generate Next
                </>
              )}
            </Button>

            <Button
              onClick={handleConfirmUsername}
              disabled={isGenerating || isConfirming || !displayUsername}
              className='w-full'>
              {isConfirming ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Confirming...
                </>
              ) : (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Confirm Username
                </>
              )}
            </Button>
          </div>

          {/* Warning Notice */}
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500' />
              <div className='text-sm text-amber-800 dark:text-amber-200'>
                <p className='font-medium'>Important</p>
                <p className='mt-1'>
                  Once confirmed, your username cannot be changed. Custom usernames will be available in a future
                  update.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
