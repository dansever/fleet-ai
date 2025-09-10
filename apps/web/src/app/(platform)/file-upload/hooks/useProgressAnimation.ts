import { useCallback, useEffect, useRef } from 'react';

export interface ProgressAnimationOptions {
  increment: number; // Progress increment per step (e.g., 2 for 2%)
  interval: number; // Time between increments in ms (e.g., 500 for 0.5s)
  maxProgress: number; // Maximum progress before stopping (e.g., 85)
}

export interface ProgressAnimationResult {
  startAnimation: () => void;
  stopAnimation: () => void;
  animateToCompletion: (currentProgress: number, onProgress: (progress: number) => void) => void;
  cleanup: () => void;
}

/**
 * Custom hook to handle gradual progress animation
 * Advances progress incrementally until a max threshold, then waits for completion signal
 */
export function useProgressAnimation(
  options: ProgressAnimationOptions,
  onProgress: (progress: number) => void,
): ProgressAnimationResult {
  const { increment, interval, maxProgress } = options;
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentProgressRef = useRef(0);

  const cleanup = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (completionTimerRef.current) {
      clearInterval(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    cleanup(); // Clear any existing timers
    currentProgressRef.current = 0;

    progressTimerRef.current = setInterval(() => {
      const newProgress = Math.min(currentProgressRef.current + increment, maxProgress);
      currentProgressRef.current = newProgress;
      onProgress(newProgress);

      if (newProgress >= maxProgress) {
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      }
    }, interval);
  }, [increment, interval, maxProgress, onProgress, cleanup]);

  const stopAnimation = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const animateToCompletion = useCallback(
    (currentProgress: number, onProgressUpdate: (progress: number) => void) => {
      cleanup(); // Clear any existing timers

      const startProgress = currentProgress;
      const animationDuration = 1500; // 1.5 seconds
      const steps = 30; // 30 steps for smooth animation
      const progressIncrement = (100 - startProgress) / steps;
      const stepDuration = animationDuration / steps;

      let currentStep = 0;
      completionTimerRef.current = setInterval(() => {
        currentStep++;
        const newProgress = Math.min(startProgress + currentStep * progressIncrement, 100);

        onProgressUpdate(newProgress);

        if (currentStep >= steps || newProgress >= 100) {
          if (completionTimerRef.current) {
            clearInterval(completionTimerRef.current);
            completionTimerRef.current = null;
          }
        }
      }, stepDuration);
    },
    [cleanup],
  );

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    startAnimation,
    stopAnimation,
    animateToCompletion,
    cleanup,
  };
}
