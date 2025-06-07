'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Ban, FileText, Mail, Scale, ShieldAlert, UserCheck } from 'lucide-react';

// Background pattern component
const BackgroundPattern = () => (
  <div className='fixed inset-0 -z-10 h-full w-full'>
    <div className='absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]' />
    <div className='bg-primary/20 absolute top-0 right-0 left-0 -z-10 m-auto h-[310px] w-[310px] rounded-full blur-[100px]' />
    <div className='bg-primary/10 absolute right-0 bottom-0 -z-10 m-auto h-[310px] w-[310px] rounded-full blur-[100px]' />
  </div>
);

export default function TermsPage() {
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
              Terms and Conditions
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>Last Updated: June 15, 2025</p>
          </motion.div>
        </motion.section>

        {/* Main Content */}
        <div className='space-y-8'>
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='text-primary h-5 w-5' />
                  Welcome to ProfOMeter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  Welcome to ProfOMeter ("we", "our", or "us"). These Terms and Conditions ("Terms") govern your use of
                  the ProfOMeter website and services. By accessing or using our platform, you agree to be bound by
                  these Terms.
                </p>
                <p className='text-muted-foreground mt-4'>
                  If you do not agree to any part of these Terms, please refrain from using ProfOMeter.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Eligibility and Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <UserCheck className='text-primary h-5 w-5' />
                  Eligibility and Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>Anyone can view reviews and browse the website.</li>
                  <li>
                    Only students of <span className='font-medium'>IIT BHU</span> can sign in and post reviews, using
                    their official IIT BHU Gmail account through Google Sign-In.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShieldAlert className='text-primary h-5 w-5' />
                  User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>To post reviews, you must sign in using your IIT BHU Google account.</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li>
                    You may request to delete your account or any associated data by contacting us at{' '}
                    <a href='mailto:profometer2025@gmail.com' className='text-primary hover:underline'>
                      profometer2025@gmail.com
                    </a>
                    .
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Content and Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertCircle className='text-primary h-5 w-5' />
                  User Content and Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>You may post multiple reviews for the same professor or course.</li>
                    <li>You are allowed to edit or delete your non-anonymous reviews at any time.</li>
                    <li>
                      Anonymous reviews cannot be edited or deleted after submission and are not traceable to any user.
                    </li>
                    <li>
                      By submitting content, you grant ProfOMeter a non-exclusive, royalty-free, perpetual license to
                      use, display, and share your reviews.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>You agree not to post content that:</h3>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>Is offensive, abusive, harassing, or discriminatory</li>
                    <li>Contains personal attacks, slander, or hate speech</li>
                    <li>Violates any laws or academic policies</li>
                  </ul>
                </div>
                <p className='text-muted-foreground'>
                  We reserve the right to moderate, remove, or reject any content that violates these rules, either
                  manually or automatically in the future.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Ownership */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Scale className='text-primary h-5 w-5' />
                  Content Ownership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>
                    The platform retains ownership of all user-submitted content for the purpose of hosting, displaying,
                    and improving the platform.
                  </li>
                  <li>Reviews may be publicly displayed and shared even to non-logged-in visitors.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertTriangle className='text-primary h-5 w-5' />
                  Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>ProfOMeter does not verify the accuracy of any reviews posted by users.</li>
                  <li>
                    Reviews represent personal opinions of users and are not endorsed by ProfOMeter or any official
                    body.
                  </li>
                  <li>Use the information on this site at your own discretion.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Limitation of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Ban className='text-primary h-5 w-5' />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-4'>We are not liable for:</p>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>Any errors or inaccuracies in posted content</li>
                  <li>Downtime, bugs, or platform outages</li>
                  <li>Any misuse of the platform or its data</li>
                </ul>
                <p className='text-muted-foreground mt-4'>
                  Use of ProfOMeter is provided on an "as is" and "as available" basis.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Moderation and Termination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShieldAlert className='text-primary h-5 w-5' />
                  Moderation and Termination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>
                    We reserve the right to remove any content, suspend accounts, or block users who violate these
                    Terms.
                  </li>
                  <li>Review moderation is currently manual, but we may implement automated tools in the future.</li>
                  <li>
                    You can request deletion of your reviews or account by emailing{' '}
                    <a href='mailto:profometer2025@gmail.com' className='text-primary hover:underline'>
                      profometer2025@gmail.com
                    </a>
                    .
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes to Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertCircle className='text-primary h-5 w-5' />
                  Changes to These Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  We may update these Terms at any time. While we will try to notify users, we do not guarantee prior
                  notice for all changes. Your continued use of the platform implies acceptance of the updated terms.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-gradient-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Mail className='text-primary h-5 w-5' />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  For questions, feedback, or data requests, please contact:{' '}
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
