"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, BookOpen, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      label: "Search",
      href: "/search",
      icon: Search,
      active: pathname === "/search",
    },
    {
      label: "Branches",
      href: "/branches",
      icon: BookOpen,
      active: pathname === "/branches" || pathname.startsWith("/branch/"),
    },
    {
      label: "More",
      icon: Menu,
      sheet: true,
    },
  ];

  // Additional links for the "More" menu
  const moreLinks = [
    { label: "Popular Professors", href: "/popular" },
    { label: "About", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border h-16">
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => (
          <div key={item.label} className="flex justify-center items-center">
            {item.sheet ? (
              <Sheet>
                <SheetTrigger className="flex flex-col items-center justify-center w-full h-full">
                  <item.icon className={cn(
                    "h-5 w-5 mb-1",
                    item.active ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-xs">{item.label}</span>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-80">
                  <SheetHeader>
                    <SheetTitle>More Options</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                      >
                        <span className="mt-2 text-sm font-medium">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Link
                href={item.href ?? ""}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <item.icon className={cn(
                  "h-5 w-5 mb-1",
                  item.active ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs",
                  item.active ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}