'use client';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { ClipboardCheck, Info, Mail, School, ShieldUser } from 'lucide-react';

const navItems: {
  href: string;
  icon: React.ElementType;
  text: string;
}[] = [
  {
    href: '/privacy',
    icon: ShieldUser,
    text: 'Privacy Policy'
  },
  {
    href: '/about',
    icon: Info,
    text: 'About Us'
  },
  {
    href: '/terms',
    icon: ClipboardCheck,
    text: 'Terms of Service'
  }
];

export default function Footer() {
  return (
    <footer className='bg-background/95 border-border/50 dark:bg-background relative mt-auto overflow-hidden border-t-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none'>
      {/* Animated wave pattern decoration */}
      <motion.div
        className='pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.03]'
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}>
        <svg className='absolute bottom-0 h-32 w-full' viewBox='0 0 1440 320' preserveAspectRatio='none'>
          <motion.path
            fill='currentColor'
            d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>

      {/* Animated gradient orbs */}
      <div className='pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.07]'>
        <motion.div
          className='from-primary/40 dark:from-primary absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br to-purple-400/40 blur-3xl dark:to-purple-500'
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className='to-primary/40 dark:to-primary absolute -right-32 -bottom-32 h-72 w-72 rounded-full bg-gradient-to-tr from-blue-400/40 blur-3xl dark:from-blue-500'
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      <div className='relative container mx-auto px-4 pt-8 pb-16'>
        {/* Main content grid */}
        <div className='mb-6 grid grid-cols-1 gap-12 lg:grid-cols-12'>
          {/* Brand section */}
          <motion.div
            className='space-y-6 lg:col-span-5'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            <motion.div
              className='group flex items-center gap-3'
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              <motion.div
                className='from-primary/30 to-primary/20 dark:from-primary/20 dark:to-primary/10 group-hover:bg-primary/30 dark:group-hover:bg-primary/20 rounded-2xl bg-gradient-to-br p-2 shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 dark:shadow-none'
                whileHover={{ rotate: 5 }}>
                <Image src='/images/logo.png' alt='ProfOMeter' width={40} height={40} className='rounded-full' />
              </motion.div>
              <div>
                <motion.span
                  className='from-primary via-primary/90 to-primary/70 dark:from-primary dark:via-primary/80 dark:to-primary/60 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent'
                  animate={{
                    backgroundPosition: ['0%', '100%']
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}>
                  ProfOMeter
                </motion.span>
                <p className='text-muted-foreground mt-1 text-sm'>Your Academic Guide</p>
              </div>
            </motion.div>
            <motion.p
              className='text-muted-foreground max-w-md text-sm leading-relaxed'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}>
              Find and rate professors to help other students make informed decisions about their education.
            </motion.p>
          </motion.div>

          {/* Quick Links and Contact section */}
          <motion.div
            className='lg:col-span-7'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {/* Quick Links */}
              <motion.div
                className='from-muted/80 to-muted/60 dark:from-muted/50 dark:to-muted/30 border-border/50 rounded-2xl border bg-gradient-to-br p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_12px_-1px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:hover:shadow-none'
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <h3 className='from-primary to-primary/80 dark:from-primary dark:to-primary/70 mb-4 bg-gradient-to-r bg-clip-text text-lg font-semibold text-transparent'>
                  Quick Links
                </h3>
                <ul className='space-y-3'>
                  {navItems.map((link, index) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}>
                      <Link
                        href={link.href}
                        className='text-muted-foreground hover:text-primary group flex items-center gap-2 text-sm transition-colors'>
                        <motion.div
                          className='bg-primary/20 dark:bg-primary/10 group-hover:bg-primary/30 dark:group-hover:bg-primary/20 rounded-md p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors dark:shadow-none'
                          whileHover={{ scale: 1.1, rotate: 5 }}>
                          <link.icon className='h-4 w-4' />
                        </motion.div>
                        <motion.span whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400 }}>
                          {link.text}
                        </motion.span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Contact Section */}
              <motion.div
                className='from-primary/10 to-primary/5 dark:from-primary/5 dark:to-primary/10 border-primary/20 dark:border-primary/10 rounded-2xl border bg-gradient-to-br p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-1px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_12px_-1px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:hover:shadow-none'
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <h3 className='from-primary to-primary/80 dark:from-primary dark:to-primary/70 mb-4 bg-gradient-to-r bg-clip-text text-lg font-semibold text-transparent'>
                  Get in Touch
                </h3>
                <div className='space-y-4'>
                  <motion.a
                    href='mailto:profometer2025@gmail.com'
                    className='group flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07)] dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10 dark:hover:shadow-none'
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}>
                    <motion.div
                      className='bg-primary/20 dark:bg-primary/10 group-hover:bg-primary/30 dark:group-hover:bg-primary/20 rounded-lg p-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors dark:shadow-none'
                      whileHover={{ rotate: 15, scale: 1.1 }}>
                      <Mail className='text-primary h-5 w-5' />
                    </motion.div>
                    <div>
                      <motion.p className='text-primary text-sm font-medium' whileHover={{ x: 5 }}>
                        Email Us
                      </motion.p>
                      <motion.p
                        className='text-muted-foreground group-hover:text-primary text-sm transition-colors'
                        whileHover={{ x: 5 }}>
                        profometer2025@gmail.com
                      </motion.p>
                    </div>
                  </motion.a>
                  <motion.p
                    className='text-muted-foreground mt-2 text-sm'
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}>
                    Have questions or feedback? We'd love to hear from you. Send us an email and we'll get back to you
                    as soon as possible.
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          className='border-border/100 border-t-2 pt-4 pb-4 sm:pb-0'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <motion.p className='text-muted-foreground text-sm' whileHover={{ scale: 1.02 }}>
              © {new Date().getFullYear()} ProfOMeter. All rights reserved.
            </motion.p>
            {/* <div className='flex items-center gap-4'>
              <motion.p className='text-muted-foreground flex items-center gap-2 text-sm' whileHover={{ scale: 1.02 }}>
                Made with
                <motion.span
                  className='text-red-500'
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}>
                  ❤️
                </motion.span>{' '}
                by{' '}
                <Link
                  href='https://github.com/SaiRev0'
                  className='hover:text-primary decoration-primary/30 font-medium underline underline-offset-4 transition-colors'
                  target='_blank'>
                  SaiRev
                </Link>
                <span className='text-muted-foreground/30'>•</span>
                <Link
                  href='https://www.linkedin.com/in/sairev'
                  className='hover:text-primary decoration-primary/30 font-medium underline underline-offset-4 transition-colors'
                  target='_blank'>
                  Saiyam Jain
                </Link>
              </motion.p>
            </div> */}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
