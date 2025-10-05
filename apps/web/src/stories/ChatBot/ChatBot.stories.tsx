import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ChatBot, { ChatBotConfig, ChatMessage } from './ChatBot';

const meta: Meta<typeof ChatBot> = {
  title: 'Components/ChatBot',
  component: ChatBot,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A highly customizable ChatBot component that can be used throughout the application for AI interactions.

## Features

- **Two Main Variants**: Full-page and component layouts optimized for different use cases
- **BaseCard Integration**: Uses the standardized BaseCard component for consistent styling
- **Customizable API**: Support for custom endpoints, system prompts, and additional context
- **Rich Configuration**: Extensive styling and behavior options
- **Event Callbacks**: Hook into message events for custom logic
- **Responsive Design**: Adapts to different screen sizes and containers
- **Streaming Support**: Real-time message streaming with loading states
- **Error Handling**: Built-in retry and error display functionality
- **Performance Optimized**: Memoized components and efficient re-rendering

## Variants

- **full**: Full-page layout with sticky header, ideal for dedicated chat pages
- **component**: Standard component size with BaseCard wrapper, perfect for embedded chat with expand/collapse functionality

## Themes

- **default**: Standard rounded corners and spacing
- **minimal**: Clean, minimal design with less rounded corners
- **rounded**: Extra rounded corners for a softer appearance
        `,
      },
    },
  },
  argTypes: {
    config: {
      control: 'object',
      description: 'Configuration object for the ChatBot',
    },
    initialMessages: {
      control: 'object',
      description: 'Initial messages to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the chat is disabled',
    },
    height: {
      control: 'text',
      description: 'Custom height (overrides variant default)',
    },
    width: {
      control: 'text',
      description: 'Custom width',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatBot>;

// Sample messages for stories
const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello! Can you help me with fleet management?',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: '2',
    role: 'assistant',
    content:
      "Hello! I'd be happy to help you with fleet management. I can assist with:\n\n• Aircraft operations and maintenance\n• Fuel management and cost optimization\n• Ground handling services\n• Compliance and safety management\n• Fleet optimization strategies\n\nWhat specific area would you like to discuss?",
    timestamp: new Date(Date.now() - 240000), // 4 minutes ago
  },
  {
    id: '3',
    role: 'user',
    content: 'What are the key metrics I should track for fuel efficiency?',
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
  },
  {
    id: '4',
    role: 'assistant',
    content:
      'Great question! Here are the key fuel efficiency metrics you should track:\n\n**Operational Metrics:**\n• Fuel consumption per flight hour\n• Fuel burn rate by aircraft type\n• Fuel cost per nautical mile\n• Average fuel uplift per flight\n\n**Performance Metrics:**\n• Fuel efficiency trends over time\n• Comparison against industry benchmarks\n• Route-specific fuel consumption\n• Weather impact on fuel usage\n\n**Cost Metrics:**\n• Fuel cost as percentage of total operating costs\n• Fuel price variance analysis\n• Hedging effectiveness\n\nWould you like me to elaborate on any of these metrics?',
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
  },
];

// Default configuration
const defaultConfig: ChatBotConfig = {
  title: 'FleetAI Assistant',
  subtitle: 'Your aviation and fleet management expert',
  assistantName: 'FleetAI',
  placeholder: 'Ask about fleet management, fuel efficiency, or aviation operations...',
};

// Fleet-specific configuration
const fleetConfig: ChatBotConfig = {
  title: 'Fleet Operations Assistant',
  subtitle: 'Optimize your fleet performance',
  assistantName: 'Fleet AI',
  systemPrompt:
    'You are a specialized fleet management assistant focused on aircraft operations, maintenance scheduling, and operational efficiency.',
  placeholder: 'Ask about fleet operations, maintenance, or scheduling...',
  theme: 'rounded',
};

// Fuel management configuration
const fuelConfig: ChatBotConfig = {
  title: 'Fuel Management AI',
  subtitle: 'Optimize fuel costs and efficiency',
  assistantName: 'Fuel AI',
  systemPrompt:
    'You are a fuel management specialist AI. Focus on fuel procurement, cost optimization, efficiency metrics, and market analysis.',
  placeholder: 'Ask about fuel costs, efficiency, or procurement strategies...',
  accentColor: '#10b981', // Green accent
  additionalContext: {
    domain: 'fuel-management',
    expertise: ['procurement', 'cost-optimization', 'efficiency-tracking'],
  },
};

// Airport operations configuration
const airportConfig: ChatBotConfig = {
  title: 'Airport Hub Assistant',
  subtitle: 'Ground operations and logistics support',
  assistantName: 'Hub AI',
  systemPrompt:
    'You are an airport operations specialist. Help with ground handling, logistics, vendor management, and airport-specific operations.',
  placeholder: 'Ask about ground handling, vendors, or airport operations...',
  theme: 'minimal',
  enableRetry: true,
  enableClear: true,
};

// Stories
export const Default: Story = {
  args: {
    config: defaultConfig,
  },
};

export const WithInitialMessages: Story = {
  args: {
    config: defaultConfig,
    initialMessages: sampleMessages,
  },
};

export const FleetOperations: Story = {
  args: {
    config: fleetConfig,
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          'Welcome to Fleet Operations! I can help you with aircraft scheduling, maintenance planning, route optimization, and operational efficiency. What would you like to discuss?',
        timestamp: new Date(),
      },
    ],
  },
};

export const FuelManagement: Story = {
  args: {
    config: fuelConfig,
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          "Hello! I'm your Fuel Management AI. I specialize in fuel cost optimization, procurement strategies, and efficiency analysis. How can I help you reduce fuel costs today?",
        timestamp: new Date(),
      },
    ],
  },
};

export const AirportOperations: Story = {
  args: {
    config: airportConfig,
  },
};

// Variant Stories
export const FullVariant: Story = {
  args: {
    config: {
      ...defaultConfig,
      variant: 'full',
    },
    initialMessages: sampleMessages,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const ComponentVariant: Story = {
  args: {
    config: {
      ...defaultConfig,
      variant: 'component',
    },
    initialMessages: sampleMessages.slice(0, 2),
  },
};

export const ComponentExpanded: Story = {
  args: {
    config: {
      ...defaultConfig,
      variant: 'component',
      title: 'Expandable Chat',
      subtitle: 'Click expand to see more space',
    },
    initialMessages: sampleMessages,
  },
};

// Theme Stories
export const MinimalTheme: Story = {
  args: {
    config: {
      ...defaultConfig,
      theme: 'minimal',
    },
    initialMessages: sampleMessages.slice(0, 2),
  },
};

export const RoundedTheme: Story = {
  args: {
    config: {
      ...defaultConfig,
      theme: 'rounded',
    },
    initialMessages: sampleMessages.slice(0, 2),
  },
};

// Behavior Stories
export const DisabledState: Story = {
  args: {
    config: defaultConfig,
    initialMessages: sampleMessages.slice(0, 2),
    disabled: true,
  },
};

export const NoRetryOrClear: Story = {
  args: {
    config: {
      ...defaultConfig,
      enableRetry: false,
      enableClear: false,
      enableCopy: false,
    },
    initialMessages: sampleMessages.slice(0, 2),
  },
};

export const CustomSizing: Story = {
  args: {
    config: {
      ...defaultConfig,
      variant: 'component',
    },
    height: '500px',
    width: '600px',
    initialMessages: sampleMessages,
  },
};

// Specialized Use Cases
export const CustomerSupport: Story = {
  args: {
    config: {
      title: 'Customer Support',
      subtitle: 'How can we help you today?',
      assistantName: 'Support Agent',
      userLabel: 'Customer',
      placeholder: 'Describe your issue or question...',
      systemPrompt:
        'You are a helpful customer support agent. Be empathetic, solution-focused, and professional.',
      variant: 'component',
      theme: 'rounded',
      accentColor: '#3b82f6', // Blue accent
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          "Hello! I'm here to help you with any questions or issues you may have. What can I assist you with today?",
        timestamp: new Date(),
      },
    ],
  },
};

export const TechnicalSupport: Story = {
  args: {
    config: {
      title: 'Technical Support',
      subtitle: 'Get help with technical issues',
      assistantName: 'Tech Support',
      placeholder: "Describe the technical issue you're experiencing...",
      systemPrompt:
        'You are a technical support specialist. Provide clear, step-by-step solutions and ask for relevant details when needed.',
      variant: 'component',
      maxMessages: 50,
      enableRetry: true,
    },
  },
};

export const RAGEnabled: Story = {
  args: {
    config: {
      title: 'Knowledge Base Assistant',
      subtitle: 'Search and get answers from our knowledge base',
      assistantName: 'Knowledge AI',
      placeholder: 'Search our knowledge base...',
      systemPrompt:
        'You are a knowledge base assistant with access to company documentation. Provide accurate, detailed answers based on the available information.',
      apiEndpoint: '/api/ai-chat/rag', // Custom RAG endpoint
      additionalContext: {
        useRAG: true,
        knowledgeBase: 'company-docs',
        maxRetrievals: 5,
      },
      variant: 'component',
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          'I have access to our complete knowledge base and can help you find specific information from our documentation, policies, and procedures. What would you like to know?',
        timestamp: new Date(),
      },
    ],
  },
};

// Mobile-optimized story
export const MobileOptimized: Story = {
  args: {
    config: {
      ...defaultConfig,
      variant: 'component',
      title: 'Mobile Chat',
    },
    width: '375px', // iPhone width
    height: '600px',
    initialMessages: sampleMessages.slice(0, 3),
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone6',
    },
  },
};
