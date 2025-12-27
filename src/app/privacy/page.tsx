'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { motion } from 'framer-motion';
import { Cookie, Database, FileText, Lock, Mail, Settings, ShieldCheck, ShieldUser, Users } from 'lucide-react';

// Background pattern component
const BackgroundPattern = () => (
  <div className='fixed inset-0 -z-10 h-full w-full'>
    <div className='absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]' />
    <div className='bg-primary/20 absolute top-0 right-0 left-0 -z-10 m-auto h-77.5 w-77.5 rounded-full blur-[100px]' />
    <div className='bg-primary/10 absolute right-0 bottom-0 -z-10 m-auto h-77.5 w-77.5 rounded-full blur-[100px]' />
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
          className='from-background/80 to-background/40 relative mb-12 overflow-hidden rounded-lg bg-linear-to-b p-8 text-center backdrop-blur-sm'
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <h1 className='from-primary via-primary/80 to-primary/60 mb-4 bg-linear-to-r bg-clip-text text-4xl font-bold text-transparent'>
              Privacy Policy
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>Last Updated: December 31, 2025</p>
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
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
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
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='text-primary h-5 w-5' />
                  What We Collect
                </CardTitle>
                <CardDescription>We collect only the data we need to provide and improve the platform</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>When you sign in:</h3>
                  <p className='text-muted-foreground mb-2 text-sm'>
                    (via Google Sign-In, restricted to IIT BHU Gmail accounts)
                  </p>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Your name (from Google profile)</li>
                    <li>Your college email address (IIT BHU Gmail only)</li>
                    <li>Your Google profile photo</li>
                    <li>OAuth tokens (access token, refresh token, ID token) for authentication</li>
                    <li>
                      Department code (auto-extracted from your email address and permanently linked to your account)
                    </li>
                    <li>Auto-generated username (format: adjective_noun_digits, e.g., "happy_tiger_123")</li>
                  </ul>
                  <p className='text-muted-foreground mt-2 text-sm italic'>
                    <strong>Important:</strong> Your username becomes permanent after you finalize it and cannot be
                    changed. Your username (not your real name) is displayed publicly on all your reviews and comments.
                  </p>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>When you post reviews:</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>
                      You can post <strong>one review per professor</strong> and <strong>one review per course</strong>
                    </li>
                    <li>
                      Multiple rating categories (5-6 different ratings depending on whether it's a professor or course
                      review)
                    </li>
                    <li>Written feedback (required)</li>
                    <li>Statistics: would recommend, attendance strictness, quizzes given, assignments given</li>
                    <li>Grade received (optional: A*, A, A-, B, B-, C, C-, F, Z, S, I)</li>
                    <li>Semester information</li>
                    <li>
                      <strong>ALL reviews are permanently linked to your user account</strong> and visible to
                      administrators
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>When you comment:</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Comment text (up to 2000 characters)</li>
                    <li>Nested replies (up to 4 levels deep)</li>
                    <li>All comments are linked to your user account</li>
                    <li>Comments can be voted on and reported by other users</li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>When you vote:</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Upvotes and downvotes on reviews and comments</li>
                    <li>Vote data is tracked and stored with your user ID</li>
                    <li>You can cast one vote per item (review or comment), and can change or remove your vote</li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>When you report content:</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Report reason (inappropriate, spam, notRelevant, fake, other)</li>
                    <li>Optional details text explaining the report</li>
                    <li>
                      <strong>Your user identity is stored and visible to administrators</strong> — reports are NOT
                      anonymous to admins
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>When you create courses:</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Course details you submit (course code, name, department, description)</li>
                    <li>New courses require admin verification before becoming searchable</li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>Automatically Collected:</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Cookies for login sessions and preferences (dark/light mode)</li>
                    <li>
                      Vercel Analytics data (page views, visit duration, country-level location, device type, browser
                      info, referral sources)
                    </li>
                  </ul>
                </div>

                <div className='bg-muted/50 rounded-md p-3'>
                  <h3 className='text-primary mb-2 font-medium'>We do NOT collect:</h3>
                  <ul className='text-muted-foreground list-disc space-y-1 pl-6'>
                    <li>Exact location or IP addresses (beyond country-level from Vercel Analytics)</li>
                    <li>Device fingerprints</li>
                    <li>Google Analytics data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* How We Use Your Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Settings className='text-primary h-5 w-5' />
                  How We Use Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-muted-foreground'>We use your data to:</p>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>Authenticate you with your IIT BHU Google account using OAuth</li>
                  <li>
                    Display your <strong>username (not real name)</strong> on all reviews and comments
                  </li>
                  <li>Store and display your votes on reviews and comments</li>
                  <li>Handle reports and moderate content (admins can see reporter identities)</li>
                  <li>Allow you to edit or delete your own reviews and comments</li>
                  <li>Verify user-created courses before making them searchable on the platform</li>
                  <li>Track the one review per professor/course limit to prevent spam</li>
                  <li>Link your department affiliation based on your email domain</li>
                  <li>Understand usage trends via Vercel Analytics</li>
                  <li>Remember your preferences like theme (dark/light mode)</li>
                </ul>

                <div className='bg-muted/50 mt-4 rounded-md p-4'>
                  <p className='text-muted-foreground mb-2 font-medium'>Your data is shared with:</p>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>Google Sign-In (for authentication and OAuth token management)</li>
                    <li>Vercel Analytics (for anonymous usage tracking)</li>
                    <li>
                      Platform administrators can access all user data including: names, emails, usernames, department
                      codes, voting records, and reporter identities
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lock className='text-primary h-5 w-5' />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>
                    You can post <strong>one review per professor</strong> and <strong>one review per course</strong>
                  </li>
                  <li>
                    You can <strong>edit or delete</strong> your own reviews at any time
                  </li>
                  <li>
                    You can <strong>post comments</strong> on reviews and{' '}
                    <strong>edit or delete your own comments</strong> at any time
                  </li>
                  <li>
                    You can <strong>vote</strong> on reviews and comments (upvote or downvote), and change or remove
                    your votes
                  </li>
                  <li>
                    You can <strong>report</strong> reviews or comments (but administrators will see your identity)
                  </li>
                  <li>
                    Your <strong>username is permanent after finalization</strong> and cannot be changed
                  </li>
                  <li>
                    You can <strong>create new courses</strong> (subject to admin verification before they appear on the
                    platform)
                  </li>
                  <li>
                    You may <strong>browse all reviews without creating an account</strong>
                  </li>
                  <li>
                    If you want to <strong>delete your account or all data</strong>, email us at{' '}
                    <a href='mailto:profometer2025@gmail.com' className='text-primary hover:underline'>
                      profometer2025@gmail.com
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Administrator Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShieldCheck className='text-primary h-5 w-5' />
                  Administrator Access to Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-muted-foreground'>Platform administrators have access to:</p>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>Your name, email, username, and department code</li>
                  <li>All your reviews, comments, and votes (upvotes/downvotes)</li>
                  <li>
                    Your identity when you report content (reports are <strong>not anonymous</strong> to admins)
                  </li>
                  <li>User-created courses pending verification</li>
                  <li>Comprehensive platform statistics and analytics</li>
                  <li>Full ability to delete any content (reviews, comments, or reported items)</li>
                </ul>

                <div className='bg-muted/50 mt-4 rounded-md p-4'>
                  <p className='text-muted-foreground mb-2 font-medium'>Admins use this access to:</p>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>Moderate content and handle user reports</li>
                    <li>Verify new courses submitted by users</li>
                    <li>Maintain platform integrity and prevent abuse</li>
                    <li>Respond to data deletion requests</li>
                    <li>Monitor platform health and usage statistics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='text-primary h-5 w-5' />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='text-primary mb-2 flex items-center gap-2 font-medium'>
                    <Cookie className='h-4 w-4' />
                    Cookies and Tracking
                  </h3>
                  <p className='text-muted-foreground mb-2'>
                    We use essential cookies for login sessions, user preferences, and OAuth token management.
                  </p>
                  <p className='text-muted-foreground mb-2'>
                    We use <strong>Vercel Analytics</strong> to understand:
                  </p>
                  <ul className='text-muted-foreground mb-2 list-disc space-y-1 pl-6'>
                    <li>Page views and visit duration</li>
                    <li>Country-level geographic location</li>
                    <li>Device type and browser information</li>
                    <li>Referral sources</li>
                  </ul>
                  <p className='text-muted-foreground'>
                    <strong>Note:</strong> We do not use Google Analytics. You can manage cookie preferences through
                    your browser settings.
                  </p>
                </div>

                <div>
                  <h3 className='text-primary mb-2 flex items-center gap-2 font-medium'>
                    <Users className='h-4 w-4' />
                    Children Under 18
                  </h3>
                  <p className='text-muted-foreground'>
                    Students under 18 can use ProfOMeter. However, we do not knowingly collect more data than needed.
                    Please note that usernames (not real names) are displayed publicly on reviews and comments.
                  </p>
                </div>

                <div>
                  <h3 className='text-primary mb-2 flex items-center gap-2 font-medium'>
                    <Lock className='h-4 w-4' />
                    Data Security
                  </h3>
                  <p className='text-muted-foreground mb-2'>
                    We take reasonable measures to protect your data, including:
                  </p>
                  <ul className='text-muted-foreground mb-2 list-disc space-y-1 pl-6'>
                    <li>Secure OAuth-based authentication</li>
                    <li>Encrypted data transmission (HTTPS)</li>
                    <li>Access controls for sensitive operations</li>
                  </ul>
                  <p className='text-muted-foreground'>
                    However, no system can be 100% secure. All reviews and comments are linked to your user account (via
                    your username) and are visible to other users and administrators.
                  </p>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>Future Changes</h3>
                  <p className='text-muted-foreground'>
                    This policy may change if we introduce new features. Any changes will be reflected here, and we'll
                    update the "Last Updated" date above. We will try to notify users of significant changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Mail className='text-primary h-5 w-5' />
                  Contact Us
                </CardTitle>
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
