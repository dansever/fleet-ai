/**
 * Stream callbacks
 * @param onToken - The on token callback
 * @param onFinal - The on final callback
 * @param onError - The on error callback
 */
export type StreamCallbacks = {
  onToken?: (t: string) => void;
  onFinal?: (usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  }) => void;
  onError?: (e: unknown) => void;
};
