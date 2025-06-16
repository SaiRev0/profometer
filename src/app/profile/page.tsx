'use client';

import { useEffect } from 'react';

import ReviewCard from '@/components/cards/ReviewCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from '@bprogress/next/app';

import ProfileSkeleton from './_UI/ProfileSkeleton';
import { motion } from 'framer-motion';
import { Calendar, LogOut, Mail, School, Star } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

function WriteFirstReview() {
  return (
    <div className='pt-8 pb-4 text-center'>
      <Star className='text-muted-foreground mx-auto mb-3 h-12 w-12' />
      <p className='text-muted-foreground mb-4'>You haven't written any reviews yet.</p>
      {/* <Button asChild>
        <Link href='/review/new'>Write Your First Review</Link>
      </Button> */}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const { profile, isLoading, error } = useProfile();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className='mx-auto mt-4 max-w-4xl text-center'>
        <Card>
          <CardContent className='py-8'>
            <p className='text-destructive'>Failed to load profile data. Please try again later.</p>
            <Button onClick={() => router.refresh()} className='mt-4'>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='mx-auto mt-4 max-w-4xl'>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Profile Overview */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <CardTitle className='text-2xl'>{profile.name}</CardTitle>
                <CardDescription className='flex items-center gap-1'>
                  <School className='h-4 w-4' />
                  {profile.department.name}
                </CardDescription>
              </div>

              <div className='flex gap-2'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='outline' size='sm' className='hover:cursor-pointer'>
                      <LogOut className='mr-1 h-4 w-4' />
                      Logout
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will need to log in again to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className='hover:cursor-pointer'>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive hover:cursor-pointer'>
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='col-span-2 space-y-2'>
                <div className='text-muted-foreground flex items-center gap-2'>
                  <Mail className='text-primary h-4 w-4' />
                  <span>{profile.email}</span>
                </div>
                <div className='text-muted-foreground flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center'>
                  <p className='text-primary text-2xl font-bold'>{profile.statistics.totalReviews}</p>
                  <p className='text-muted-foreground text-sm'>Reviews</p>
                </div>
                <div className='text-center'>
                  <p className='text-primary text-2xl font-bold'>{profile.statistics.helpfulVotes}</p>
                  <p className='text-muted-foreground text-sm'>Helpful Votes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <Star className='text-primary h-5 w-5' />
                Your Reviews
              </CardTitle>
            </div>
            <CardDescription>Manage and edit your professor reviews</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue='all' className='w-full'>
              <TabsList>
                <TabsTrigger value='all'>All Reviews</TabsTrigger>
                <TabsTrigger value='recent'>Recent</TabsTrigger>
                <TabsTrigger value='popular'>Most Helpful</TabsTrigger>
              </TabsList>

              <TabsContent value='all' className='mt-4 space-y-4'>
                {profile.reviews.length === 0 ? (
                  <WriteFirstReview />
                ) : (
                  profile.reviews.map((review) => (
                    <div key={review.id} className='group relative'>
                      <ReviewCard review={review} variant='own' />
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value='recent' className='mt-4 space-y-4'>
                {profile.reviews.length === 0 ? (
                  <WriteFirstReview />
                ) : (
                  profile.reviews
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((review) => <ReviewCard key={review.id} review={review} variant='own' />)
                )}
              </TabsContent>

              <TabsContent value='popular' className='mt-4 space-y-4'>
                {profile.reviews.length === 0 ? (
                  <WriteFirstReview />
                ) : (
                  profile.reviews
                    .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
                    .slice(0, 5)
                    .map((review) => <ReviewCard key={review.id} review={review} variant='own' />)
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
