import { extractDocumentData, type ExtractionState } from '@/modules/ai/extract';
import { useCallback, useState } from 'react';

export interface DocumentExtractionOptions {
  userId: string;
  orgId: string;
  onProgressUpdate?: (progress: number) => void;
  onStatusChange?: (status: ExtractionState['status']) => void;
  onExtractionComplete?: () => void;
}

export interface DocumentExtractionResult {
  extractionState: ExtractionState;
  startExtraction: (file: File) => Promise<void>;
  resetExtraction: () => void;
  isExtracting: boolean;
}

/**
 * Custom hook to handle document extraction business logic
 * Separates extraction concerns from UI progress animation
 */
export function useDocumentExtraction(
  options: DocumentExtractionOptions,
): DocumentExtractionResult {
  const { userId, orgId, onProgressUpdate, onStatusChange, onExtractionComplete } = options;

  const [extractionState, setExtractionState] = useState<ExtractionState>({
    status: 'idle',
  });

  const startExtraction = useCallback(
    async (file: File) => {
      try {
        // Set initial uploading state
        setExtractionState({
          status: 'uploading',
          fileName: file.name,
        });
        onStatusChange?.('uploading');

        // Update to processing status after a brief delay
        setTimeout(() => {
          setExtractionState((prev) => ({
            ...prev,
            status: 'processing',
          }));
          onStatusChange?.('processing');
        }, 2000); // Switch to processing after 2 seconds

        // Start the extraction process
        const result = await extractDocumentData(file, undefined, userId, orgId);

        // Extraction completed successfully
        setExtractionState({
          status: 'completed',
          result: result,
          fileName: file.name,
        });

        // Notify completion
        onExtractionComplete?.();
      } catch (error) {
        console.error('Extraction process failed:', error);
        setExtractionState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
        onStatusChange?.('error');
      }
    },
    [userId, orgId, onStatusChange, onExtractionComplete],
  );

  const resetExtraction = useCallback(() => {
    setExtractionState({ status: 'idle' });
    onStatusChange?.('idle');
  }, [onStatusChange]);

  const isExtracting =
    extractionState.status === 'uploading' || extractionState.status === 'processing';

  return {
    extractionState,
    startExtraction,
    resetExtraction,
    isExtracting,
  };
}
