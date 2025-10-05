'use client';

import { DocumentType } from '@/drizzle/enums';
import { extraction } from '@/modules/file-manager';
import { Button } from '@/stories/Button/Button';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const filesClient = extraction.client;

interface FileUploadProps {
  documentType: DocumentType;
  parentId: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Unified file upload component that uses the new streamlined file processing API
 * Supports all document types: contracts, fuel_bids, quotes, rfqs
 */
export function FileUpload({
  documentType,
  parentId,
  onSuccess,
  onError,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file on client side
    const validation = filesClient.validateFileClient(file);
    if (!validation.valid) {
      toast.error(validation.error);
      onError?.(validation.error || 'File validation failed');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Use unified file processing API
      const result = await filesClient.uploadAndProcessFile(file, {
        documentType,
        parentId,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      if (result.success) {
        toast.success(`${documentType} file processed successfully!`);
        onSuccess?.(result);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const supportedTypes = filesClient.getSupportedFileTypes();

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        id={`file-upload-${documentType}-${parentId}`}
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      <label htmlFor={`file-upload-${documentType}-${parentId}`}>
        <Button
          intent="primary"
          size="md"
          text={
            isUploading
              ? `Processing... ${uploadProgress}%`
              : `Upload ${documentType.replace('_', ' ')} file`
          }
          icon={Upload}
          disabled={disabled || isUploading}
          isLoading={isUploading}
          className="cursor-pointer"
        />
      </label>

      <div className="mt-2 text-xs text-gray-500">
        Supported formats: {supportedTypes.join(', ')}
      </div>

      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
