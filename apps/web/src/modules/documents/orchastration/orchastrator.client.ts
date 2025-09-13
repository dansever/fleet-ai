import { api } from '@/services/api-client';
import { DocumentProcessorTypes } from './orchastrator.types';
/**
 * Complete document processing orchestrator
 * Handles: Upload → Extract → Save (Document) → Chunk → Embed -> Save (Chunks)
 */
export async function processDocument(
  file: File,
  options: DocumentProcessorTypes.DocumentProcessingOptions,
): Promise<DocumentProcessorTypes.DocumentProcessingResult> {
  const { parentId, parentType, onProgress } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('parentId', parentId);
  formData.append('parentType', parentType);
  formData.append('onProgress', JSON.stringify(onProgress));
  const result = await api.post('/api/documents/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return result.data;
}
