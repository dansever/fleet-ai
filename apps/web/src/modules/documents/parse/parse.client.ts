// src/services/parse.ts

import { api } from '@/services/api-client';

/**
 * Upload and parse a file via the /api/parse endpoint
 * @param file - The File object to send
 * @returns parsed content from the API
 */
export async function parseFile(file: File) {
  const fd = new FormData();
  fd.append('file', file);

  const res = await api.post('/api/parse', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (x) => x, // avoid JSON serialization
  });
  const parsedCombinedText = res.data.map((part: any) => part.text).join('\n');
  console.log('✅✅✅✅ Parsed combined text', parsedCombinedText);

  return res.data;
}
