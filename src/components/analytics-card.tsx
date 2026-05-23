import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  value: number;
  variant: 'up' | 'down';
  increaseValue: number;
}

export const AnalyticsCard = ({ title, value, variant, increaseValue }: AnalyticsCardProps) => {
  const isUp = variant === 'up';
  const badgeClass = isUp
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/20'
    : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/20';
  const Icon = isUp ? FaCaretUp : FaCaretDown;

  return (
    <div className="flex w-full flex-col gap-y-2 p-5 bg-card hover:bg-muted/10 transition-colors duration-200">
      <div className="flex items-center justify-between gap-x-2">
        <span className="truncate text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>

        <div className={cn('flex items-center gap-x-0.5 rounded-full border px-2 py-0.5 text-xs font-bold shadow-none', badgeClass)}>
          <Icon className="size-3.5" />
          <span>{increaseValue}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-x-1.5 mt-1">
        <span className="text-4xl font-extrabold tracking-tight text-foreground">{value}</span>
      </div>
    </div>
  );
};
