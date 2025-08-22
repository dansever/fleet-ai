import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Edit2, Save, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../Button/Button';

export interface DetailDialogProps {
  trigger: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode | ((isEditing: boolean) => React.ReactNode);
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: any) => void;
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
}: DetailDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isLoading) return;
        setIsEditing(false);
        onOpenChange?.(next);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
        onPointerDownOutside={(e) => isLoading && e.preventDefault()}
        aria-describedby={undefined}
        className={cn(
          'min-w-[60vw] sm:min-w-[65vw] md:min-w-[70vw] lg:min-w-[75vw]',
          'max-h-[90vh] sm:max-h-[85vh] md:max-h-[80vh]',
          'rounded-xl sm:rounded-2xl md:rounded-3xl',
          'border-0',
          'p-0 overflow-hidden transition-all duration-300 ease-in-out',
          className,
        )}
      >
        {/* Header with gradient background */}
        <DialogHeader className="bg-gradient-to-r from-violet-600 to-blue-600 text-white p-6">
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
                  intent="secondary"
                  text="Edit"
                  icon={Edit2}
                  className="bg-white/20 text-white rounded-lg hover:bg-white/30 border-1"
                  onClick={() => setIsEditing(true)}
                />
              ) : (
                <>
                  <Button
                    intent="success"
                    text="Save"
                    icon={Save}
                    onClick={handleSave}
                    disabled={isLoading}
                  />
                  <Button
                    intent="danger"
                    text="Cancel"
                    icon={X}
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  />
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content area with better spacing for sections */}
        <div className="p-2 max-h-[70vh] overflow-y-auto bg-gray-50">
          {typeof children === 'function' ? children(isEditing) : children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

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

// Key-Value Pair - For displaying structured information
export const KeyValuePair = ({
  label,
  value,
  className,
  editMode = false,
  onChange,
  name,
}: {
  label: string;
  value: string | number | boolean | React.ReactNode;
  className?: string;
  editMode?: boolean;
  onChange?: (value: string | number | boolean) => void;
  name?: string;
}) => (
  <div
    className={cn(
      'flex items-start py-2 gap-8 border-b border-gray-100 last:border-b-0',
      className,
    )}
  >
    <span className="font-medium text-gray-600 w-1/3">{label}</span>

    <span className="ml-auto text-left w-2/3">
      {editMode ? (
        typeof value === 'string' ? (
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            name={name}
            rows={2}
            className="w-full resize-none min-h-[2.5rem] leading-tight whitespace-pre-wrap break-words"
          />
        ) : typeof value === 'number' ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange?.(e.currentTarget.valueAsNumber)}
            name={name}
            className="w-full"
          />
        ) : typeof value === 'boolean' ? (
          <Switch
            checked={value}
            onCheckedChange={(checked) => onChange?.(checked)} // keep boolean
            name={name}
          />
        ) : (
          value
        )
      ) : typeof value === 'boolean' ? (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ) : (
        value
      )}
    </span>
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
