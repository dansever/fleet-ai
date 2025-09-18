import type { AIMessageChunk } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { createChatModel } from './model';
import { makeConversationPrompt, makeSingleTurnPrompt } from './prompts';

type ConvInput = { input: string; chat_history: any[] };
type SingleInput = { input: string };

export function makeConversationChain() {
  const model = createChatModel();
  const prompt = makeConversationPrompt();
  const parser = new StringOutputParser();

  return RunnableSequence.from<ConvInput, string>([
    {
      input: (x) => x.input,
      chat_history: (x) => x.chat_history,
    },
    prompt,
    model,
    parser,
  ]);
}

export function makeRawConversationChain() {
  // No StringOutputParser; keep metadata on the AIMessageChunk
  const model = createChatModel();
  const prompt = makeConversationPrompt();
  return RunnableSequence.from<ConvInput, AIMessageChunk>([
    {
      input: (x) => x.input,
      chat_history: (x) => x.chat_history,
    },
    prompt,
    model,
  ]);
}

export function makeSingleTurnChain() {
  const model = createChatModel();
  const prompt = makeSingleTurnPrompt();
  return RunnableSequence.from<SingleInput, AIMessageChunk>([prompt, model]);
}

/**
 * Skeleton for RAG: pass a retriever that returns docs and inject into prompt.
 */
export function makeRAGChain(retriever: {
  getRelevantDocuments: (q: string) => Promise<{ pageContent: string }[]>;
}) {
  const model = createChatModel();
  const prompt = makeSingleTurnPrompt();

  return RunnableSequence.from<{ input: string }, AIMessageChunk>([
    {
      input: async ({ input }) => {
        const docs = await retriever.getRelevantDocuments(input);
        const context = docs.map((d) => d.pageContent).join('\n---\n');
        return { input: `Context:\n${context}\n\nQuestion:\n${input}` };
      },
    },
    prompt,
    model,
  ]);
}
