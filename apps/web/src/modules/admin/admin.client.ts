import { backendApi } from '@/services/api-client';

/**
 * Update extractor agents with the latest schema and system prompt
 * @returns The updated extractor agents
 */
export async function updateExtractors(): Promise<unknown> {
  const response = await backendApi.post<{ data: unknown }>('/api/v1/admin/update_extractors', {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data.data;
}
