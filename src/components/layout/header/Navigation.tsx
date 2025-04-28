import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { NavigationProps } from '@/lib/types/navigation';

import { Moon, Sun } from 'lucide-react';

export function Navigation({ navItems, theme, onThemeToggle }: NavigationProps) {
    console.log(navItems);
    return (
        <div className='hidden items-center gap-4 sm:flex'>
            <NavigationMenu>
                <NavigationMenuList>
                    {navItems.map((item) => (
                        <NavigationMenuItem key={item.label}>
                            <Link href={item.href ?? ''} passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()} active={item.active}>
                                    {item.label}
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>

            <Button variant='ghost' size='icon' onClick={onThemeToggle} aria-label='Toggle theme'>
                {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
            </Button>
        </div>
    );
}
