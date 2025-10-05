// Client-side utilities for file processing

import { FileUploadOptions, FileUploadResponse } from './files.types';

/**
 * Upload and process a file using the unified API
 */
export async function uploadAndProcessFile(
  file: File,
  options: FileUploadOptions,
): Promise<FileUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', options.documentType);
    formData.append('parentId', options.parentId);

    const response = await fetch('/api/file-manager/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Validate file before upload
 */
export function validateFileClient(file: File): { valid: boolean; error?: string } {
  // Basic client-side validation
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF or Word documents.',
    };
  }

  return { valid: true };
}

/**
 * Get supported file types for display
 */
export function getSupportedFileTypes(): string[] {
  return ['PDF', 'DOC', 'DOCX'];
}
