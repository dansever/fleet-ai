import type { AIMessageChunk } from '@langchain/core/messages';
import type { Runnable } from '@langchain/core/runnables';

/**
 * Stream any runnable to token-level callbacks.
 * - onToken: called for every token chunk
 * - onFinal: called once with the aggregated final message and usage
 * - onError: called on error
 */
export async function streamToCallbacks(
  runnable: Runnable<any, AIMessageChunk>,
  input: any,
  opts: {
    onToken?: (t: string) => void;
    onFinal?: (
      full: AIMessageChunk,
      usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number },
    ) => void;
    onError?: (err: unknown) => void;
    config?: any;
  } = {},
) {
  try {
    const stream = await runnable.stream(input, opts.config);
    let full: AIMessageChunk | undefined;
    for await (const chunk of stream) {
      if (chunk?.content) {
        opts.onToken?.(typeof chunk.content === 'string' ? chunk.content : '');
      }
      full = !full ? chunk : (await import('@langchain/core/utils/stream')).concat(full, chunk);
    }
    const usage = full?.usage_metadata as any | undefined;
    opts.onFinal?.(full!, usage);
  } catch (e) {
    opts.onError?.(e);
  }
}
