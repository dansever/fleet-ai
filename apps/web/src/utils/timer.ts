// utils/timer.ts

import { logger } from '@/lib/core/logger';

/**
 * A utility function to time the execution of a function
 * @param label - The label to use for the timer
 * @param fn - The function to time
 * @returns The result of the function
 * @example
 * const result = await timed('myFunction', () => myFunction());
 * console.log(result);
 */
// lib/utils/timer.ts
export async function timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.info(`[TIMER] ${label} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (err) {
    const duration = performance.now() - start;
    logger.error(`[TIMER] ${label} failed after ${duration.toFixed(2)}ms`);
    throw err;
  }
}
