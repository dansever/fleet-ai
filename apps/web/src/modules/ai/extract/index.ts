// Document extraction module exports

export * from './extract.client';
export * from './extract.types';

// Server-side functions (only available in server context)
export * from './extract.server';

// Re-export commonly used items
export { extractDocumentData } from './extract.client';
export type { ExtractionResult, ExtractionState } from './extract.types';
