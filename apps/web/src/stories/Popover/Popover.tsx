import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FileText, Send, Upload, X } from 'lucide-react';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { Button } from '../Button/Button';
import { ContentSection } from '../Card/Card';

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
  popoverContentAlign?: 'start' | 'center' | 'end';
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
  popoverContentAlign = 'end',
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
        align={popoverContentAlign}
        className="w-80 p-0 rounded-2xl overflow-hidden shadow-lg border-0"
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

export interface FileUploadPopoverProps {
  onSend?: (file: File) => void;
  secondaryUploadButtonText?: string;
  secondaryUploadButtonIntent?: 'primary' | 'secondary' | 'ghost';
  onSecondaryUploadButton?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  triggerButtonIntent?: 'primary' | 'secondary' | 'ghost';
  triggerButtonText?: string;
  popoverContentAlign?: 'start' | 'center' | 'end';
  buttonSize?: 'sm' | 'md' | 'lg';
}

export const FileUploadPopover = ({
  onSend,
  secondaryUploadButtonText = 'Or Input Data Manually',
  secondaryUploadButtonIntent = 'ghost',
  onSecondaryUploadButton,
  accept = '*/*',
  maxSize = 10,
  className,
  triggerButtonIntent = 'primary',
  triggerButtonText = 'Upload',
  popoverContentAlign = 'end',
  buttonSize = 'md',
}: FileUploadPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
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
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleSend = async () => {
    if (selectedFile && onSend) {
      await onSend(selectedFile);
      setSelectedFile(null);
      setIsOpen(false);
      // setSelectedFile(null);
      // setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setIsOpen(false);
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            intent={triggerButtonIntent}
            text={triggerButtonText}
            icon={Upload}
            size={buttonSize}
          />
        </PopoverTrigger>
        <PopoverContent
          align={popoverContentAlign}
          className="w-80 p-0 rounded-2xl overflow-hidden shadow-lg border-0"
        >
          {!selectedFile ? (
            <>
              {/* Upload Header */}
              <ContentSection
                header={
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5" />
                    <div>
                      <h4 className="font-semibold text-sm">Upload Document</h4>
                      <p className="text-white/90 text-xs mt-1">Drag and drop or click to select</p>
                    </div>
                  </div>
                }
                headerGradient="from-blue-500 to-purple-600"
                children={
                  <div className="space-y-2 ">
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
                            {isDragOver
                              ? 'Drop your file here'
                              : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum file size: {maxSize}MB
                          </p>
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
                    <Button
                      intent={secondaryUploadButtonIntent}
                      onClick={onSecondaryUploadButton}
                      size="md"
                      text={secondaryUploadButtonText}
                      className="justify-center underline w-full"
                    />
                  </div>
                }
              />
            </>
          ) : (
            <>
              {/* File Selected Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold text-sm">File Ready</h4>
                    <p className="text-white/90 text-xs mt-1">Ready to send</p>
                  </div>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4 bg-white">
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    intent="secondary"
                    onClick={handleCancel}
                    size="sm"
                    text="Cancel"
                    icon={X}
                  />
                  <Button intent="success" onClick={handleSend} size="sm" text="Send" icon={Send} />
                </div>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Manual Upload Button */}
    </div>
  );
};
