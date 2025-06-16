'use client';

import { ProgressProvider } from '@bprogress/next/app';

export default function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider height='4px' color='#3a81f5' options={{ showSpinner: true }} shallowRouting>
      {children}
    </ProgressProvider>
  );
}
