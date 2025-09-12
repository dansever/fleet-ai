// AI Module Types - Based on backend LLM schemas and LangChain/OpenAI patterns

/**
 * Message roles following OpenAI/LangChain standards
 */
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  TOOL = 'tool',
}

/**
 * AI Model providers supported by the system
 */
export enum ModelProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  LLAMA = 'llama',
}

/**
 * Token usage metrics for AI operations
 */
export interface Usage {
  /** Tokens consumed by the input/prompt */
  inputTokens: number;
  /** Tokens generated in the response */
  outputTokens: number;
  /** Total tokens used (input + output) */
  totalTokens: number;
}

/**
 * Individual message in a conversation
 */
export interface LLMMessage {
  role: MessageRole;
  content: string;
  name?: string;
}

/**
 * Parameters for LLM generation calls
 */
export interface LLMParams {
  /** Conversation history. Takes priority over prompt/system if provided */
  messages?: LLMMessage[];
  /** Shortcut for single user message. Used only if messages is empty */
  prompt?: string;
  /** Optional system instruction. Used only if messages is empty */
  system?: string;
  /** Model to use (defaults to active model) */
  model?: string;
  /** Maximum tokens to generate */
  maxOutputTokens?: number;
  /** Controls randomness (0.0 to 2.0) */
  temperature?: number;
  /** Nucleus sampling parameter (0.0 to 1.0) */
  topP?: number;
  /** Stop sequences */
  stop?: string[];
  /** Enable streaming responses */
  stream?: boolean;
  /** Tool/function definitions if supported */
  tools?: Record<string, any>;
  /** Specific tool to force-select */
  toolChoice?: string;
}

/**
 * Generic LLM result type - follows LangChain pattern
 */
export interface LLMResult<T = string> {
  /** Main response content from the LLM */
  content: T;
  /** Token usage metrics */
  usage: Usage;
  /** Model used for the response */
  model?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Streaming chunk for real-time responses
 */
export interface StreamChunk {
  /** Type of chunk */
  type: 'text-delta' | 'usage' | 'metadata' | 'error';
  /** Text delta for incremental content */
  textDelta?: string;
  /** Usage information */
  usage?: Usage;
  /** Metadata */
  metadata?: Record<string, any>;
  /** Error information */
  error?: string;
}

/**
 * Chat completion request following OpenAI format
 */
export interface ChatCompletionRequest {
  messages: Array<{
    role: string;
    parts: Array<{ type: string; text: string }>;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Error types for AI operations
 */
export interface AIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Configuration for AI chat sessions
 */
export interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  enableStreaming?: boolean;
}
