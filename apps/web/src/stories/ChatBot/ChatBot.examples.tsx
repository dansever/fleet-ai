/**
 * ChatBot Component Usage Examples
 *
 * This file demonstrates how to use the reusable ChatBot component
 * in different scenarios throughout your application.
 */

import ChatBot, { ChatBotConfig, ChatMessage } from './ChatBot';

// Example 1: Basic Fleet AI Assistant (like the original)
export const FleetAIAssistant = () => {
  const config: ChatBotConfig = {
    title: 'FleetAI Assistant',
    subtitle: 'Your aviation and fleet management expert',
    assistantName: 'FleetAI Assistant',
    placeholder: 'Message FleetAI Assistant... (Press Enter to send, Shift+Enter for new line)',
    variant: 'full-page',
    apiEndpoint: '/api/ai-chat/langchain',
    systemPrompt:
      'You are FleetAI Assistant, an expert AI assistant specialized in aviation, fleet management, and logistics operations.',
  };

  return <ChatBot config={config} />;
};

// Example 2: Sidebar Chat for Airport Hub
export const AirportHubSidebar = () => {
  const config: ChatBotConfig = {
    title: 'Airport Assistant',
    subtitle: 'Quick help with operations',
    assistantName: 'Hub AI',
    variant: 'sidebar',
    apiEndpoint: '/api/ai-chat/langchain',
    systemPrompt:
      'You are an airport operations assistant. Help with ground handling, vendor management, and logistics.',
    placeholder: 'Ask about operations...',
    theme: 'minimal',
    onMessageSent: (message) => {
      console.log('Message sent:', message);
      // Track analytics, update UI, etc.
    },
  };

  return (
    <div className="h-screen w-80 bg-background">
      <ChatBot config={config} />
    </div>
  );
};

// Example 3: Compact Chat Widget for any page
export const CompactChatWidget = () => {
  const config: ChatBotConfig = {
    title: 'Quick Help',
    subtitle: 'Ask a question',
    assistantName: 'AI',
    variant: 'compact',
    placeholder: 'Type your question...',
    enableClear: false, // Disable clear for compact widget
    theme: 'rounded',
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <ChatBot config={config} />
    </div>
  );
};

// Example 4: Fuel Management Specialized Chat
export const FuelManagementChat = () => {
  const config: ChatBotConfig = {
    title: 'Fuel Management AI',
    subtitle: 'Optimize fuel costs and efficiency',
    assistantName: 'Fuel AI',
    variant: 'component',
    apiEndpoint: '/api/ai-chat/fuel-specialist', // Custom endpoint
    systemPrompt:
      'You are a fuel management specialist AI. Focus on fuel procurement, cost optimization, efficiency metrics, and market analysis.',
    placeholder: 'Ask about fuel costs, efficiency, or procurement...',
    accentColor: '#10b981',
    additionalContext: {
      domain: 'fuel-management',
      userRole: 'fuel-manager',
      companyType: 'airline',
    },
    onMessageReceived: (message) => {
      // Log fuel-related queries for analytics
      if (message.content.toLowerCase().includes('fuel')) {
        console.log('Fuel-related query processed');
      }
    },
  };

  const initialMessages: ChatMessage[] = [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome to Fuel Management AI! I can help you with:\n\n• Fuel cost optimization strategies\n• Market price analysis\n• Efficiency metrics tracking\n• Procurement recommendations\n\nWhat would you like to discuss?',
      timestamp: new Date(),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <ChatBot config={config} initialMessages={initialMessages} />
    </div>
  );
};

