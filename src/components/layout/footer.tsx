'use client';

import Link from 'next/link';

import { Github, Mail, School, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='bg-background mt-auto border-t'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid-cols- grid gap-8 sm:grid-cols-4'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <School className='text-primary h-6 w-6' />
              <span className='text-lg font-bold'>RateThatProf</span>
            </div>
            <p className='text-muted-foreground text-sm'>
              Find and rate professors to help other students make informed decisions about their education.
            </p>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/popular' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
                  Popular Professors
                </Link>
              </li>
              <li>
                <Link href='/branches' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
                  Browse Branches
                </Link>
              </li>
              <li>
                <Link href='/about' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Legal</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/privacy' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href='/terms' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href='/guidelines' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Connect</h3>
            <ul className='space-y-2'>
              <li>
                <a
                  href='mailto:contact@ratethatprof.com'
                  className='text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors'>
                  <Mail className='h-4 w-4' />
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href='https://github.com/ratethatprof'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors'>
                  <Github className='h-4 w-4' />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href='https://twitter.com/ratethatprof'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-muted-foreground hover:text-primary flex items-center gap-2 text-sm transition-colors'>
                  <Twitter className='h-4 w-4' />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-4 flex flex-col items-center justify-between gap-4 border-t md:flex-row'>
          <p className='text-muted-foreground text-sm'>
            © {new Date().getFullYear()} RateThatProf. All rights reserved.
          </p>
          <div className='flex items-center gap-6'>
            <Link href='/privacy' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
              Privacy
            </Link>
            <Link href='/terms' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
              Terms
            </Link>
            <Link href='/about' className='text-muted-foreground hover:text-primary text-sm transition-colors'>
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
