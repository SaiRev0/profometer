"use client";

import Link from "next/link";
import { School, Mail, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">RateThatProf</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Find and rate professors to help other students make informed decisions about their education.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/popular" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Popular Professors
                </Link>
              </li>
              <li>
                <Link href="/branches" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse Branches
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:contact@ratethatprof.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/ratethatprof"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/ratethatprof"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RateThatProf. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}