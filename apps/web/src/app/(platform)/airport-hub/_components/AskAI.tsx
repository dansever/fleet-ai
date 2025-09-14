'use client';

import ChatBot, { ChatBotConfig } from '@/stories/ChatBot/ChatBot';

export default function AskAI() {
  // Airport Hub specific configuration
  const config: ChatBotConfig = {
    title: 'Airport Hub Assistant',
    subtitle: 'Get help with ground operations, vendors, and logistics',
    assistantName: 'Hub AI',
    placeholder: 'Ask about ground handling, vendors, contracts, or airport operations...',
    variant: 'component',
    theme: 'default',

    // Airport-specific system prompt
    systemPrompt: `You are an Airport Hub Operations Assistant, specialized in helping with:
    
    - Ground handling services and operations
    - Vendor management and relationships  
    - Contract negotiations and management
    - Airport logistics and coordination
    - Regulatory compliance for airport operations
    - Cost optimization for ground services
    - Safety protocols and procedures
    
    Provide specific, actionable advice for airport operations teams. When discussing vendors or contracts, suggest best practices for evaluation and management.`,

    // Use the standard AI chat endpoint
    apiEndpoint: '/api/ai-chat/langchain',

    // Add context specific to airport operations
    additionalContext: {
      domain: 'airport-hub',
      operationType: 'ground-handling',
      userRole: 'operations-manager',
    },

    // Event handlers for airport hub specific tracking
    onMessageSent: (message) => {
      // Track airport hub AI usage
      console.log('Airport Hub AI query:', message.content);
      // Could integrate with analytics here
    },

    onMessageReceived: (message) => {
      // Process airport-specific responses
      if (
        message.content.toLowerCase().includes('vendor') ||
        message.content.toLowerCase().includes('contract')
      ) {
        console.log('Vendor/contract related response generated');
        // Could trigger related UI updates or suggestions
      }
    },

    onError: (error) => {
      console.error('Airport Hub AI error:', error);
      // Could show airport-specific fallback options
    },
  };

  return <ChatBot config={config} />;
}
