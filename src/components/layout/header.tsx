"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Menu, Search, Sun, Moon, School, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Mock search results
const mockSearchResults = {
  professors: [
    { id: "prof-1", name: "Dr. Sarah Johnson", department: "Computer Science" },
    { id: "prof-2", name: "Prof. Michael Williams", department: "Engineering" },
    { id: "prof-3", name: "Dr. Emily Chen", department: "Physics" },
  ],
  branches: [
    { id: "cs", name: "Computer Science", professors: 48 },
    { id: "eng", name: "Engineering", professors: 62 },
    { id: "bus", name: "Business", professors: 45 },
  ],
  popular: [
    "Machine Learning",
    "Data Structures",
    "Web Development",
    "Artificial Intelligence",
  ]
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  // Monitor scroll position for header styling
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links for both desktop and mobile
  const navLinks = [
    { href: "/", label: "Home", active: pathname === "/" },
    { href: "/popular", label: "Popular Professors", active: pathname === "/popular" },
    { href: "/branches", label: "Branches", active: pathname === "/branches" || pathname.startsWith("/branch/") },
    { href: "/about", label: "About", active: pathname === "/about" },
  ];

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-background border-b border-border">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <School className="w-6 h-6" />
            <span className="font-bold text-lg">RateThatProf</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-200",
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background border-b border-border/50"
        )}
      >
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <School className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg hidden sm:inline">RateThatProf</span>
            </Link>
          </div>

          {/* Enhanced Search Bar */}
          <div className="hidden md:flex w-full max-w-2xl mx-4">
            <div className="relative w-full flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for professors, branches..."
                  className="w-full pl-10 pr-4 focus-visible:ring-primary"
                  onClick={() => setSearchOpen(true)}
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSearchOpen(true)}
              >
                {selectedBranch}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navLinks.slice(0, 2).map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <Link href={link.href} legacyBehavior passHref>
                      <NavigationMenuLink 
                        className={navigationMenuTriggerStyle()} 
                        active={link.active}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Branches</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {["Computer Science", "Engineering", "Business", "Arts", "Medicine", "Law"].map(
                        (branch) => (
                          <li key={branch}>
                            <Link href={`/branch/${branch.toLowerCase().replace(" ", "-")}`} legacyBehavior passHref>
                              <NavigationMenuLink
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                )}
                              >
                                <div className="text-sm font-medium leading-none">{branch}</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Browse {branch} professors
                                </p>
                              </NavigationMenuLink>
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-6">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className={cn(
                        "px-2 py-1 rounded-md transition-colors",
                        link.active 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "hover:bg-secondary"
                      )}
                    >
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
        <CommandInput placeholder="Search professors, branches, courses..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Popular Searches">
            {mockSearchResults.popular.map((term) => (
              <CommandItem 
                key={term}
                onSelect={() => {
                  setSearchOpen(false);
                  // Handle search
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                {term}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Professors">
            {mockSearchResults.professors.map((prof) => (
              <CommandItem
                key={prof.id}
                onSelect={() => {
                  setSearchOpen(false);
                  // Navigate to professor page
                }}
              >
                <div className="flex flex-col">
                  <span>{prof.name}</span>
                  <span className="text-sm text-muted-foreground">{prof.department}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Branches">
            {mockSearchResults.branches.map((branch) => (
              <CommandItem
                key={branch.id}
                onSelect={() => {
                  setSearchOpen(false);
                  setSelectedBranch(branch.name);
                  // Navigate to branch page
                }}
              >
                <div className="flex flex-col">
                  <span>{branch.name}</span>
                  <span className="text-sm text-muted-foreground">{branch.professors} professors</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}