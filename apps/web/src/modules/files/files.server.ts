'use server';
import 'server-only';

import { DocumentType } from '@/drizzle/enums';
import {
  FileProcessingRequest,
  FileProcessingResult,
  FileProcessor,
  ProcessingProgressCallback,
  ProcessorRegistry,
} from './files.types';
import { ContractProcessor } from './processors/contract.processor';
import { FuelBidProcessor } from './processors/fuel-bid.processor';
import { QuoteProcessor } from './processors/quote.processor';
import { RfqProcessor } from './processors/rfq.processor';

// Initialize processor registry
const processorRegistry: ProcessorRegistry = new Map();

// Register all processors
function initializeProcessors() {
  if (processorRegistry.size === 0) {
    processorRegistry.set('contract', new ContractProcessor());
    processorRegistry.set('fuel_bid', new FuelBidProcessor());
    processorRegistry.set('quote', new QuoteProcessor());
    processorRegistry.set('rfq', new RfqProcessor());
  }
}

/**
 * Get processor for a specific document type
 */
export async function getProcessor(documentType: DocumentType): Promise<FileProcessor> {
  initializeProcessors();

  const processor = processorRegistry.get(documentType);
  if (!processor) {
    throw new Error(`No processor found for document type: ${documentType}`);
  }

  return processor;
}

/**
 * Get all available processors
 */
export async function getAllProcessors(): Promise<FileProcessor[]> {
  initializeProcessors();
  return Array.from(processorRegistry.values());
}

/**
 * Main file processing orchestrator
 * This is the unified entry point for all file processing operations
 */
export async function processFile(
  request: FileProcessingRequest,
  onProgress?: ProcessingProgressCallback,
): Promise<FileProcessingResult> {
  try {
    console.log(`🚀 Starting file processing for ${request.documentType}: ${request.file.name}`);

    // Get the appropriate processor
    const processor = await getProcessor(request.documentType);

    // Validate the file
    const isValid = await processor.validate(request.file);
    if (!isValid) {
      return {
        success: false,
        error: `File validation failed for ${request.documentType}`,
      };
    }

    // Process the file
    const result = await processor.process(request, onProgress);

    console.log(`✅ File processing completed for ${request.documentType}: ${request.file.name}`);
    return result;
  } catch (error) {
    console.error('File processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown processing error',
    };
  }
}

/**
 * Validate file before processing
 */
export async function validateFile(file: File, documentType: DocumentType): Promise<boolean> {
  try {
    const processor = await getProcessor(documentType);
    return await processor.validate(file);
  } catch (error) {
    console.error('File validation error:', error);
    return false;
  }
}

/**
 * Get supported document types
 */
export async function getSupportedDocumentTypes(): Promise<DocumentType[]> {
  initializeProcessors();
  return Array.from(processorRegistry.keys());
}

/**
 * Get processor configuration for a document type
 */
export async function getProcessorConfig(documentType: DocumentType) {
  const processor = await getProcessor(documentType);
  return processor.config;
}
