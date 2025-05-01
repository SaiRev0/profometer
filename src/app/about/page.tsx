'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { motion } from 'framer-motion';
import { BookOpen, Heart, School, Shield, Star, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Hero Section */}
        <section className='mb-12 text-center'>
          <h1 className='mb-4 text-4xl font-bold'>About RateThatProf</h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
            Helping students make informed decisions about their education through transparent professor reviews and
            ratings.
          </p>
        </section>

        {/* Mission Section */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Heart className='text-primary h-5 w-5' />
              Our Mission
            </CardTitle>
            <CardDescription>What drives us to make education better</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              At RateThatProf, we believe that every student deserves access to transparent, honest information about
              their professors. Our platform empowers students to make informed decisions about their education while
              helping professors receive constructive feedback to improve their teaching methods.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className='mb-12 grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='text-primary h-5 w-5' />
                Community Driven
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Our platform thrives on student contributions, creating a valuable resource for the entire academic
                community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Star className='text-primary h-5 w-5' />
                Fair Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                We ensure balanced, honest reviews through our comprehensive rating system and moderation process.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='text-primary h-5 w-5' />
                Privacy First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                Student privacy is our priority. Review anonymously and control your data with our robust privacy
                features.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpen className='text-primary h-5 w-5' />
                Educational Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>
                By providing insights about teaching styles and course expectations, we help improve educational
                outcomes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className='mb-12'>
          <CardHeader>
            <CardTitle>Our Impact</CardTitle>
            <CardDescription>Growing together with the academic community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 text-center sm:grid-cols-2 md:grid-cols-4'>
              <div className='p-4'>
                <p className='text-primary text-3xl font-bold'>50K+</p>
                <p className='text-muted-foreground text-sm'>Active Users</p>
              </div>
              <div className='p-4'>
                <p className='text-primary text-3xl font-bold'>10K+</p>
                <p className='text-muted-foreground text-sm'>Professors Rated</p>
              </div>
              <div className='p-4'>
                <p className='text-primary text-3xl font-bold'>100K+</p>
                <p className='text-muted-foreground text-sm'>Reviews Written</p>
              </div>
              <div className='p-4'>
                <p className='text-primary text-3xl font-bold'>500+</p>
                <p className='text-muted-foreground text-sm'>Universities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Values */}
        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
            <CardDescription>The principles that guide our platform</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h3 className='mb-2 font-medium'>Transparency</h3>
              <p className='text-muted-foreground'>
                We believe in open, honest communication about educational experiences.
              </p>
            </div>
            <div>
              <h3 className='mb-2 font-medium'>Fairness</h3>
              <p className='text-muted-foreground'>Our review system promotes balanced, constructive feedback.</p>
            </div>
            <div>
              <h3 className='mb-2 font-medium'>Privacy</h3>
              <p className='text-muted-foreground'>We protect user privacy while maintaining review authenticity.</p>
            </div>
            <div>
              <h3 className='mb-2 font-medium'>Community</h3>
              <p className='text-muted-foreground'>
                Building a supportive environment for students and educators alike.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
