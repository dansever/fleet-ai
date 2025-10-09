/**
 * This is the main entry point for the agent.
 * It defines the workflow graph, state, tools, nodes and edges.
 */

import { dispatchCustomEvent } from '@langchain/core/callbacks/dispatch';
import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { Annotation, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// 1. Import necessary helpers for CopilotKit actions
import { createChatModel } from '@/lib/langchain/model';
import {
  convertActionsToDynamicStructuredTools,
  CopilotKitStateAnnotation,
} from '@copilotkit/sdk-js/langgraph';
import { webSearch } from '../tools/TavilySearch';
import { getWeather } from '../tools/weather';
import { currencyConvert } from '../unit-converter/tools/currencyTool';
import { uomConvert } from '../unit-converter/tools/uomTool';
import { assistantSystemPrompt } from './prompts';

// 2. Define our agent state, which includes CopilotKit state to
//    provide actions to the state.
export const AgentStateAnnotation = Annotation.Root({
  proverbs: Annotation<string[]>,
  toolSteps: Annotation<Array<{ name: string; status: string }>>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  ...CopilotKitStateAnnotation.spec,
});

// 3. Define the type for our agent state
export type AgentState = typeof AgentStateAnnotation.State;

// 4. Put our tools into an array
const tools = [getWeather, webSearch, uomConvert, currencyConvert];

// 5. Define the chat node, which will handle the chat logic
async function chat_node(state: AgentState, config: RunnableConfig) {
  // 5.1 Define the model, lower temperature for deterministic responses
  const model = createChatModel();

  // 5.2 Bind the tools to the model, include CopilotKit actions. This allows
  //     the model to call tools that are defined in CopilotKit by the frontend.
  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions || []),
    ...tools,
  ]);

  // 5.3 Define the system message, which will be used to guide the model, in this case
  //     we also add in the language to use from the state.
  const systemMessage = new SystemMessage({
    content: assistantSystemPrompt,
  });

  // 5.4 Invoke the model with the system message and the messages in the state
  const response = await modelWithTools.invoke([systemMessage, ...state.messages], config);

  // 5.5 Track tool calls for UI feedback
  const toolSteps: Array<{ name: string; status: string }> = [];
  if (response.tool_calls && response.tool_calls.length > 0) {
    // Add all tool calls as pending
    for (const toolCall of response.tool_calls) {
      toolSteps.push({
        name: toolCall.name,
        status: 'pending',
      });
    }
    // Emit the state with pending tools
    await dispatchCustomEvent(
      'manually_emit_state',
      { ...state, toolSteps, messages: [...state.messages, response] },
      config,
    );
  }

  // 5.6 Return the response, which will be added to the state
  return {
    messages: response,
    toolSteps,
  };
}

// 6. Custom tool node that marks tools as completed
async function custom_tool_node(state: AgentState, config: RunnableConfig) {
  // 6.1 Execute the tools using the standard ToolNode
  const toolNode = new ToolNode(tools);
  const result = await toolNode.invoke(state, config);

  // 6.2 Mark all tools as completed
  const completedToolSteps = state.toolSteps.map((step) => ({
    ...step,
    status: 'completed',
  }));

  // 6.3 Emit the updated state
  await dispatchCustomEvent(
    'manually_emit_state',
    { ...state, toolSteps: completedToolSteps, messages: [...state.messages, ...result.messages] },
    config,
  );

  // 6.4 Return the result with updated tool steps
  return {
    ...result,
    toolSteps: completedToolSteps,
  };
}

// 7. Define the function that determines whether to continue or not,
//    this is used to determine the next node to run
function shouldContinue({ messages, copilotkit }: AgentState) {
  // 7.1 Get the last message from the state
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // 7.2 If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    const actions = copilotkit?.actions;
    const toolCallName = lastMessage.tool_calls![0].name;

    // 7.3 Only route to the tool node if the tool call is not a CopilotKit action
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return 'tool_node';
    }
  }

  // 7.4 Otherwise, we stop (reply to the user) using the special "__end__" node
  return '__end__';
}

// Define the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode('chat_node', chat_node)
  .addNode('tool_node', custom_tool_node)
  .addEdge(START, 'chat_node')
  .addEdge('tool_node', 'chat_node')
  .addConditionalEdges('chat_node', shouldContinue as any);

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});
