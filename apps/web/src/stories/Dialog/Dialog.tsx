'use client';

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
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../Button/Button';

// Internal dialog mode that represents the current state
type DialogMode = 'viewing' | 'editing' | 'adding';

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
 * - 'add': Opens in adding mode with "Create" and "Reset" buttons → after Create, closes dialog
 * - 'edit': Opens in editing mode with "Save" and "Cancel" buttons → after Save, transitions to viewing mode
 * - 'view': Opens in viewing mode with "Edit" button to switch to editing (then shows Save/Cancel)
 *
 * Features:
 * - Simplified single-state management with DialogMode enum
 * - Smart button rendering with appropriate text and icons
 * - Loading states and error handling
 * - Customizable header gradients and content
 * - TypeScript generics for type-safe data handling
 * - Centralized state reset logic
 *
 * @template T - The type of data being managed by the dialog
 */
// Helper function to convert DialogType to DialogMode
const getInitialMode = (type: 'add' | 'edit' | 'view'): DialogMode => {
  switch (type) {
    case 'add':
      return 'adding';
    case 'edit':
      return 'editing';
    case 'view':
      return 'viewing';
  }
};

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
  // Single state to manage dialog mode
  const [mode, setMode] = useState<DialogMode>(() => getInitialMode(DialogType));
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived state for backward compatibility with children
  const isEditing = mode === 'editing' || mode === 'adding';

  // Centralized state reset function
  const resetToInitialState = useCallback(() => {
    setMode(getInitialMode(DialogType));
    setError(null);
    setIsLoading(false);
  }, [DialogType]);

  // Update mode when DialogType prop changes
  useEffect(() => {
    resetToInitialState();
  }, [resetToInitialState]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open === true) {
      resetToInitialState();
    }
  }, [open, resetToInitialState]);

  // Prop validation - warn about missing required callbacks
  useEffect(() => {
    if (DialogType === 'add' && !onReset) {
      console.warn('DetailDialog: onReset is required for add mode');
    }
    if ((DialogType === 'edit' || DialogType === 'add') && !onSave) {
      console.warn('DetailDialog: onSave is required for edit/add modes');
    }
  }, [DialogType, onReset, onSave]);

  const handleSave = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onSave?.(); // await the parent logic

      // Transition behavior after successful save
      if (mode === 'adding') {
        // After creating, reset the form in the parent and close the dialog
        onReset?.();
        handleOpenChange(false);
      } else if (mode === 'editing') {
        // After editing, transition to viewing mode to show the updated object
        setMode('viewing');
      }
      // Note: 'viewing' mode that becomes editable stays in editing until save/cancel
    } catch (err) {
      // Set error state and keep editing
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    if (mode === 'editing') {
      // If we were editing an existing item, go back to viewing
      setMode('viewing');
    } else if (mode === 'adding') {
      // If we were adding, this shouldn't happen, but reset just in case
      resetToInitialState();
    }
    onCancel?.();
  };

  // Custom onOpenChange handler to reset state when dialog opens/closes
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen === true) {
      // Reset to initial state when opening
      resetToInitialState();
    } else {
      // Reset to initial state when closing, but only call onReset for 'add' mode
      if (DialogType === 'add') {
        onReset?.();
      }
      resetToInitialState();
    }
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  // Render buttons based on current dialog mode
  const renderButtons = () => {
    switch (mode) {
      case 'adding':
        // Adding mode: Create and Reset buttons
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

      case 'editing':
        // Editing mode: Save and Cancel buttons
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

      case 'viewing':
        // Viewing mode: Edit button to switch to editing
        return (
          <Button
            intent="secondaryInverted"
            text="Edit"
            icon={Edit2}
            onClick={() => setMode('editing')}
            disabled={isLoading}
          />
        );

      default:
        return null;
    }
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {typeof children === 'function' ? children(isEditing) : children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
