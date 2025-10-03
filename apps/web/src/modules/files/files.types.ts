import { DocumentType } from '@/drizzle/enums';
import { ExtractionAgentName } from '@/lib/constants/extractionAgents';

// Base types for file processing
export interface FileProcessingRequest {
  file: File;
  documentType: DocumentType;
  parentId: string;
  orgId: string;
  userId: string;
}

export interface FileProcessingResult {
  success: boolean;
  documentId?: string;
  extractedData?: Record<string, any>;
  error?: string;
  metadata?: {
    fileSize: number;
    fileName: string;
    processingTime: number;
    extractionAgent: string;
  };
}

export interface ProcessingStep {
  name: string;
  description: string;
  progress: number;
}

export type ProcessingProgressCallback = (step: ProcessingStep, progress: number) => void;

// Processor configuration
export interface ProcessorConfig {
  extractionAgent: ExtractionAgentName;
  requiresChunking: boolean;
  requiresEmbeddings: boolean;
  customValidation?: (file: File) => Promise<boolean>;
  dataTransformer?: (extractedData: any) => any;
}

// Base processor interface
export interface FileProcessor {
  readonly documentType: DocumentType;
  readonly config: ProcessorConfig;

  validate(file: File): Promise<boolean>;
  process(
    request: FileProcessingRequest,
    onProgress?: ProcessingProgressCallback,
  ): Promise<FileProcessingResult>;
  transform(extractedData: any): any;
}

// Processing context passed between steps
export interface ProcessingContext {
  request: FileProcessingRequest;
  documentRecord?: any;
  storageResult?: any;
  parseResult?: any;
  extractResult?: any;
  onProgress?: ProcessingProgressCallback;
}

// Registry for document type processors
export type ProcessorRegistry = Map<DocumentType, FileProcessor>;
