// Server-side extraction utilities
// Utility functions for server-side extraction operations

import { recordAiTokenUsage } from '@/services/record-usage';
import type { ExtractionResult } from './extract.types';

/**
 * Record extraction usage for billing/analytics
 * This can be called from server components or API routes
 */
export async function recordExtractionUsage(
  result: ExtractionResult,
  userId: string,
  orgId: string,
): Promise<void> {
  if (!result.extraction_metadata?.usage) {
    console.warn('No usage metadata found in extraction result');
    return;
  }

  const totalTokens =
    result.extraction_metadata.usage.num_document_tokens +
    result.extraction_metadata.usage.num_output_tokens;

  await recordAiTokenUsage({
    userId,
    orgId,
    totalTokens,
  });
}
