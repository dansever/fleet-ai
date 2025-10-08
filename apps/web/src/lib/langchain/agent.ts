/**
 * Base Agent Framework - LangGraph implementation
 * Generic builder for LLM agents with tools and simple state memory.
 *
 * This framework provides a reusable pattern for creating multi-node LangGraph agents
 * with customizable tools, routing logic, and conversation memory.
 */

import { AIMessage, BaseMessage, SystemMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import { Annotation, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

/**
 * 1. Base State Definition
 *
 * AgentState defines the structure of data that flows through the graph nodes.
 * - messages: Array of conversation messages (HumanMessage, AIMessage, SystemMessage, ToolMessage)
 * - reducer: Concatenates new messages with existing ones, maintaining conversation history
 */
export const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y), // Merge strategy: append new messages to history
  }),
});

// Type helper for TypeScript usage
export type AgentStateType = typeof AgentState.State;

/**
 * 2. Default Routing Logic
 *
 * Determines the next node to execute after the main agent node runs.
 * - If the AI wants to call tools → route to 'tool_node'
 * - Otherwise → end the conversation ('__end__')
 *
 * This enables the agent to loop: main_node → tool_node → main_node → ... → __end__
 */
function defaultRouter(state: AgentStateType): '__end__' | 'tool_node' {
  // Get the most recent message from state
  const last = state.messages.at(-1);

  // Check if it's an AI message with tool calls
  if (last instanceof AIMessage && last.tool_calls?.length) {
    return 'tool_node'; // Execute tools
  }

  // No tools to call, end the conversation
  return '__end__';
}

/**
 * 3. Agent Builder Factory Function
 *
 * Creates a complete LangGraph agent with the following architecture:
 *
 *   START → main_node ⟷ tool_node
 *              ↓
 *           __end__
 *
 * @param opts.systemPrompt - Instructions that guide the AI's behavior
 * @param opts.tools - Array of tool instances the agent can call (optional)
 * @param opts.model - LLM instance (defaults to ChatOpenAI)
 * @param opts.router - Custom routing function (defaults to defaultRouter)
 * @param opts.nodes - Additional custom nodes beyond main_node and tool_node
 * @param opts.edges - Additional custom edges for complex routing
 *
 * @returns Compiled graph and convenience invoke method
 */
export function createAgent(opts: {
  systemPrompt: string;
  tools?: any[];
  model?: ChatOpenAI;
  router?: (state: AgentStateType) => '__end__' | 'tool_node' | string;
  nodes?: Record<string, (state: AgentStateType, cfg: RunnableConfig) => Promise<any>>;
  edges?: { from: string; to: string }[];
}) {
  // Set defaults for optional parameters
  const tools = opts.tools ?? [];
  const router = opts.router ?? defaultRouter;
  const model = opts.model ?? new ChatOpenAI();

  /**
   * Main Agent Node
   *
   * This is the core LLM node that:
   * 1. Binds available tools to the model
   * 2. Prepends the system prompt to guide behavior
   * 3. Invokes the LLM with full conversation history
   * 4. Returns the AI's response (which may include tool calls)
   */
  async function mainNode(state: AgentStateType, cfg: RunnableConfig) {
    // Bind tools so the LLM knows what functions it can call
    const modelWithTools = model.bindTools(tools);

    // Create system message with instructions
    const system = new SystemMessage({ content: opts.systemPrompt });

    // Invoke LLM with: [system prompt, ...conversation history]
    const response = await modelWithTools.invoke([system, ...state.messages], cfg);

    // Return new message (will be concatenated to state.messages by reducer)
    return { messages: [response] };
  }

  /**
   * Graph Construction
   *
   * Build the StateGraph by adding nodes and edges to define the flow
   */
  const graph = new StateGraph(AgentState);

  // Core nodes: main LLM node and tool execution node
  graph.addNode('main_node', mainNode);

  // Only add tool_node if tools are provided (optimization)
  if (tools.length > 0) {
    graph.addNode('tool_node', new ToolNode(tools));
  }

  // Register any additional custom nodes
  if (opts.nodes) {
    for (const [name, fn] of Object.entries(opts.nodes)) {
      graph.addNode(name, fn);
    }
  }

  /**
   * Edge Configuration
   *
   * Defines the flow between nodes:
   * - START → main_node: Entry point
   * - tool_node → main_node: After tool execution, go back to LLM
   * - main_node → [conditional]: Use router to decide next step
   */
  graph.addEdge(START, 'main_node' as any);

  // Only add tool edge if tools exist
  if (tools.length > 0) {
    graph.addEdge('tool_node' as any, 'main_node' as any);
  }

  // Conditional routing from main_node (decides to call tools or end)
  graph.addConditionalEdges('main_node' as any, router as any);

  // Add any additional custom edges for complex workflows
  if (opts.edges) {
    for (const { from, to } of opts.edges) {
      graph.addEdge(from as any, to as any);
    }
  }

  /**
   * Compilation
   *
   * Compile the graph with a MemorySaver checkpointer to enable:
   * - Conversation persistence across invocations
   * - Thread-based memory (using thread_id in config)
   */
  const compiled = graph.compile({ checkpointer: new MemorySaver() });

  // Return compiled graph and convenience wrapper
  return {
    graph: compiled,
    // Helper method: invoke with just messages (wraps them in state object)
    invoke: (messages: BaseMessage[], cfg?: RunnableConfig) => compiled.invoke({ messages }, cfg),
  };
}

/**
 * 4. JSON Result Extractor
 *
 * Extracts structured data from tool execution results in the message history.
 * Useful when tools return JSON objects (e.g., conversions, API responses).
 *
 * Flow:
 * 1. Filters messages to find ToolMessages
 * 2. Gets the most recent tool result
 * 3. Parses JSON if it's a string, or returns object directly
 *
 * @param messages - Array of messages from graph execution
 * @returns Parsed JSON object or null if no tool results found
 */
export function extractJsonResult(messages: any[]): any | null {
  // Find all tool messages (results from tool executions)
  const toolMsgs = messages.filter((m: any) => m._getType?.() === 'tool');

  // No tool results found
  if (!toolMsgs.length) return null;

  try {
    // Get the most recent tool result
    const content = toolMsgs.at(-1).content;

    // Parse if string, otherwise return as-is
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch (err) {
    console.error('Error parsing tool JSON result:', err);
    return null;
  }
}

/**
 * 5. Text Content Extractor
 *
 * Extracts plain text from the final AI message response.
 * Handles multiple content formats:
 * - String content: returned directly
 * - Array content: concatenates text blocks (multimodal messages)
 * - Other: converts to string
 *
 * Useful for displaying AI responses to users.
 *
 * @param messages - Array of messages from graph execution
 * @returns Extracted text content or empty string
 */
export function extractText(messages: any[]): string {
  // Get the most recent message
  const last = messages.at(-1);

  // No content found
  if (!last?.content) return '';

  // Handle string content (most common)
  if (typeof last.content === 'string') return last.content;

  // Handle array content (e.g., multimodal: [{type: 'text', text: '...'}, ...])
  if (Array.isArray(last.content)) {
    return last.content
      .map((c: any) => c?.text ?? '') // Extract text from each block
      .join(' ')
      .trim();
  }

  // Fallback: convert to string
  return String(last.content);
}
