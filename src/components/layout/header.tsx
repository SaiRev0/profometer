'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { ChevronDown, Menu, Moon, School, Search, Sun } from 'lucide-react';

// Mock search results
const mockSearchResults = {
    professors: [
        { id: 'prof-1', name: 'Dr. Sarah Johnson', department: 'Computer Science' },
        { id: 'prof-2', name: 'Prof. Michael Williams', department: 'Engineering' },
        { id: 'prof-3', name: 'Dr. Emily Chen', department: 'Physics' }
    ],
    branches: [
        { id: 'cs', name: 'Computer Science', professors: 48 },
        { id: 'eng', name: 'Engineering', professors: 62 },
        { id: 'bus', name: 'Business', professors: 45 }
    ],
    popular: ['Machine Learning', 'Data Structures', 'Web Development', 'Artificial Intelligence']
};

export default function Header() {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('All Branches');

    // Monitor scroll position for header styling
    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navigation links for both desktop and mobile
    const navLinks = [
        { href: '/', label: 'Home', active: pathname === '/' },
        { href: '/popular', label: 'Popular Professors', active: pathname === '/popular' },
        { href: '/signin', label: 'Sign In', active: pathname === '/signin'},
        { href: '/branches', label: 'Branches', active: pathname === '/branches' || pathname.startsWith('/branch/') },
        { href: '/about', label: 'About', active: pathname === '/about' }
    ];

    if (!mounted) {
        return (
            <header className='bg-background border-border fixed top-0 right-0 left-0 z-50 h-16 border-b'>
                <div className='container mx-auto flex h-full items-center justify-between px-4'>
                    <div className='flex items-center gap-2'>
                        <School className='h-6 w-6' />
                        <span className='text-lg font-bold'>RateThatProf</span>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 right-0 left-0 z-50 h-16 transition-all duration-200',
                    isScrolled
                        ? 'bg-background/95 border-border border-b shadow-sm backdrop-blur-md'
                        : 'bg-background border-border/50 border-b'
                )}>
                <div className='container mx-auto flex h-full items-center justify-between px-4'>
                    <div className='flex items-center gap-2'>
                        <Link href='/' className='flex items-center gap-2'>
                            <School className='text-primary h-6 w-6' />
                            <span className='hidden text-lg font-bold sm:inline'>RateThatProf</span>
                        </Link>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className='mx-4 hidden w-full max-w-2xl md:flex'>
                        <div className='relative flex w-full gap-2'>
                            <div className='relative flex-1'>
                                <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                                <Input
                                    type='search'
                                    placeholder='Search for professors, branches...'
                                    className='focus-visible:ring-primary w-full pr-4 pl-10'
                                    onClick={() => setSearchOpen(true)}
                                />
                            </div>
                            <Button
                                variant='outline'
                                className='flex items-center gap-2'
                                onClick={() => setSearchOpen(true)}>
                                {selectedBranch}
                                <ChevronDown className='text-muted-foreground h-4 w-4' />
                            </Button>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden items-center gap-4 md:flex'>
                        <NavigationMenu>
                            <NavigationMenuList>
                                {navLinks.slice(0, 3).map((link) => (
                                    <NavigationMenuItem key={link.href}>
                                        <Link href={link.href} legacyBehavior passHref>
                                            <NavigationMenuLink
                                                className={navigationMenuTriggerStyle()}
                                                active={link.active}>
                                                {link.label}
                                            </NavigationMenuLink>
                                        </Link>
                                    </NavigationMenuItem>
                                ))}


                            </NavigationMenuList>
                        </NavigationMenu>

                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            aria-label='Toggle theme'>
                            {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <div className='flex items-center gap-2 md:hidden'>
                        <Button variant='ghost' size='icon' className='md:hidden' onClick={() => setSearchOpen(true)}>
                            <Search className='h-5 w-5' />
                        </Button>

                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            aria-label='Toggle theme'>
                            {theme === 'dark' ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
                        </Button>

                        <Sheet>
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
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                'rounded-md px-2 py-1 transition-colors',
                                                link.active
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'hover:bg-secondary'
                                            )}>
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
                <CommandInput placeholder='Search professors, branches, courses...' />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading='Popular Searches'>
                        {mockSearchResults.popular.map((term) => (
                            <CommandItem
                                key={term}
                                onSelect={() => {
                                    setSearchOpen(false);
                                    // Handle search
                                }}>
                                <Search className='mr-2 h-4 w-4' />
                                {term}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading='Professors'>
                        {mockSearchResults.professors.map((prof) => (
                            <CommandItem
                                key={prof.id}
                                onSelect={() => {
                                    setSearchOpen(false);
                                    // Navigate to professor page
                                }}>
                                <div className='flex flex-col'>
                                    <span>{prof.name}</span>
                                    <span className='text-muted-foreground text-sm'>{prof.department}</span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading='Branches'>
                        {mockSearchResults.branches.map((branch) => (
                            <CommandItem
                                key={branch.id}
                                onSelect={() => {
                                    setSearchOpen(false);
                                    setSelectedBranch(branch.name);
                                    // Navigate to branch page
                                }}>
                                <div className='flex flex-col'>
                                    <span>{branch.name}</span>
                                    <span className='text-muted-foreground text-sm'>
                                        {branch.professors} professors
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
