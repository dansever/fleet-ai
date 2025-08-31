import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Edit2, Save, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '../Button/Button';

export interface DetailDialogProps {
  trigger: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode | ((isEditing: boolean) => React.ReactNode);
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
  headerGradient?: string;
  initialEditing?: boolean;
  saveButtonText?: string;
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
  onSave,
  onCancel,
  headerGradient = 'from-violet-600 to-blue-600',
  initialEditing = false,
  saveButtonText = 'Save',
}: DetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [isLoading, setIsLoading] = useState(false);

  // Update editing state when initialEditing prop changes
  useEffect(() => {
    setIsEditing(initialEditing);
  }, [initialEditing]);

  useEffect(() => {
    if (open === true) {
      setIsEditing(initialEditing);
    }
  }, [open, initialEditing]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave?.({}); // await the parent logic
      setIsEditing(false); // leave edit mode only on success
      // optionally: onOpenChange?.(false) if you want to auto-close dialog
    } catch {
      // keep editing; parent already showed a toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    onCancel?.();
  };

  // Custom onOpenChange handler to reset editing state when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen === true) {
      setIsEditing(initialEditing);
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
        onPointerDownOutside={(e) => isLoading && e.preventDefault()}
        aria-describedby={undefined}
        className={cn(
          'min-w-[60vw] sm:min-w-[65vw] md:min-w-[70vw] lg:min-w-[75vw]',
          'max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh]',
          'rounded-xl sm:rounded-2xl md:rounded-3xl',
          'border-0 flex flex-col',
          'p-0 overflow-hidden transition-all duration-300 ease-in-out',
          className,
        )}
      >
        {/* Header with gradient background */}
        <DialogHeader className={`bg-gradient-to-r ${headerGradient} text-white p-6`}>
          <div className="flex items-start justify-between gap-8 ">
            <div className="flex flex-col gap-2 text-left items-start">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl">{title}</DialogTitle>
              {subtitle && (
                <DialogDescription className="text-white/80 text-base">
                  {subtitle}
                </DialogDescription>
              )}
            </div>
            <div className="flex gap-2 mr-4">
              {!isEditing ? (
                <Button
                  intent="secondaryInverted"
                  text="Edit"
                  icon={Edit2}
                  onClick={() => setIsEditing(true)}
                />
              ) : (
                <>
                  <Button
                    intent="success"
                    text={saveButtonText}
                    icon={Save}
                    onClick={handleSave}
                    disabled={isLoading}
                  />
                  <Button
                    intent="danger"
                    text="Cancel"
                    icon={X}
                    onClick={handleCancel}
                    disabled={isLoading}
                  />
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content area with better spacing for sections */}
        <div className="h-auto overflow-y-auto px-4 pb-4">
          {typeof children === 'function' ? children(isEditing) : children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
