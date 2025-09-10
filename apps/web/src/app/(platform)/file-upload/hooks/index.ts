// Main orchestrator hook - use this for most cases
export {
  useFileProcessing,
  type FileProcessingOptions,
  type FileProcessingResult,
} from './useFileProcessing';

// Individual business logic hooks - use for custom implementations
export {
  useDocumentExtraction,
  type DocumentExtractionOptions,
  type DocumentExtractionResult,
} from './useDocumentExtraction';
export { useFileUpload, type FileUploadOptions, type FileUploadResult } from './useFileUpload';
export {
  useProgressAnimation,
  type ProgressAnimationOptions,
  type ProgressAnimationResult,
} from './useProgressAnimation';
