'use client';

import { useState } from 'react';

import { ReportFilters } from '@/components/admin/ReportFilters';
import { ReportsTable } from '@/components/admin/ReportsTable';
import { StatCard, StatCardGrid } from '@/components/admin/StatCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminCommentReports } from '@/hooks/useAdminCommentReports';
import { useAdminReviewReports } from '@/hooks/useAdminReviewReports';
import { useAdminStats } from '@/hooks/useAdminStats';

import { BookOpen, FileCheck, Flag, GraduationCap, MessageSquare, Star, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  // State for review reports
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewReason, setReviewReason] = useState('all');

  // State for comment reports
  const [commentPage, setCommentPage] = useState(1);
  const [commentReason, setCommentReason] = useState('all');

  // Fetch data
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const {
    data: reviewReports,
    isLoading: reviewReportsLoading,
    error: reviewReportsError,
    refetch: refetchReviewReports
  } = useAdminReviewReports({
    page: reviewPage,
    reason: reviewReason
  });
  const {
    data: commentReports,
    isLoading: commentReportsLoading,
    error: commentReportsError,
    refetch: refetchCommentReports
  } = useAdminCommentReports({
    page: commentPage,
    reason: commentReason
  });

  const handleReviewDelete = () => {
    refetchReviewReports();
    refetchStats();
  };

  const handleCommentDelete = () => {
    refetchCommentReports();
    refetchStats();
  };

  return (
    <div className='container mx-auto space-y-8 py-8'>
      {/* Header */}
      <div className='space-y-4'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-4xl font-bold tracking-tight'>Admin Dashboard</h1>
            <p className='text-muted-foreground text-lg'>Manage reports and view platform statistics</p>
          </div>
        </div>
        <div className='h-1 w-full rounded-full bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10' />
      </div>

      {/* Error Handling */}
      {statsError && (
        <Alert variant='destructive'>
          <AlertDescription>Failed to load statistics. Please refresh the page.</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Platform Statistics</h2>
        </div>

        <StatCardGrid>
          <StatCard
            title='Total Professors'
            value={stats?.professors.total ?? 0}
            icon={GraduationCap}
            description={`${stats?.professors.totalReviews ?? 0} reviews`}
            isLoading={statsLoading}
            variant='primary'
          />
          <StatCard
            title='Total Courses'
            value={stats?.courses.total ?? 0}
            icon={BookOpen}
            description={`${stats?.courses.verified ?? 0} verified`}
            isLoading={statsLoading}
            variant='success'
          />
          <StatCard
            title='Review Reports'
            value={stats?.reports.totalReviewReports ?? 0}
            icon={Flag}
            trend={`${stats?.reports.recentReviewReports ?? 0} in last 7 days`}
            isLoading={statsLoading}
            variant='warning'
            trendDirection={(stats?.reports.recentReviewReports ?? 0) > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title='Comment Reports'
            value={stats?.reports.totalCommentReports ?? 0}
            icon={MessageSquare}
            trend={`${stats?.reports.recentCommentReports ?? 0} in last 7 days`}
            isLoading={statsLoading}
            variant='danger'
            trendDirection={(stats?.reports.recentCommentReports ?? 0) > 0 ? 'up' : 'neutral'}
          />
        </StatCardGrid>

        <div className='pt-2'>
          <StatCardGrid>
            <StatCard
              title='Total Users'
              value={stats?.users.total ?? 0}
              icon={Users}
              description={`${stats?.users.withReviews ?? 0} with reviews`}
              isLoading={statsLoading}
              variant='default'
            />
            <StatCard
              title='Professor Reviews'
              value={stats?.professors.totalReviews ?? 0}
              icon={Star}
              isLoading={statsLoading}
              variant='secondary'
            />
            <StatCard
              title='Course Reviews'
              value={stats?.courses.totalReviews ?? 0}
              icon={FileCheck}
              isLoading={statsLoading}
              variant='info'
            />
            <StatCard
              title='Recent Activity'
              value={stats?.reports.totalRecent ?? 0}
              icon={TrendingUp}
              description='Last 7 days'
              isLoading={statsLoading}
              variant='primary'
              trendDirection='up'
            />
          </StatCardGrid>
        </div>
      </div>

      {/* Reports Section */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>Reports Management</h2>
        </div>

        <Tabs defaultValue='reviews' className='space-y-4'>
          <TabsList className='grid w-full max-w-md grid-cols-2'>
            <TabsTrigger value='reviews' className='gap-2'>
              <Flag className='h-4 w-4' />
              Reviews
              {stats?.reports.totalReviewReports ? (
                <span className='ml-1.5 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900 dark:text-orange-300'>
                  {stats.reports.totalReviewReports}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value='comments' className='gap-2'>
              <MessageSquare className='h-4 w-4' />
              Comments
              {stats?.reports.totalCommentReports ? (
                <span className='ml-1.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300'>
                  {stats.reports.totalCommentReports}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Review Reports Tab */}
          <TabsContent value='reviews' className='space-y-4'>
            <ReportFilters
              reason={reviewReason}
              onReasonChange={(reason) => {
                setReviewReason(reason);
                setReviewPage(1); // Reset to first page on filter change
              }}
            />

            {reviewReportsError ? (
              <Alert variant='destructive'>
                <AlertDescription>Failed to load review reports. Please try again.</AlertDescription>
              </Alert>
            ) : (
              <ReportsTable
                type='review'
                groupedReports={reviewReports?.groupedReports ?? []}
                isLoading={reviewReportsLoading}
                pagination={reviewReports?.pagination}
                meta={reviewReports?.meta}
                onPageChange={setReviewPage}
                onDelete={handleReviewDelete}
              />
            )}
          </TabsContent>

          {/* Comment Reports Tab */}
          <TabsContent value='comments' className='space-y-4'>
            <ReportFilters
              reason={commentReason}
              onReasonChange={(reason) => {
                setCommentReason(reason);
                setCommentPage(1); // Reset to first page on filter change
              }}
            />

            {commentReportsError ? (
              <Alert variant='destructive'>
                <AlertDescription>Failed to load comment reports. Please try again.</AlertDescription>
              </Alert>
            ) : (
              <ReportsTable
                type='comment'
                groupedReports={commentReports?.groupedReports ?? []}
                isLoading={commentReportsLoading}
                pagination={commentReports?.pagination}
                meta={commentReports?.meta}
                onPageChange={setCommentPage}
                onDelete={handleCommentDelete}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
