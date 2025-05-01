import Link from 'next/link';

import { Button } from '@/components/ui/button';
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NavigationProps } from '@/lib/types/navigation';

// import { cn } from '@/lib/utils';

import { Menu, Moon, Search, Sun } from 'lucide-react';

export function MobileMenu({ navItems, moreLinks, theme, onThemeToggle, onSearchClick }: NavigationProps) {
  return (
    <div className='flex items-center gap-2 md:hidden'>
      <Button variant='ghost' size='icon' className='md:hidden' onClick={onSearchClick}>
        <Search className='h-5 w-5' />
      </Button>

      <Button variant='ghost' size='icon' onClick={onThemeToggle} aria-label='Toggle theme'>
        {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
      </Button>

      {/* <Sheet>
                <SheetTrigger asChild>
                    <Button variant='ghost' size='icon'>
                        <Menu className='h-5 w-5' />
                        <span className='sr-only'>Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <nav className='mt-6 flex flex-col space-y-3'>
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href ?? ''}
                                className={cn(
                                    'rounded-md px-2 py-1 transition-colors',
                                    item.active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary'
                                )}>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet> */}
    </div>
  );
}
