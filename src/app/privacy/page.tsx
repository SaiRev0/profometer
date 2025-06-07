'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { motion } from 'framer-motion';
import { ShieldUser } from 'lucide-react';

// Background pattern component
const BackgroundPattern = () => (
  <div className='fixed inset-0 -z-10 h-full w-full'>
    <div className='absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]' />
    <div className='bg-primary/20 absolute top-0 right-0 left-0 -z-10 m-auto h-[310px] w-[310px] rounded-full blur-[100px]' />
    <div className='bg-primary/10 absolute right-0 bottom-0 -z-10 m-auto h-[310px] w-[310px] rounded-full blur-[100px]' />
  </div>
);

export default function PrivacyPage() {
  return (
    <div className='relative mx-auto mt-4 max-w-4xl'>
      <BackgroundPattern />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='relative'>
        {/* Hero Section */}
        <motion.section
          className='from-background/80 to-background/40 relative mb-12 overflow-hidden rounded-lg bg-gradient-to-b p-8 text-center backdrop-blur-sm'
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <h1 className='from-primary via-primary/80 to-primary/60 mb-4 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent'>
              Privacy Policy
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>Last Updated: June 15, 2025</p>
          </motion.div>
        </motion.section>

        {/* Main Content */}
        <div className='space-y-8'>
          {/* Who We Are */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShieldUser className='text-primary h-5 w-5' />
                  Who We Are
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  ProfOMeter is a student-built platform to help IIT BHU students make informed academic choices. We are
                  not a registered company yet, but you can contact us at{' '}
                  <a href='mailto:profometer2025@gmail.com' className='text-primary hover:underline'>
                    profometer2025@gmail.com
                  </a>{' '}
                  for any privacy-related concerns.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* What We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle>What We Collect</CardTitle>
                <CardDescription>We collect only the data we need to provide and improve the platform</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>When you sign in to post a review</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Your name</li>
                    <li>Your college email address</li>
                    <li>Your Google profile photo</li>
                  </ul>
                </div>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>Anonymous Reviews</h3>
                  <p className='text-muted-foreground'>
                    If you choose to post a review anonymously, we do not store or associate any identity with that
                    review. Even the admin cannot trace it back to you.
                  </p>
                </div>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>Automatically Collected Data</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Cookies for login sessions and personalization</li>
                    <li>Analytics data via Google Analytics and Vercel Analytics</li>
                  </ul>
                </div>
                <p className='text-muted-foreground'>
                  We do not collect your exact location, device fingerprint, or any sensitive personal data.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* How We Use Your Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle>How We Use Your Data</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>Allow you to post and manage your reviews</li>
                  <li>Moderate content and prevent abuse</li>
                  <li>Understand usage trends and improve user experience</li>
                  <li>Remember your preferences like theme (dark/light)</li>
                </ul>
                <p className='text-muted-foreground mt-4'>Your data is not shared with any third parties, except:</p>
                <ul className='text-muted-foreground mt-2 list-disc space-y-2 pl-6'>
                  <li>Google Sign-In (for authentication)</li>
                  <li>Google & Vercel Analytics (for usage tracking)</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>You can edit or delete your non-anonymous reviews at any time</li>
                  <li>
                    If you want to delete your account or all data, you can email us at{' '}
                    <a href='mailto:profometer2025@gmail.com' className='text-primary hover:underline'>
                      profometer2025@gmail.com
                    </a>
                  </li>
                  <li>You may browse all reviews without creating an account</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>Cookies and Tracking</h3>
                  <p className='text-muted-foreground'>
                    We use essential cookies for login sessions and user preferences. We also use Google Analytics and
                    Vercel Analytics cookies to understand traffic patterns. You can manage cookie preferences through
                    your browser settings.
                  </p>
                </div>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>Children Under 18</h3>
                  <p className='text-muted-foreground'>
                    Students under 18 can use ProfOMeter. However, we do not knowingly collect more data than needed or
                    display any personally identifiable information publicly.
                  </p>
                </div>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>Data Security</h3>
                  <p className='text-muted-foreground'>
                    We take reasonable measures to protect your data, but no system can be 100% secure. Anonymous
                    reviews are permanently unlinkable from your account, even to us.
                  </p>
                </div>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>Future Changes</h3>
                  <p className='text-muted-foreground'>
                    This policy may change if we introduce new features such as advertising. Any changes will be
                    reflected here, and we'll update the "Last Updated" date above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  For any privacy concerns, feedback, or data deletion requests, contact:{' '}
                  <a href='mailto:profometer2025@gmail.com' className='text-primary hover:underline'>
                    profometer2025@gmail.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
