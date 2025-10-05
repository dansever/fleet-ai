/**
 * File Manager Module
 *
 * Unified module for all file and document management operations in FleetAI.
 * Handles storage, document processing, chunking, extraction, and workflows.
 */

// ============================================================================
// Extraction (File Processing & Orchestration)
// ============================================================================
export * as extraction from './extraction';

// Re-export commonly used types from extraction
export type {
  FileProcessingRequest,
  FileProcessingResult,
  FileProcessor,
  FileUploadOptions,
  FileUploadResponse,
  ProcessingStep,
  ProcessorConfig,
} from './extraction/files.types';

// ============================================================================
// Storage Operations
// ============================================================================
export * as storage from './storage';

// ============================================================================
// Document Management
// ============================================================================
export * as documents from './documents';

// Re-export document types
export type { DocumentCreateInput, DocumentUpdateInput } from './documents/documents.types';

// ============================================================================
// Chunks Management
// ============================================================================
export * as chunks from './chunks';

// ============================================================================
// File Processors
// ============================================================================
export * as processors from './processors';

// ============================================================================
// Workflows (High-Level Operations)
// ============================================================================
export * as workflows from './workflows';
export type { DocumentProcessorTypes } from './workflows/orchestrator.types';

// ============================================================================
// Convenience Exports (Backward Compatibility)
// ============================================================================
// Note: No deprecated exports - use the new imports instead
