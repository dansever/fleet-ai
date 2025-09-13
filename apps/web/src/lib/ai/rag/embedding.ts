// src/lib/ai/rag/embedding.ts

import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

const model = openai.textEmbeddingModel('text-embedding-3-small'); // 1536 dims

export async function embedOne(value: string) {
  const { embedding } = await embed({ model, value: value.replaceAll('\n', ' ') });
  return embedding as number[];
}

export async function embedBatch(
  values: string[],
  opts?: { maxParallelCalls?: number; maxRetries?: number },
) {
  const { embeddings } = await embedMany({ model, values, ...opts });
  return embeddings as number[][];
}
