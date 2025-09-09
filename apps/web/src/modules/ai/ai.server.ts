// src/modules/ai/ai.server.ts

'use server';
import 'server-only';

import { getAuthContext } from '@/lib/authorization/get-auth-context';
import { serverEnv } from '@/lib/env/server';
import { LLMResult } from '@/types/llm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY,
});

export async function callLLM(prompt: string): Promise<LLMResult> {
  const { dbUser, orgId, error } = await getAuthContext();
  if (error || !dbUser || !orgId) {
    throw new Error('Unauthorized');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result: LLMResult<string> = {
      content: response.choices[0]?.message?.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };

    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get AI response');
  }
}
