/**
 * This is the main entry point for the agent.
 * It defines the workflow graph, state, tools, nodes and edges.
 */

import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { Annotation, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// 1. Import necessary helpers for CopilotKit actions
import { createChatModel } from '@/lib/langchain/model';
import { CopilotKitStateAnnotation } from '@copilotkit/sdk-js/langgraph';
import { unitConverterSystemPrompt } from './prompts';
import { currencyConvert } from './tools/currencyTool';
import { uomConvert } from './tools/uomTool';

// 2. Define our agent state, which includes CopilotKit state to
//    provide actions to the state.
export const AgentStateAnnotation = Annotation.Root({
  proverbs: Annotation<string[]>,
  ...CopilotKitStateAnnotation.spec,
});

// 3. Define the type for our agent state
export type AgentState = typeof AgentStateAnnotation.State;

// 4. Put our tools into an array
const tools = [uomConvert, currencyConvert];

// 5. Define the chat node, which will handle the chat logic
async function chat_node(state: AgentState, config: RunnableConfig) {
  // 5.1 Define the model, lower temperature for deterministic responses
  const model = createChatModel();

  // 5.2 Bind the tools to the model, include CopilotKit actions. This allows
  //     the model to call tools that are defined in CopilotKit by the frontend.
  const modelWithTools = model.bindTools!([...(state.copilotkit?.actions ?? []), ...tools]);

  // 5.3 Define the system message, which will be used to guide the model, in this case
  //     we also add in the language to use from the state.
  const systemMessage = new SystemMessage({
    content: unitConverterSystemPrompt,
  });

  // 5.4 Invoke the model with the system message and the messages in the state
  const response = await modelWithTools.invoke([systemMessage, ...state.messages], config);

  // 5.5 Return the response, which will be added to the state
  return {
    messages: response,
  };
}

// 6. Define the function that determines whether to continue or not,
//    this is used to determine the next node to run
function shouldContinue({ messages, copilotkit }: AgentState) {
  // 6.1 Get the last message from the state
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // 6.2 If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const toolCallName = lastMessage.tool_calls![0].name;

    // 6.3 Only route to the tool node if the tool call is not a CopilotKit action
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return 'tool_node';
    }
  }

  // 6.4 Otherwise, we stop (reply to the user) using the special "__end__" node
  return '__end__';
}

// Define the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode('chat_node', chat_node)
  .addNode('tool_node', new ToolNode(tools))
  .addEdge(START, 'chat_node')
  .addEdge('tool_node', 'chat_node')
  .addConditionalEdges('chat_node', shouldContinue as any);

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});

/**
 * Runs the conversion agent with a given input string
 * @param input - The conversion request (e.g., "Convert 100 USD to EUR" or "Convert 5 gallons to liters")
 * @returns The conversion result as an object
 */
export async function runConversionAgent(input: string): Promise<any> {
  try {
    // Create a unique thread ID for this conversion
    const threadId = `conversion-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Invoke the graph with the user message
    const result = await graph.invoke(
      {
        messages: [
          {
            role: 'user',
            content: input,
          },
        ],
      },
      {
        configurable: {
          thread_id: threadId,
        },
        recursionLimit: 10,
      },
    );

    // Extract the last AI message from the result
    const messages = result.messages;
    const lastMessage = messages[messages.length - 1];

    // Check if the last message is an AI message with tool calls
    if (
      'tool_calls' in lastMessage &&
      Array.isArray(lastMessage.tool_calls) &&
      lastMessage.tool_calls.length > 0
    ) {
      // Find the tool message that contains the result
      const toolCallId = lastMessage.tool_calls[0].id;
      const toolMessage = messages.find(
        (msg: any) => msg.type === 'tool' && msg.tool_call_id === toolCallId,
      );

      if (toolMessage) {
        try {
          const content =
            typeof toolMessage.content === 'string'
              ? toolMessage.content
              : JSON.stringify(toolMessage.content);
          return JSON.parse(content);
        } catch {
          const content =
            typeof toolMessage.content === 'string'
              ? toolMessage.content
              : JSON.stringify(toolMessage.content);
          return { value: content, unit: '', explanation: content };
        }
      }
    }

    // If no tool call, return the AI's text response
    if (lastMessage.content) {
      const content =
        typeof lastMessage.content === 'string'
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);
      return {
        value: content,
        unit: '',
        explanation: content,
      };
    }

    throw new Error('No valid response from conversion agent');
  } catch (error) {
    console.error('Error running conversion agent:', error);
    throw error;
  }
}