// Example 5: RAG-Enabled Knowledge Base Chat
export const KnowledgeBaseChat = () => {
  const config: ChatBotConfig = {
    title: 'Knowledge Base',
    subtitle: 'Search company documentation',
    assistantName: 'Knowledge AI',
    variant: 'component',
    apiEndpoint: '/api/ai-chat/rag', // RAG-enabled endpoint
    systemPrompt:
      'You are a knowledge base assistant with access to company documentation. Provide accurate answers based on available information and cite sources when possible.',
    placeholder: 'Search our knowledge base...',
    additionalContext: {
      useRAG: true,
      knowledgeBase: 'company-docs',
      maxRetrievals: 5,
      citeSources: true,
    },
    maxMessages: 50, // Limit for performance
    onError: (error) => {
      console.error('Knowledge base error:', error);
      // Could trigger fallback to regular search
    },
  };

  return <ChatBot config={config} />;
};

// Example 6: Customer Support Chat
export const CustomerSupportChat = () => {
  const config: ChatBotConfig = {
    title: 'Customer Support',
    subtitle: 'How can we help you?',
    assistantName: 'Support Agent',
    userLabel: 'Customer',
    variant: 'component',
    apiEndpoint: '/api/ai-chat/support',
    systemPrompt:
      'You are a helpful customer support agent. Be empathetic, solution-focused, and professional. Escalate complex issues when needed.',
    placeholder: 'Describe your issue...',
    theme: 'rounded',
    accentColor: '#3b82f6',
    additionalContext: {
      supportLevel: 'tier1',
      department: 'customer-service',
    },
    onMessageSent: (message) => {
      // Track support tickets
      console.log('Support message:', message);
    },
  };

  return <ChatBot config={config} />;
};

// Example 7: Mobile-Optimized Chat
export const MobileChatExample = () => {
  const config: ChatBotConfig = {
    title: 'FleetAI Mobile',
    subtitle: 'Tap to chat',
    assistantName: 'AI',
    variant: 'component',
    placeholder: 'Ask anything...',
    theme: 'minimal',
    // Mobile-specific optimizations
    maxMessages: 20, // Limit for performance
    autoFocus: false, // Prevent keyboard popup
  };

  return (
    <div className="h-screen max-w-sm mx-auto bg-background">
      <ChatBot config={config} height="100%" />
    </div>
  );
};

// Example 8: Integration with Context Provider
export const ContextIntegratedChat = () => {
  // This would typically be in a context provider
  const handleMessageSent = (message: ChatMessage) => {
    // Update global state, analytics, etc.
    console.log('Message sent from context:', message);
  };

  const handleError = (error: string) => {
    // Show toast notification, log error, etc.
    console.error('Chat error:', error);
  };

  const config: ChatBotConfig = {
    title: 'Integrated Assistant',
    subtitle: 'Connected to your workflow',
    assistantName: 'Workflow AI',
    variant: 'component',
    onMessageSent: handleMessageSent,
    onError: handleError,
    additionalContext: {
      userId: 'user-123', // From auth context
      orgId: 'org-456', // From org context
      currentPage: 'dashboard', // From router
    },
  };

  return <ChatBot config={config} />;
};

// Example 9: Disabled State (for maintenance, loading, etc.)
export const DisabledChatExample = () => {
  const config: ChatBotConfig = {
    title: 'AI Assistant',
    subtitle: 'Currently under maintenance',
    assistantName: 'AI',
    variant: 'component',
  };

  const maintenanceMessage: ChatMessage[] = [
    {
      id: 'maintenance',
      role: 'assistant',
      content:
        "I'm currently undergoing maintenance and will be back online shortly. Please try again in a few minutes.",
      timestamp: new Date(),
    },
  ];

  return <ChatBot config={config} initialMessages={maintenanceMessage} disabled={true} />;
};

// Example 10: Custom Styled Chat
export const CustomStyledChat = () => {
  const config: ChatBotConfig = {
    title: 'Custom Styled Chat',
    subtitle: 'With custom accent color',
    assistantName: 'Styled AI',
    variant: 'component',
    theme: 'rounded',
    accentColor: '#8b5cf6', // Purple accent
    placeholder: 'Chat with style...',
  };

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <ChatBot config={config} className="shadow-2xl border-purple-200" />
    </div>
  );
};
