'use client';

import Link from 'next/link';

import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';

export default function BottomNavigation() {
  const { mobileNavItems } = useNavigation();

  return (
    <div className='bg-background border-border fixed right-0 bottom-0 left-0 z-40 h-16 border-t md:hidden'>
      <div className={`grid h-full grid-cols-3`}>
        {mobileNavItems.map((item) => (
          <div key={item.label} className='flex items-center justify-center'>
            <Link href={item.href ?? ''} className='flex h-full w-full flex-col items-center justify-center'>
              {item.icon && (
                <item.icon className={cn('mb-1 h-5 w-5', item.active ? 'text-primary' : 'text-muted-foreground')} />
              )}
              <span className={cn('text-xs', item.active ? 'text-primary font-medium' : 'text-muted-foreground')}>
                {item.label}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
