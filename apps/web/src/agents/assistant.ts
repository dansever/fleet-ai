import { createChatModel, FLEET_AI_SYSTEM_PROMPT } from '@/lib/langchain';
import { SystemMessage } from '@langchain/core/messages';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';

/**
 * FleetAI Assistant Agent
 * A minimal LangGraph agent using the centralized langchain framework
 */

// Create the model using framework utilities
const model = createChatModel({
  model: process.env.ACTIVE_OPENAI_MODEL || 'gpt-4o-mini',
});

// Assistant node: processes messages with FleetAI context
const assistantNode = async (state: typeof MessagesAnnotation.State) => {
  // Ensure system prompt is included
  const messages = state.messages;
  const hasSystemMessage = messages.some((m) => m._getType() === 'system');

  const messagesWithSystem = hasSystemMessage
    ? messages
    : [new SystemMessage(FLEET_AI_SYSTEM_PROMPT), ...messages];

  const response = await model.invoke(messagesWithSystem);
  return { messages: [response] };
};

// Build the state graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode('assistant', assistantNode)
  .addEdge('__start__', 'assistant');

// Compile and export the graph
export const graph = workflow.compile();
