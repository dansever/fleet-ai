import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Edit2, Plus, RotateCcw, Save, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '../Button/Button';

export interface DetailDialogProps<T = unknown> {
  // visible to user
  trigger: React.ReactNode;
  headerGradient?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode | ((isEditing: boolean) => React.ReactNode);
  // internal
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: () => Promise<void>; // Parent-controlled save operation
  onCancel?: () => void;
  onReset?: () => void; // Called when Reset button is clicked in add mode
  DialogType: 'add' | 'edit' | 'view';
  className?: string;
}

/**
 * DetailDialog - A generic, reusable dialog component for viewing, editing, and adding objects
 *
 * Button Behavior:
 * - 'add': Opens in edit mode with "Create" and "Reset" buttons → after Create, transitions to view mode
 * - 'edit': Opens in edit mode with "Save" and "Cancel" buttons → after Save, transitions to view mode
 * - 'view': Opens in view mode with "Edit" button to switch to editing (then shows Save/Cancel)
 *
 * Features:
 * - Automatic editing state management based on DialogType
 * - Smart button rendering with appropriate text and icons
 * - Loading states and error handling
 * - Customizable header gradients and content
 * - TypeScript generics for type-safe data handling
 *
 * @template T - The type of data being managed by the dialog
 */
export const DetailDialog = <T = unknown,>({
  trigger,
  headerGradient = 'from-violet-600 to-blue-600',
  title,
  subtitle,
  children,
  DialogType,
  open,
  onOpenChange,
  onSave,
  onCancel,
  onReset,
  className,
}: DetailDialogProps<T>) => {
  // Use internal dialog type state to allow transitions (e.g., add -> view)
  const [currentDialogType, setCurrentDialogType] = useState<'add' | 'edit' | 'view'>(DialogType);

  // Determine initial editing state based on dialog type
  const getInitialEditingState = (dialogType: 'add' | 'edit' | 'view') => {
    return dialogType === 'add' || dialogType === 'edit';
  };

  const [isEditing, setIsEditing] = useState(() => getInitialEditingState(DialogType));
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  // Update internal dialog type and editing state when props change
  useEffect(() => {
    setCurrentDialogType(DialogType);
    const newEditingState = getInitialEditingState(DialogType);
    setIsEditing(newEditingState);
  }, [DialogType]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open === true) {
      setCurrentDialogType(DialogType);
      const newEditingState = getInitialEditingState(DialogType);
      setIsEditing(newEditingState);
    }
  }, [open, DialogType]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave?.(); // await the parent logic

      // Transition behavior after successful save
      if (currentDialogType === 'add') {
        // After creating, reset the form in the parent and close the dialog
        onReset?.();
        handleOpenChange(false);
      } else if (currentDialogType === 'edit') {
        // After editing, transition to view mode to show the updated object
        setCurrentDialogType('view');
        setIsEditing(false);
      } else if (currentDialogType === 'view' && isEditing) {
        // After saving changes in view mode, return to view mode
        setIsEditing(false);
      }
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

  // Custom onOpenChange handler to reset state when dialog opens/closes
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen === true) {
      // Reset to original DialogType when opening
      setCurrentDialogType(DialogType);
      const newEditingState = getInitialEditingState(DialogType);
      setIsEditing(newEditingState);
    } else {
      // Reset to original DialogType when closing to ensure clean state next time
      setCurrentDialogType(DialogType);
      setIsEditing(getInitialEditingState(DialogType));
      onReset?.();
    }
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  // Render buttons based on current dialog type and editing state
  const renderButtons = () => {
    if (currentDialogType === 'add') {
      // Add mode: Create and Reset buttons
      return (
        <>
          <Button
            intent="secondaryInverted"
            text="Reset"
            icon={RotateCcw}
            onClick={() => onReset?.()}
            disabled={isLoading}
          />
          <Button
            intent="success"
            text="Create"
            icon={Plus}
            onClick={handleSave}
            disabled={isLoading}
          />
        </>
      );
    }

    if (currentDialogType === 'edit') {
      // Edit mode: Save and Cancel buttons
      return (
        <>
          <Button
            intent="success"
            text="Save"
            icon={Save}
            onClick={handleSave}
            disabled={isLoading}
          />
          <Button
            intent="secondaryInverted"
            text="Cancel"
            icon={X}
            onClick={handleCancel}
            disabled={isLoading}
          />
        </>
      );
    }

    if (currentDialogType === 'view') {
      if (isEditing) {
        // View mode in editing state: Save and Cancel buttons
        return (
          <>
            <Button
              intent="success"
              text="Save"
              icon={Save}
              onClick={handleSave}
              disabled={isLoading}
            />
            <Button
              intent="secondaryInverted"
              text="Cancel"
              icon={X}
              onClick={handleCancel}
              disabled={isLoading}
            />
          </>
        );
      } else {
        // View mode in display state: Edit button
        return (
          <Button
            intent="secondaryInverted"
            text="Edit"
            icon={Edit2}
            onClick={() => setIsEditing(true)}
          />
        );
      }
    }

    return null;
  };

  return (
    <Dialog open={open ?? internalOpen} onOpenChange={handleOpenChange}>
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
            <div className="flex gap-2 mr-4">{renderButtons()}</div>
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
