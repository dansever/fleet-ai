import { api } from '@/services/api-client';
import { DocumentProcessorTypes } from './orchestrator.types';

/**
 * Complete document processing orchestrator using unified file processing API
 * Handles: Upload → Extract → Save (Document) → Chunk → Embed -> Save (Chunks)
 */
export async function processDocument(
  file: File,
  options: DocumentProcessorTypes.DocumentProcessingOptions,
): Promise<DocumentProcessorTypes.DocumentProcessingResult> {
  const { parentId, parentType, onProgress } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', parentType);
  formData.append('parentId', parentId);

  // Use unified file processing endpoint
  const result = await api.post('/api/file-manager/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return result.data;
}
