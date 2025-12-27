import { Badge } from '@/components/ui/badge';
import type { ReportReasonBreakdown } from '@/lib/types/admin-reports';
import { cn } from '@/lib/utils';

import { AlertCircle, AlertTriangle, Ban, Flag, Info } from 'lucide-react';

const REASON_CONFIG = {
  inappropriate: {
    label: 'Inappropriate',
    icon: Ban,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  },
  spam: {
    label: 'Spam',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  },
  notRelevant: {
    label: 'Not Relevant',
    icon: Info,
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
  },
  fake: {
    label: 'Fake Review',
    icon: AlertTriangle,
    className:
      'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800'
  },
  other: {
    label: 'Other',
    icon: Flag,
    className:
      'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
  }
};

interface ReasonBreakdownBadgesProps {
  reasonBreakdown: ReportReasonBreakdown;
  className?: string;
}

export function ReasonBreakdownBadges({ reasonBreakdown, className }: ReasonBreakdownBadgesProps) {
  // Convert breakdown to array and sort by count (descending)
  const reasonEntries = Object.entries(reasonBreakdown)
    .filter(([, count]) => count && count > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));

  if (reasonEntries.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {reasonEntries.map(([reason, count]) => {
        const config = REASON_CONFIG[reason as keyof typeof REASON_CONFIG] || {
          label: reason,
          icon: Flag,
          className:
            'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
        };

        const Icon = config.icon;

        return (
          <Badge
            key={reason}
            variant='outline'
            className={cn(
              'flex items-center gap-1 border px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
              config.className
            )}>
            <span className='font-bold'>{count}×</span>
            <Icon className='h-3 w-3' />
            <span>{config.label}</span>
          </Badge>
        );
      })}
    </div>
  );
}
