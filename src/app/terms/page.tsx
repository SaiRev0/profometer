'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  Scale,
  ShieldAlert,
  ThumbsUp,
  UserCheck
} from 'lucide-react';

// Background pattern component
const BackgroundPattern = () => (
  <div className='fixed inset-0 -z-10 h-full w-full'>
    <div className='absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]' />
    <div className='bg-primary/20 absolute top-0 right-0 left-0 -z-10 m-auto h-77.5 w-77.5 rounded-full blur-[100px]' />
    <div className='bg-primary/10 absolute right-0 bottom-0 -z-10 m-auto h-77.5 w-77.5 rounded-full blur-[100px]' />
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
          className='from-background/80 to-background/40 relative mb-12 overflow-hidden rounded-lg bg-linear-to-b p-8 text-center backdrop-blur-sm'
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            <h1 className='from-primary via-primary/80 to-primary/60 mb-4 bg-linear-to-r bg-clip-text text-4xl font-bold text-transparent'>
              Terms and Conditions
            </h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>Last Updated: December 31, 2025</p>
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
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
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
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
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
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShieldAlert className='text-primary h-5 w-5' />
                  User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>To post reviews, you must sign in using your IIT BHU Google account.</li>
                  <li>
                    Upon first sign-in, you will be assigned an{' '}
                    <span className='font-medium'>auto-generated username</span> in the format{' '}
                    <span className='font-mono text-sm'>adjective_noun_digits</span> (e.g., happy_fox_123).
                  </li>
                  <li>
                    You must <span className='font-medium'>finalize your username</span> on your first login. This is a{' '}
                    <span className='font-medium'>one-time process</span>.
                  </li>
                  <li>
                    Once finalized, your <span className='font-medium'>username becomes PERMANENT</span> and cannot be
                    changed.
                  </li>
                  <li>Your username will be displayed instead of your real name on all reviews and comments.</li>
                  <li>
                    Your <span className='font-medium'>department code</span> is automatically extracted from your email
                    address and permanently linked to your account but never displayed.
                  </li>
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
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <AlertCircle className='text-primary h-5 w-5' />
                  User Content and Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>
                      You may post <span className='font-medium'>one review per professor</span> and{' '}
                      <span className='font-medium'>one review per course</span>.
                    </li>
                    <li>
                      All reviews are <span className='font-medium'>permanently linked to your user account</span> and
                      displayed with your username.
                    </li>
                    <li>
                      You are allowed to <span className='font-medium'>edit or delete</span> your reviews at any time.
                    </li>
                    <li>
                      Reviews include detailed information such as multiple rating categories (5-6 different ratings
                      including teaching quality, clarity, grading fairness, etc.), written feedback, statistics, grade
                      received, and semester information.
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

          {/* Commenting on Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MessageSquare className='text-primary h-5 w-5' />
                  Commenting on Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>
                    Users can <span className='font-medium'>comment on reviews</span> to provide additional insights or
                    ask questions.
                  </li>
                  <li>
                    Comments can have <span className='font-medium'>nested replies up to 4 levels deep</span>.
                  </li>
                  <li>
                    Users can <span className='font-medium'>edit or delete their own comments</span> at any time.
                  </li>
                  <li>
                    All comments are <span className='font-medium'>linked to your user account</span> and displayed with
                    your username.
                  </li>
                  <li>
                    Comments can be <span className='font-medium'>voted on</span> (upvote/downvote) by other users.
                  </li>
                  <li>
                    Comments can be <span className='font-medium'>reported</span> for violations using the reporting
                    system.
                  </li>
                  <li>Comments that violate our content policies may be removed by administrators.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Voting System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ThumbsUp className='text-primary h-5 w-5' />
                  Voting System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>
                    Users can <span className='font-medium'>upvote or downvote</span> both reviews and comments.
                  </li>
                  <li>
                    Each user can cast <span className='font-medium'>one vote per item</span> (either upvote or
                    downvote).
                  </li>
                  <li>
                    Users can <span className='font-medium'>change or remove</span> their votes at any time.
                  </li>
                  <li>
                    All vote data is <span className='font-medium'>tracked and stored</span> and linked to your user
                    account.
                  </li>
                  <li>Voting helps the community identify helpful or unhelpful content.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Creation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Plus className='text-primary h-5 w-5' />
                  Course Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>
                    Any authenticated user can <span className='font-medium'>create new courses</span> on the platform.
                  </li>
                  <li>
                    Newly created courses <span className='font-medium'>require admin verification</span> before they
                    become searchable and visible to other users.
                  </li>
                  <li>
                    When creating a course, you must provide accurate course information including course code and name.
                  </li>
                  <li>Fake or duplicate course submissions may result in account suspension.</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Ownership */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Scale className='text-primary h-5 w-5' />
                  Content Ownership and Data Collection
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-muted-foreground'>
                  The platform retains ownership of all user-submitted content for the purpose of hosting, displaying,
                  and improving the platform. This includes:
                </p>
                <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                  <li>
                    <span className='font-medium'>Reviews</span>: Including all detailed rating data, statistics, grade
                    information, and written feedback
                  </li>
                  <li>
                    <span className='font-medium'>Comments</span>: All comments and nested replies
                  </li>
                  <li>
                    <span className='font-medium'>Votes</span>: Vote data on reviews and comments
                  </li>
                  <li>
                    <span className='font-medium'>Courses</span>: User-created course entries
                  </li>
                </ul>
                <p className='text-muted-foreground'>
                  Reviews and comments may be publicly displayed and shared even to non-logged-in visitors.
                </p>
                <div>
                  <h3 className='text-primary mb-2 font-medium'>Data We Collect</h3>
                  <p className='text-muted-foreground mb-2'>When you use ProfOMeter, we collect and store:</p>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>
                      <span className='font-medium'>Authentication data</span>: OAuth tokens (access tokens, refresh
                      tokens, ID tokens)
                    </li>
                    <li>
                      <span className='font-medium'>Account information</span>: Email address, username, and department
                      code (auto-extracted from email)
                    </li>
                    <li>
                      <span className='font-medium'>Review data</span>: All ratings, written feedback, grades,
                      statistics, and semester information
                    </li>
                    <li>
                      <span className='font-medium'>Comment data</span>: All comments and replies you post
                    </li>
                    <li>
                      <span className='font-medium'>Voting data</span>: Your upvotes and downvotes on reviews and
                      comments
                    </li>
                    <li>
                      <span className='font-medium'>Report data</span>: Reports you submit, including your identity as
                      the reporter (visible to administrators)
                    </li>
                    <li>
                      <span className='font-medium'>Course data</span>: Courses you create
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
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
            transition={{ duration: 0.5, delay: 0.9 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
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
            transition={{ duration: 0.5, delay: 1.0 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <ShieldAlert className='text-primary h-5 w-5' />
                  Moderation and Termination
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
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

                <div>
                  <h3 className='text-primary mb-2 font-medium'>Administrator Powers</h3>
                  <p className='text-muted-foreground mb-2'>Platform administrators have the following capabilities:</p>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>
                      <span className='font-medium'>Delete any review or comment</span> without prior notice if it
                      violates our policies
                    </li>
                    <li>
                      <span className='font-medium'>View reporter identities</span>: When you report content, your
                      identity is visible to administrators (reports are not anonymous to admins)
                    </li>
                    <li>
                      <span className='font-medium'>Access comprehensive platform statistics</span>: Including user
                      data, review metrics, and engagement analytics
                    </li>
                    <li>
                      <span className='font-medium'>View all user data</span>: Including usernames, email addresses,
                      votes, and reports submitted
                    </li>
                    <li>
                      <span className='font-medium'>Verify or reject user-created courses</span>: Administrators must
                      approve new courses before they become visible
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-primary mb-2 font-medium'>Reporting System</h3>
                  <p className='text-muted-foreground mb-2'>
                    Users can report reviews and comments for violations using the following categories:
                  </p>
                  <ul className='text-muted-foreground list-disc space-y-2 pl-6'>
                    <li>
                      <span className='font-medium'>Inappropriate</span>: Offensive, abusive, or discriminatory content
                    </li>
                    <li>
                      <span className='font-medium'>Spam</span>: Irrelevant promotional content or repeated posts
                    </li>
                    <li>
                      <span className='font-medium'>Not Relevant</span>: Content that doesn't relate to the professor or
                      course
                    </li>
                    <li>
                      <span className='font-medium'>Fake</span>: Suspected false or fabricated reviews
                    </li>
                    <li>
                      <span className='font-medium'>Other</span>: Other policy violations
                    </li>
                  </ul>
                  <p className='text-muted-foreground mt-2'>
                    While your reports are visible to administrators, we take all reports seriously and investigate them
                    promptly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changes to Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
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
            transition={{ duration: 0.5, delay: 1.2 }}
            viewport={{ once: true }}>
            <Card className='hover:shadow-primary/20 hover:from-background hover:to-background/95 transition-all duration-300 hover:bg-linear-to-br hover:shadow-lg'>
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
