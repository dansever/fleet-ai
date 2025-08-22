import { cn } from '@/lib/utils';
import type * as React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

export function GlassCard({ children, className, highlight = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/5 bg-white/25 backdrop-blur-sm shadow-sm',
        highlight && 'border-primary/20 bg-primary/5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
