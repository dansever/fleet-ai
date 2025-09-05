import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, LucideIcon, XCircle, Zap } from 'lucide-react';
import type React from 'react';

export type StatusType =
  | 'default'
  | 'secondary'
  | 'secondaryInverted'
  | 'operational'
  | 'pending'
  | 'warning'
  | 'error'
  | 'processing';

export interface StatusBadgeProps {
  status: StatusType;
  text?: string | null;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string | null;
  children?: React.ReactNode;
}

const statusConfig = {
  default: {
    icon: null,
    text: 'Default',
    className: 'bg-secondary/90 text-white',
  },
  secondary: {
    icon: null,
    text: 'Secondary',
    className: 'bg-white text-secondary border-secondary/20',
  },
  secondaryInverted: {
    icon: null,
    text: 'Secondary Inverted',
    className: 'bg-white/60 text-primary border-white/60',
  },
  operational: {
    icon: CheckCircle,
    text: 'Operational',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  pending: {
    icon: Clock,
    text: 'Pending',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  warning: {
    icon: AlertCircle,
    text: 'Warning',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  error: {
    icon: XCircle,
    text: 'Error',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  processing: {
    icon: Zap,
    text: 'Processing',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

const sizeConfig = {
  sm: 'text-xs px-1.5 py-0.5 gap-1',
  md: 'text-sm px-2 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const iconSizeConfig = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'default',
  text,
  size = 'sm',
  icon = null,
  className,
  children,
}) => {
  const config = statusConfig[status];
  const Icon = icon || config.icon;
  const displayText = text || config.text;

  return (
    <Badge
      className={cn(
        'inline-flex items-center font-medium rounded-md border transition-colors',
        config.className,
        sizeConfig[size],
        className,
      )}
    >
      {Icon && <Icon className={iconSizeConfig[size]} />}
      {displayText}
      {children}
    </Badge>
  );
};
