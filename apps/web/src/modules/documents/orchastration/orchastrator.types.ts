import { DocumentParentType } from '@/drizzle/schema';
import { Document } from '@/drizzle/types';
import { DocumentCreateInput } from '../documents/documents.types';

export namespace DocumentProcessorTypes {
  /**
   * For updating documents from forms - all fields optional
   */
  export type DocumentUpdateInput = Partial<DocumentCreateInput>;

  export interface DocumentProcessingOptions {
    parentId: string;
    parentType: DocumentParentType;
    onProgress?: (step: ProcessingStep, progress: number) => void;
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
    document: Document;
    extractedData?: any;
    chunksCreated: number;
    success: boolean;
    error?: string;
  }
}
