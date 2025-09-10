import { client as storageClient } from '@/modules/storage';
import { useCallback, useState } from 'react';

export interface FileUploadOptions {
  bucket?: string;
  onUploadStart?: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (file: File, uploadResult: any) => void;
  onUploadError?: (error: string) => void;
}

export interface FileUploadResult {
  uploadFile: (file: File) => Promise<any>;
  isUploading: boolean;
  uploadError: string | null;
  lastUploadedFile: File | null;
}

/**
 * Custom hook to handle file upload business logic
 * Separates file upload concerns from extraction and progress animation
 */
export function useFileUpload(options: FileUploadOptions = {}): FileUploadResult {
  const {
    bucket = 'contracts',
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setUploadError(null);
        onUploadStart?.(file);

        // Simulate progress for storage upload (since we don't have real progress)
        onUploadProgress?.(50);

        const result = await storageClient.uploadFileToStorage(file, bucket);

        onUploadProgress?.(100);
        setLastUploadedFile(file);
        onUploadComplete?.(file, result);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadError(errorMessage);
        onUploadError?.(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, onUploadStart, onUploadProgress, onUploadComplete, onUploadError],
  );

  return {
    uploadFile,
    isUploading,
    uploadError,
    lastUploadedFile,
  };
}
