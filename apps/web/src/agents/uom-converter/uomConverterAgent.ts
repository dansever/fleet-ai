/**
 * Unit Converter Agent - LangGraph implementation
 * Handles unit of measure and currency conversions for aviation fuel and contracts
 */

import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { Annotation, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';

import { unitConverterSystemPrompt } from './prompts';
import { CurrencyConvertTool } from './tools/currencyTool';
import { UomConvertTool } from './tools/uomTool';

// 1. Define state annotation for the converter agent (similar to conversation agent)
export const ConverterStateAnnotation = Annotation.Root({
  /**
   * Messages array for agent communication
   */
  messages: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

// 2. Define the type for our converter state
export type ConverterState = typeof ConverterStateAnnotation.State;

// 3. Define the conversion tools
const tools = [new UomConvertTool(), new CurrencyConvertTool()];

// 4. Define the converter node - processes conversion requests (follows chat_node pattern)
async function converter_node(state: ConverterState, config: RunnableConfig) {
  // 4.1 Initialize the model with deterministic settings for accurate conversions
  const model = new ChatOpenAI({ temperature: 0, model: 'gpt-4o' });

  // 4.2 Bind the conversion tools to the model
  const modelWithTools = model.bindTools(tools);

  // 4.3 Define the system message with conversion instructions
  const systemMessage = new SystemMessage({
    content: unitConverterSystemPrompt,
  });

  // 4.4 Invoke the model with the system message and messages from state
  const response = await modelWithTools.invoke([systemMessage, ...state.messages], config);

  // 4.5 Return the response
  return {
    messages: response,
  };
}

// 5. Define routing function - determines next node (follows shouldContinue pattern)
function should_continue(state: ConverterState) {
  // 5.1 Get the last message from the state
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

  // 5.2 If the LLM makes a tool call, route to the tools node
  if (lastMessage.tool_calls?.length) {
    return 'tool_node';
  }

  // 5.3 Otherwise, we stop (reply to the user)
  return '__end__';
}

// 6. Build the workflow graph (follows conversation agent pattern)
const workflow = new StateGraph(ConverterStateAnnotation)
  .addNode('converter_node', converter_node)
  .addNode('tool_node', new ToolNode(tools))
  .addEdge(START, 'converter_node')
  .addEdge('tool_node', 'converter_node')
  .addConditionalEdges('converter_node', should_continue as any);

const memory = new MemorySaver();

// 7. Compile and export the graph with memory checkpointing
export const graph = workflow.compile({
  checkpointer: memory,
});
// Backwards compatibility - keep the old export name
export const unitConverterGraph = graph;

// 8. Helper function to extract conversion result from messages
function extractConversionResult(messages: any[]): {
  value: number;
  unit: string;
  explanation: string;
  meta?: any;
} | null {
  // Look for tool messages (which contain the conversion results)
  const toolMessages = messages.filter((m: any) => m._getType() === 'tool');

  if (toolMessages.length > 0) {
    const lastToolMessage = toolMessages[toolMessages.length - 1];
    try {
      const parsed = JSON.parse(lastToolMessage.content);
      return parsed;
    } catch (error) {
      console.error('Error parsing tool result:', error);
      return null;
    }
  }

  // If no tool messages, check for AI message content
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.content) {
    return {
      value: 0,
      unit: '',
      explanation: lastMessage.content,
    };
  }

  return null;
}

// 9. Convenience function for simple conversions (backwards compatibility)
export async function runConversion(text: string): Promise<{
  value: number;
  unit: string;
  explanation: string;
  meta?: any;
} | null> {
  try {
    // Create a proper HumanMessage instead of plain object
    const result = await unitConverterGraph.invoke({
      messages: [new HumanMessage(text)],
    });

    return extractConversionResult(result.messages);
  } catch (error) {
    console.error('Conversion error:', error);
    return null;
  }
}

// 10. Backwards compatibility alias
export const runConversionAgent = runConversion;
