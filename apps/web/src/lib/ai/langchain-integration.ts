import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';

// Initialize the LangChain OpenAI model with optimal settings
export const createLangChainModel = () => {
  return new ChatOpenAI({
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2000, // Increased for more detailed responses
    streaming: true,
    // Add retry logic for robustness
    maxRetries: 3,
  });
};

// Enhanced FleetAI system prompt with better context
export const FLEET_AI_SYSTEM_PROMPT = `You are FleetAI Assistant, an expert AI assistant specialized in aviation, fleet management, and logistics operations. 

**Your Expertise:**
- Aircraft operations, maintenance, and airworthiness
- Fleet optimization, planning, and resource allocation
- Fuel management, procurement, and cost optimization
- Ground handling services and airport operations
- Logistics and supply chain management
- Aviation regulations (FAA, ICAO, EASA) and compliance
- Cost analysis, financial reporting, and KPI tracking
- Safety management systems and risk assessment

**Your Communication Style:**
- Professional yet approachable
- Provide specific, actionable insights
- Use aviation industry terminology appropriately
- Include relevant metrics and benchmarks when possible
- Acknowledge limitations and suggest when to consult specialists

**Context Awareness:**
- Remember conversation history for continuity
- Build upon previous questions and answers
- Adapt complexity based on user expertise level

If you're unsure about critical safety or regulatory information, clearly state your limitations and recommend consulting with certified professionals or official sources.`;

// Create a conversational prompt template with memory
export const createFleetAIPrompt = () => {
  return ChatPromptTemplate.fromMessages([
    ['system', FLEET_AI_SYSTEM_PROMPT],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);
};

// Create the main FleetAI chain with conversation memory
export const createFleetAIChain = () => {
  const model = createLangChainModel();
  const prompt = createFleetAIPrompt();
  const outputParser = new StringOutputParser();

  return RunnableSequence.from([
    {
      input: (input: { input: string; chat_history: any[] }) => input.input,
      chat_history: (input: { input: string; chat_history: any[] }) => input.chat_history,
    },
    prompt,
    model,
    outputParser,
  ]);
};

// Simple chain for single queries (current implementation)
export const createSimpleFleetAIChain = () => {
  const model = createLangChainModel();
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', FLEET_AI_SYSTEM_PROMPT],
    ['human', '{input}'],
  ]);
  const outputParser = new StringOutputParser();

  return RunnableSequence.from([prompt, model, outputParser]);
};

// Convert UI messages to LangChain format with better handling
export const convertUIMessagesToLangChain = (messages: any[]) => {
  return messages.map((message) => {
    const content =
      message.parts
        ?.filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('') ||
      message.content ||
      '';

    switch (message.role) {
      case 'user':
        return new HumanMessage(content);
      case 'assistant':
        return new AIMessage(content);
      case 'system':
        return new SystemMessage(content);
      default:
        return new HumanMessage(content);
    }
  });
};

// Future: RAG-enabled chain (placeholder for when you add vector stores)
export const createRAGFleetAIChain = () => {
  // TODO: Implement when adding RAG capabilities
  // Will include vector store retrieval, document processing, etc.
  const model = createLangChainModel();
  return model;
};

// Future: Agent-enabled chain (placeholder for when you add agents)
export const createAgentFleetAIChain = () => {
  // TODO: Implement when adding agent capabilities
  // Will include tool calling, multi-step reasoning, etc.
  const model = createLangChainModel();
  return model;
};

// Utility function for error handling in chains
export const handleChainError = (error: any) => {
  console.error('LangChain error:', error);

  if (error.message?.includes('rate limit')) {
    return "I apologize, but I'm currently experiencing high demand. Please try again in a moment.";
  }

  if (error.message?.includes('timeout')) {
    return 'The request took too long to process. Please try again with a shorter question.';
  }

  return 'I encountered an issue processing your request. Please try again or rephrase your question.';
};
