import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type React from 'react';

export interface DetailDialogProps {
  trigger: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Detail Dialog - Framework for showing detailed object information
export const DetailDialog = ({
  trigger,
  title,
  subtitle,
  children,
  className,
  open,
  onOpenChange,
}: DetailDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className={cn('max-w-4xl rounded-3xl p-0 overflow-hidden', className)}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          {subtitle && (
            <DialogDescription className="text-white/80 text-base mt-2">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>
      </div>

      {/* Content area with better spacing for sections */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">{children}</div>
    </DialogContent>
  </Dialog>
);

// Info Section - Reusable component for dialog content sections
export const InfoSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('space-y-3', className)}>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <div className="text-gray-600">{children}</div>
  </div>
);

// Key-Value Pair - For displaying structured information
export const KeyValuePair = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0',
      className,
    )}
  >
    <span className="font-medium text-gray-700">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

// Tag List - For displaying badges/tags in dialogs
export const TagList = ({ tags, className }: { tags: string[]; className?: string }) => (
  <div className={cn('flex flex-wrap gap-2', className)}>
    {tags.map((tag, index) => (
      <Badge key={index} variant="outline" className="rounded-full">
        {tag}
      </Badge>
    ))}
  </div>
);

// Dialog Section - Added sectioned card component for organized dialog content
export const DialogSection = ({
  title,
  children,
  className,
  gradient = 'from-violet-500 to-blue-500',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) => (
  <div className={cn('rounded-2xl border border-gray-200 overflow-hidden mb-4', className)}>
    <div className={cn('bg-gradient-to-r text-white px-4 py-3', gradient)}>
      <h4 className="font-semibold text-sm">{title}</h4>
    </div>
    <div className="p-4 bg-white">{children}</div>
  </div>
);
