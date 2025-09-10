import type { ExtractionState } from '@/modules/ai/extract';
import { useCallback, useState } from 'react';
import { useDocumentExtraction } from './useDocumentExtraction';
import { useFileUpload } from './useFileUpload';
import { useProgressAnimation } from './useProgressAnimation';

export interface FileProcessingOptions {
  userId: string;
  orgId: string;
  enableStorage?: boolean; // Whether to upload to storage first
  storageBucket?: string;
}

export interface FileProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  fileName?: string;
  error?: string;
  extractionResult?: ExtractionState['result'];
}

export interface FileProcessingResult {
  state: FileProcessingState;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
}

/**
 * Main orchestrator hook that coordinates file upload, extraction, and progress animation
 * This is the single entry point for all file processing business logic
 */
export function useFileProcessing(options: FileProcessingOptions): FileProcessingResult {
  const { userId, orgId, enableStorage = false, storageBucket = 'documents' } = options;

  const [state, setState] = useState<FileProcessingState>({
    status: 'idle',
    progress: 0,
  });

  // Progress animation configuration
  const progressAnimation = useProgressAnimation(
    {
      increment: 2, // 2% every 0.5 seconds
      interval: 500,
      maxProgress: 85,
    },
    (progress) => {
      setState((prev) => ({ ...prev, progress }));
    },
  );

  // File upload hook (optional)
  const fileUpload = useFileUpload({
    bucket: storageBucket,
    onUploadStart: (file) => {
      setState({
        status: 'uploading',
        progress: 0,
        fileName: file.name,
        error: undefined,
      });
      progressAnimation.startAnimation();
    },
    onUploadError: (error) => {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error,
      }));
      progressAnimation.cleanup();
    },
  });

  // Document extraction hook
  const documentExtraction = useDocumentExtraction({
    userId,
    orgId,
    onStatusChange: (status) => {
      setState((prev) => ({
        ...prev,
        status,
      }));
    },
    onExtractionComplete: () => {
      // Stop gradual progress and animate to completion
      progressAnimation.stopAnimation();

      // Get current progress and animate to 100%
      setState((prev) => {
        const currentProgress = prev.progress;

        progressAnimation.animateToCompletion(currentProgress, (animationProgress) => {
          setState((current) => ({
            ...current,
            progress: animationProgress,
          }));
        });

        return prev;
      });

      // Show final result after animation
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          extractionResult: documentExtraction.extractionState.result,
        }));
      }, 1700); // Wait for animation to complete
    },
  });

  const processFile = useCallback(
    async (file: File) => {
      try {
        if (enableStorage) {
          // First upload to storage, then extract
          await fileUpload.uploadFile(file);
          // After storage upload, start extraction
          await documentExtraction.startExtraction(file);
        } else {
          // Direct extraction without storage
          setState({
            status: 'uploading',
            progress: 0,
            fileName: file.name,
            error: undefined,
          });
          progressAnimation.startAnimation();

          await documentExtraction.startExtraction(file);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Processing failed',
        }));
        progressAnimation.cleanup();
      }
    },
    [enableStorage, fileUpload, documentExtraction, progressAnimation],
  );

  const reset = useCallback(() => {
    progressAnimation.cleanup();
    documentExtraction.resetExtraction();
    setState({
      status: 'idle',
      progress: 0,
      fileName: undefined,
      error: undefined,
      extractionResult: undefined,
    });
  }, [progressAnimation, documentExtraction]);

  return {
    state,
    processFile,
    reset,
  };
}
