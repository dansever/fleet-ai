import { LlamaParserName } from '@/lib/llama/utils';
import { api } from '@/services/api-client';
import 'dotenv/config';

/**
 * This function is used to parse a document using the LlamaCloud API
 * @param file - the file to parse
 * @returns the parsed document
 */
export const parseDocument = async (file: File) => {
  const res = await api.post('/api/llama/parse', {
    file,
    parserName: LlamaParserName,
  });
  return res.data;
};
