/**
 * Format a chain error
 * @param error - The error to format
 * @returns The formatted error
 */
export function formatChainError(error: any): string {
  const msg = String(error?.message ?? error);
  if (msg.toLowerCase().includes('rate limit')) {
    return 'High demand right now. Please retry shortly.';
  }
  if (msg.toLowerCase().includes('timeout')) {
    return 'The request timed out. Try a shorter query or retry.';
  }
  return 'Something went wrong. Please retry or rephrase your question.';
}
