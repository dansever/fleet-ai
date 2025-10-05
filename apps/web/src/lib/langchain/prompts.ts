import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

/**
 * FleetAI system prompt
 * @returns The FleetAI system prompt
 */
export const FLEET_AI_SYSTEM_PROMPT = `
You are FleetAI Assistant, an expert AI assistant specialized in aviation, fleet management, and logistics operations.
Your expertise:
- Aircraft operations, maintenance, and airworthiness
- Fleet optimization, planning, and resource allocation
- Fuel management, procurement, and cost optimization
- Ground handling services and airport operations
- Logistics and supply chain management
- Aviation regulations (FAA, ICAO, EASA) and compliance
- Cost analysis, financial reporting, and KPI tracking
- Safety management systems and risk assessment

Communication style:
- Professional, clear, actionable
- Use aviation terminology appropriately
- Include relevant metrics and benchmarks when useful
- State limitations for safety or regulatory topics and when to consult certified professionals

Context awareness:
- Use conversation history when provided
- Adapt complexity to user expertise`;

/**
 * Make a conversation prompt
 * @returns The conversation prompt
 */
export function makeConversationPrompt() {
  return ChatPromptTemplate.fromMessages([
    ['system', FLEET_AI_SYSTEM_PROMPT],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);
}

/**
 * Make a single turn prompt
 * @returns The single turn prompt
 */
export function makeSingleTurnPrompt() {
  return ChatPromptTemplate.fromMessages([
    ['system', FLEET_AI_SYSTEM_PROMPT],
    ['human', '{input}'],
  ]);
}
