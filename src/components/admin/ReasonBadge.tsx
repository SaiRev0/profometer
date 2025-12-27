import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { AlertCircle, AlertTriangle, Ban, Flag, Info } from 'lucide-react';

const REASON_CONFIG = {
  inappropriate: {
    label: 'Inappropriate',
    variant: 'destructive' as const,
    icon: Ban,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  },
  spam: {
    label: 'Spam',
    variant: 'destructive' as const,
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
  },
  notRelevant: {
    label: 'Not Relevant',
    variant: 'secondary' as const,
    icon: Info,
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
  },
  fake: {
    label: 'Fake Review',
    variant: 'destructive' as const,
    icon: AlertTriangle,
    className:
      'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800'
  },
  other: {
    label: 'Other',
    variant: 'secondary' as const,
    icon: Flag,
    className:
      'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
  }
};

interface ReasonBadgeProps {
  reason: string;
  showIcon?: boolean;
}

export function ReasonBadge({ reason, showIcon = true }: ReasonBadgeProps) {
  const config = REASON_CONFIG[reason as keyof typeof REASON_CONFIG] || {
    label: reason,
    variant: 'secondary' as const,
    icon: Flag,
    className:
      'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
  };

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn('flex w-fit items-center gap-1.5 border px-2.5 py-1 font-semibold', config.className)}>
      {showIcon && <Icon className='h-3.5 w-3.5' />}
      {config.label}
    </Badge>
  );
}

// Export reason options for use in filters
export const REPORT_REASONS = [
  { value: 'all', label: 'All Reasons' },
  { value: 'inappropriate', label: 'Inappropriate' },
  { value: 'spam', label: 'Spam' },
  { value: 'notRelevant', label: 'Not Relevant' },
  { value: 'fake', label: 'Fake Review' },
  { value: 'other', label: 'Other' }
];
