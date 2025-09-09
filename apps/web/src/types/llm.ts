export interface LLMUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LLMResult<T = string> {
  content: T | string;
  usage: LLMUsage;
}
