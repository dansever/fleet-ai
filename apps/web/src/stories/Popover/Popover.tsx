'use client';

import type React from 'react';

import FileUpload from '@/components/miscellaneous/FileUpload';
import { CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FileText, Send, Upload, X } from 'lucide-react';
import { type ReactNode, useCallback, useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { BaseCard } from '../Card/Card';

interface BasePopoverProps {
  trigger: ReactNode;
  hasHeader?: boolean;
  headerGradient?: string;
  title?: string;
  description?: string;
  popoverContentAlign?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
  className?: string;
}

export const BasePopover = ({
  trigger,
  headerGradient = 'from-sky-500 via-blue-600 to-indigo-500',
  hasHeader = false,
  title,
  description,
  popoverContentAlign = 'end',
  open,
  onOpenChange,
  children,
  className,
}: BasePopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={popoverContentAlign}
        className={cn('p-0 rounded-3xl overflow-hidden border-0 backdrop-blur-sm', className)}
      >
        {hasHeader && (
          <div className={cn(`bg-gradient-to-r ${headerGradient} opacity-80 text-white p-4`)}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold">{title}</h4>
                <p>{description}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-card">
          <div className="flex gap-2 justify-start">{children}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Confirmation Popover Component for direct actions
interface ConfirmationPopoverProps {
  trigger: ReactNode;
  popoverIntent?: 'danger' | 'warning' | 'info';
  title: string;
  description?: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  cancelText?: string;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popoverContentAlign?: 'start' | 'center' | 'end';
}

export const ConfirmationPopover = ({
  trigger,
  popoverIntent = 'info',
  title,
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  onConfirm,
  cancelText = 'Cancel',
  onCancel,
  open,
  onOpenChange,
  popoverContentAlign = 'end',
}: ConfirmationPopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isControlled = open !== undefined;
  const actualOpen = isControlled ? open! : internalOpen;
  const setOpen = (v: boolean) => (isControlled ? onOpenChange?.(v) : setInternalOpen(v));

  if (popoverIntent && !['danger', 'warning', 'info'].includes(popoverIntent)) {
    return `Invalid intent: ${popoverIntent}`;
  }

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onConfirm();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const intentStyles = {
    danger: {
      gradient: 'bg-red-500 opacity-80',
      confirmButton: 'danger' as const,
      icon: '⚠️',
    },
    warning: {
      gradient: 'bg-orange-500 opacity-80',
      confirmButton: 'warning' as const,
      icon: '⚠️',
    },
    info: {
      gradient: 'bg-blue-500 opacity-80',
      confirmButton: 'primary' as const,
      icon: 'ℹ️',
    },
  } as const;

  const styles = intentStyles[popoverIntent];

  return (
    <Popover open={actualOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={popoverContentAlign}
        className="w-80 p-0 rounded-2xl overflow-hidden border-0 backdrop-blur-sm"
      >
        <div className={cn('bg-gradient-to-r text-white p-4', styles.gradient)}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{styles.icon}</span>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold">{title}</h4>
              <p>{description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white">
          <div className="flex gap-2 justify-end">
            <Button
              intent="ghost"
              onClick={handleCancel}
              size="sm"
              text={cancelText}
              disabled={submitting}
            />
            <Button
              intent={styles.confirmButton}
              onClick={handleConfirm}
              size="sm"
              text={confirmText}
              disabled={submitting}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export interface FileUploadPopoverProps {
  onSend?: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  trigger: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popoverContentAlign?: 'start' | 'center' | 'end';
  children?: ReactNode | ((utils: { close: () => void }) => ReactNode);
}

export const FileUploadPopover = ({
  onSend,
  accept = '*/*',
  maxSize = 10,
  className,
  trigger,
  popoverContentAlign = 'end',
  open,
  onOpenChange,
  children,
}: FileUploadPopoverProps) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open! : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  };
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const close = () => setOpen(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }
      setSelectedFile(file);
    },
    [maxSize],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files[0]) handleFileSelect(files[0]);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect],
  );

  const handleSend = async () => {
    if (selectedFile && onSend) {
      setLoading(true);
      await onSend(selectedFile);
      setSelectedFile(null);
      setLoading(false);
      close();
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-3 flex flex-row gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align={popoverContentAlign}
          className={cn(
            'w-80 p-0 rounded-3xl overflow-hidden border-0 bg-white/95 backdrop-blur-sm',
          )}
        >
          <BaseCard
            title={selectedFile ? selectedFile.name : 'Upload Document'}
            subtitle={!selectedFile ? 'Drag and drop or click to select' : undefined}
            headerClassName="text-white from-green-500 to-emerald-500 "
          >
            {!selectedFile ? (
              <CardContent className="space-y-2">
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                    isDragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {isDragOver ? 'Drop your file here' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Maximum file size: {maxSize}MB</p>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {typeof children === 'function' ? children({ close }) : children}
              </CardContent>
            ) : (
              <CardContent className="flex flex-col p-0 bg-white gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <p className="text-sm font-medium text-gray-900 whitespace-break-spaces">
                        {selectedFile?.name}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col space-y-0">
                          <span className="text-zinc-500 dark:text-zinc-400">Size</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {formatFileSize(selectedFile.size)}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-0">
                          <span className="text-zinc-500 dark:text-zinc-400">Type</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {selectedFile.type.split('/')[1].toUpperCase() || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-0">
                          <span className="text-zinc-500 dark:text-zinc-400">Modified</span>
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {new Date(selectedFile.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-col space-y-0">
                          <span className="text-zinc-500 dark:text-zinc-400">Status</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    intent="secondary"
                    onClick={handleCancel}
                    text="Cancel"
                    icon={X}
                    isLoading={loading}
                  />
                  <Button
                    intent="success"
                    onClick={handleSend}
                    text="Upload"
                    icon={Send}
                    isLoading={loading}
                  />
                </div>
              </CardContent>
            )}
          </BaseCard>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const FileUploadPopoverNew = ({
  trigger,
  onSend,
  accept = '*/*',
  maxSize = 10,
  className,
  popoverContentAlign = 'end',
  open,
  onOpenChange,
  children,
}: FileUploadPopoverProps) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open! : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  };
  return (
    <div className={cn('space-y-3 flex flex-row gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          align={popoverContentAlign}
          className={cn(
            'w-full p-0 bg-transparent shadow-none rounded-3xl overflow-hidden border-0',
          )}
        >
          <FileUpload />
        </PopoverContent>
      </Popover>
    </div>
  );
};
