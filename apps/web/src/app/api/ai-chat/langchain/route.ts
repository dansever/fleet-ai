import { createSimpleFleetAIChain, handleChainError } from '@/lib/ai/langchain-integration';
import { UIMessage } from 'ai';
import { NextRequest } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    // Use LangChain for enhanced processing
    const chain = createSimpleFleetAIChain();

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const userInput =
      latestMessage.parts
        ?.filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('') || '';

    // Stream the response
    const stream = await chain.stream({
      input: userInput,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Format the chunk as expected by the AI SDK
            const data = JSON.stringify({
              type: 'text-delta',
              textDelta: chunk,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send the final message
          const finalData = JSON.stringify({
            type: 'finish',
            finishReason: 'stop',
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  } catch (error) {
    console.error('LangChain API error:', error);
    const errorMessage = handleChainError(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
