// utils/timer.ts

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
export async function timed<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  } catch (err) {
    const duration = performance.now() - start;
    console.error(`[TIMER] ${label} failed after ${duration.toFixed(2)}ms`);
    throw err;
  }
}
