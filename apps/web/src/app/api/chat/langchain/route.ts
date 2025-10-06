import { LangChainStreamHandler, extractUserInput } from '@/lib/ai/streaming-utils';
import { authenticateUser } from '@/lib/authorization/authenticate-user';
import { jsonError } from '@/lib/core/errors';
import { formatChainError, makeSingleTurnChain } from '@/lib/langchain';
import { recordAiTokenUsageAsync } from '@/services/record-usage';
import { UIMessage } from 'ai';
import { NextRequest } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Get auth context once at the start
    const { dbUser, orgId, error } = await authenticateUser();
    if (error || !dbUser || !orgId) {
      return jsonError('Unauthorized', 401);
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    // Extract user input and create LangChain chain
    const userInput = extractUserInput(messages);
    const chain = makeSingleTurnChain();

    // Stream the response
    const stream = await chain.stream({
      input: userInput,
    });

    // Create stream handler with usage tracking
    const streamHandler = new LangChainStreamHandler(
      // On usage detected
      (usage) => {
        recordAiTokenUsageAsync({
          userId: dbUser.id,
          orgId: orgId,
          totalTokens: usage.total_tokens,
        }).catch((error) => {
          console.error('Failed to record AI token usage:', error);
          // Don't throw - we don't want to break the response for usage tracking issues
        });
      },
      // On error
      (error) => {
        console.error('Stream processing error:', error);
      },
    );

    const readable = streamHandler.createReadableStream(stream);

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  } catch (error) {
    console.error('LangChain API error:', error);
    const errorMessage = formatChainError(error);
    return jsonError(errorMessage, 500);
  }
}
