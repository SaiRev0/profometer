'use client';

import Link from 'next/link';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';

export default function BottomNavigation() {
    const { mobileNavItems, moreLinks } = useNavigation();

    return (
        <div className='bg-background border-border fixed right-0 bottom-0 left-0 z-40 h-16 border-t md:hidden'>
            <div className={`grid h-full grid-cols-${mobileNavItems.length}`}>
                {mobileNavItems.map((item) => (
                    <div key={item.label} className='flex items-center justify-center'>
                        {/* {item.sheet ? (
                            <Sheet>
                                <SheetTrigger className='flex h-full w-full flex-col items-center justify-center'>
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                'mb-1 h-5 w-5',
                                                item.active ? 'text-primary' : 'text-muted-foreground'
                                            )}
                                        />
                                    )}
                                    <span className='text-xs'>{item.label}</span>
                                </SheetTrigger>
                                <SheetContent side='bottom' className='h-80'>
                                    <SheetHeader>
                                        <SheetTitle>More Options</SheetTitle>
                                    </SheetHeader>
                                    <div className='mt-6 grid grid-cols-2 gap-4'>
                                        {moreLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className='border-border hover:bg-secondary flex flex-col items-center justify-center rounded-lg border p-4 transition-colors'>
                                                <span className='mt-2 text-sm font-medium'>{link.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : ( */}
                        <Link
                            href={item.href ?? ''}
                            className='flex h-full w-full flex-col items-center justify-center'>
                            {item.icon && (
                                <item.icon
                                    className={cn(
                                        'mb-1 h-5 w-5',
                                        item.active ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                />
                            )}
                            <span
                                className={cn(
                                    'text-xs',
                                    item.active ? 'text-primary font-medium' : 'text-muted-foreground'
                                )}>
                                {item.label}
                            </span>
                        </Link>
                        {/* )} */}
                    </div>
                ))}
            </div>
        </div>
    );
}
