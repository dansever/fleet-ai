import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Button } from '../Button/Button';

// Confirmation Popover Component for delete actions
export interface ConfirmationPopoverProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  intent?: 'danger' | 'warning' | 'info';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ConfirmationPopover = ({
  trigger,
  title,
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  intent = 'info',
  open,
  onOpenChange,
}: ConfirmationPopoverProps) => {
  if (intent && !['danger', 'warning', 'info'].includes(intent)) {
    return `Invalid intent: ${intent}`;
  }

  const handleConfirm = () => {
    onConfirm();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const intentStyles = {
    danger: {
      gradient: 'from-red-500 to-red-600',
      confirmButton: 'bg-red-500 hover:bg-red-600 text-white',
      icon: '⚠️',
    },
    warning: {
      gradient: 'from-orange-500 to-orange-600',
      confirmButton: 'bg-orange-500 hover:bg-orange-600 text-white',
      icon: '⚠️',
    },
    info: {
      gradient: 'from-blue-500 to-blue-600',
      confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white',
      icon: 'ℹ️',
    },
  };

  const styles = intentStyles[intent];

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 rounded-2xl overflow-hidden shadow-lg border-0"
        align="start"
      >
        {/* Header with intent-based gradient */}
        <div className={cn('bg-gradient-to-r text-white p-4', styles.gradient)}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{styles.icon}</span>
            <div>
              <h4 className="font-semibold text-sm">{title}</h4>
              <p className="text-white/90 text-xs mt-1">{description}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-white">
          <div className="flex gap-2 justify-end">
            <Button intent="secondary" onClick={handleCancel} size="sm" text={cancelText} />
            <Button intent={intent} onClick={handleConfirm} size="sm" text={confirmText} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
