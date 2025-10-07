import { DocumentType } from '@/drizzle/schema';
import { Document } from '@/drizzle/types';
import { DocumentCreateInput } from '../documents/documents.types';

export namespace DocumentProcessorTypes {
  /**
   * For updating documents from forms - all fields optional
   */
  export type DocumentUpdateInput = Partial<DocumentCreateInput>;

  export interface DocumentProcessingOptions {
    parentId: string;
    parentType: DocumentType;
    trackProgress?: boolean; // Enable job tracking and status indicator updates
    onProgress?: (progress: number, message: string) => void;
  }

  export interface ProcessingStep {
    name:
      | 'upload'
      | 'parse'
      | 'extract'
      | 'parse_extract'
      | 'update'
      | 'save'
      | 'chunk'
      | 'embed'
      | 'complete';
    description: string;
    progress: number;
  }

  export interface DocumentProcessingResult {
    success: boolean;
    documentId?: string;
    document?: Document;
    extractedData?: any;
    chunksCreated?: number;
    error?: string;
    metadata?: {
      fileSize: number;
      fileName: string;
      processingTime: number;
      extractionAgent: string;
    };
  }
}
