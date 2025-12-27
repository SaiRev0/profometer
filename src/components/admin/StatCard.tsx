import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { ArrowDown, ArrowUp, LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  description?: string;
  trend?: string;
  isLoading?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
  trendDirection?: 'up' | 'down' | 'neutral';
}

const variantStyles = {
  default: {
    gradient: 'from-slate-50 to-slate-100 dark:from-indigo-950/40 dark:to-indigo-900/30',
    iconBg: 'bg-slate-100 dark:bg-indigo-900/40',
    iconColor: 'text-slate-600 dark:text-indigo-300',
    border: 'border-slate-200 dark:border-indigo-800/60'
  },
  primary: {
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/60 dark:to-blue-900/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/50'
  },
  secondary: {
    gradient: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/40',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/50'
  },
  success: {
    gradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/40',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/50'
  },
  info: {
    gradient: 'from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/40',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
    iconColor: 'text-cyan-600 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800/50'
  },
  warning: {
    gradient: 'from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/50'
  },
  danger: {
    gradient: 'from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/30',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/50'
  }
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  isLoading = false,
  variant = 'default',
  trendDirection
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className='overflow-hidden bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 px-4 pb-2 sm:px-6'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-10 rounded-lg' />
        </CardHeader>
        <CardContent className='space-y-2 px-4 sm:px-6'>
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-4 w-32' />
        </CardContent>
      </Card>
    );
  }

  const styles = variantStyles[variant];
  const TrendIcon = trendDirection === 'up' ? ArrowUp : trendDirection === 'down' ? ArrowDown : TrendingUp;
  const trendColor =
    trendDirection === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trendDirection === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-blue-600 dark:text-blue-400';

  return (
    <Card
      className={cn(
        'group overflow-hidden bg-linear-to-br transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        styles.border,
        styles.gradient
      )}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 px-4 pb-3 sm:px-6'>
        <CardTitle className='text-sm font-semibold tracking-tight'>{title}</CardTitle>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110',
              styles.iconBg
            )}>
            <Icon className={cn('h-5 w-5', styles.iconColor)} />
          </div>
        )}
      </CardHeader>
      <CardContent className='space-y-2 px-4 sm:px-6'>
        <div className='text-3xl font-bold tracking-tight'>{value}</div>
        {(description || trend) && (
          <div className='flex items-center gap-2 text-xs'>
            {trend && trendDirection && <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} />}
            <p className='text-muted-foreground font-medium'>{description || trend}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardGridProps {
  children: React.ReactNode;
}

export function StatCardGrid({ children }: StatCardGridProps) {
  return <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>{children}</div>;
}
