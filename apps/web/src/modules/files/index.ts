// Unified files module exports

// ============================================================================
// Server-side exports
// ============================================================================
export * as server from './files.server';

// ============================================================================
// Client-side exports
// ============================================================================
export * as client from './files.client';

// ============================================================================
// Types (Processing & Upload)
// ============================================================================
export * from './files.types';

// Re-export commonly used types for convenience
export type {
  FileProcessingRequest,
  FileProcessingResult,
  FileUploadOptions,
  FileUploadResponse,
  ProcessingStep,
  ProcessorConfig,
} from './files.types';

// ============================================================================
// Processors
// ============================================================================
export { BaseFileProcessor } from './processors/base.processor';
export { ContractProcessor } from './processors/contract.processor';
export { FuelBidProcessor } from './processors/fuel-bid.processor';
export { QuoteProcessor } from './processors/quote.processor';
export { RfqProcessor } from './processors/rfq.processor';

// ============================================================================
// Storage Sub-module (consolidated from modules/storage)
// ============================================================================
export * as storage from './storage';
