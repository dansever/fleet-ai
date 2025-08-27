export interface LLMUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface LLMResponse<T = string> {
  content: T | string;
  usage?: LLMUsage;
  model?: string;
}
