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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  trendDirection?: 'up' | 'down' | 'neutral';
}

const variantStyles = {
  default: {
    gradient: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700'
  },
  primary: {
    gradient: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  success: {
    gradient: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    iconBg: 'bg-green-100 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  warning: {
    gradient: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
    iconBg: 'bg-orange-100 dark:bg-orange-900',
    iconColor: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  },
  danger: {
    gradient: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
    iconBg: 'bg-red-100 dark:bg-red-900',
    iconColor: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
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
