# ChatBot Component

A highly customizable, reusable ChatBot component for AI interactions throughout your application.

## Overview

The ChatBot component provides a flexible foundation for implementing AI chat interfaces with support for multiple variants, themes, and configurations. It's designed to work seamlessly with your existing AI infrastructure while providing a consistent user experience.

## Key Features

- **Multiple Variants**: Full-page, component, sidebar, and compact layouts
- **Customizable API Integration**: Support for different endpoints, system prompts, and context
- **Streaming Support**: Real-time message streaming with loading states
- **Event Callbacks**: Hook into message events for analytics and custom logic
- **Responsive Design**: Adapts to different screen sizes and containers
- **Error Handling**: Built-in retry functionality and error display
- **Accessibility**: Keyboard navigation and screen reader support

## Quick Start

```tsx
import ChatBot, { ChatBotConfig } from '@/stories/ChatBot';

const config: ChatBotConfig = {
  title: 'AI Assistant',
  subtitle: 'How can I help you?',
  assistantName: 'AI',
  variant: 'component',
};

export function MyPage() {
  return <ChatBot config={config} />;
}
```

## Configuration Options

### API Configuration

```tsx
const config: ChatBotConfig = {
  apiEndpoint: '/api/ai-chat/custom', // Custom API endpoint
  systemPrompt: 'You are a specialized AI...', // Custom system prompt
  additionalContext: {
    // Extra context for API
    domain: 'fuel-management',
    userRole: 'manager',
  },
};
```

### UI Configuration

```tsx
const config: ChatBotConfig = {
  title: 'Custom Assistant',
  subtitle: 'Specialized help',
  placeholder: 'Ask about...',
  assistantName: 'Specialist AI',
  userLabel: 'Manager',
  variant: 'component', // 'full-page' | 'component' | 'sidebar' | 'compact'
  theme: 'rounded', // 'default' | 'minimal' | 'rounded'
  accentColor: '#10b981', // Custom accent color
};
```

### Behavior Configuration

```tsx
const config: ChatBotConfig = {
  enableRetry: true, // Show retry button on errors
  enableClear: true, // Show clear chat button
  enableCopy: true, // Show copy message buttons
  maxMessages: 100, // Limit message history
  autoFocus: false, // Auto-focus input on mount
};
```

### Event Handlers

```tsx
const config: ChatBotConfig = {
  onMessageSent: (message) => {
    console.log('Message sent:', message);
    // Track analytics, update state, etc.
  },
  onMessageReceived: (message) => {
    console.log('Response received:', message);
    // Process response, update UI, etc.
  },
  onError: (error) => {
    console.error('Chat error:', error);
    // Show notifications, fallback actions, etc.
  },
  onClear: () => {
    console.log('Chat cleared');
    // Clean up state, analytics, etc.
  },
};
```

## Variants

### Full Page

Perfect for dedicated chat pages like the AI Assistant.

```tsx
<ChatBot config={{ variant: 'full-page', ...config }} />
```

### Component

Standard component size (384px height), ideal for embedded chat.

```tsx
<ChatBot config={{ variant: 'component', ...config }} />
```

### Sidebar

Optimized for sidebar layouts with minimal padding.

```tsx
<ChatBot config={{ variant: 'sidebar', ...config }} width="320px" />
```

### Compact

Small height (256px), great for quick interactions.

```tsx
<ChatBot config={{ variant: 'compact', ...config }} />
```

## Common Use Cases

### 1. Specialized Domain Assistant

```tsx
const fuelConfig: ChatBotConfig = {
  title: 'Fuel Management AI',
  assistantName: 'Fuel AI',
  systemPrompt: 'You are a fuel management specialist...',
  apiEndpoint: '/api/ai-chat/fuel-specialist',
  additionalContext: { domain: 'fuel-management' },
};
```

### 2. RAG-Enabled Knowledge Base

```tsx
const ragConfig: ChatBotConfig = {
  title: 'Knowledge Base',
  apiEndpoint: '/api/ai-chat/rag',
  additionalContext: {
    useRAG: true,
    knowledgeBase: 'company-docs',
    maxRetrievals: 5,
  },
};
```

### 3. Customer Support Chat

```tsx
const supportConfig: ChatBotConfig = {
  title: 'Customer Support',
  assistantName: 'Support Agent',
  userLabel: 'Customer',
  systemPrompt: 'You are a helpful support agent...',
  theme: 'rounded',
  accentColor: '#3b82f6',
};
```

### 4. Mobile-Optimized Chat

```tsx
const mobileConfig: ChatBotConfig = {
  variant: 'component',
  maxMessages: 20,
  autoFocus: false,
  theme: 'minimal',
};

<ChatBot config={mobileConfig} height="100vh" width="100%" />;
```

## Integration with Existing Components

### Using with Context Providers

```tsx
function MyComponent() {
  const { user, org } = useAuthContext();

  const config: ChatBotConfig = {
    additionalContext: {
      userId: user.id,
      orgId: org.id,
      currentPage: router.pathname,
    },
    onMessageSent: (message) => {
      trackAnalytics('chat_message_sent', { userId: user.id });
    },
  };

  return <ChatBot config={config} />;
}
```

### Custom Styling

```tsx
<ChatBot config={config} className="shadow-2xl border-purple-200" height="500px" width="600px" />
```

## API Integration

The ChatBot expects your API endpoint to:

1. Accept POST requests with this structure:

```json
{
  "messages": [{ "role": "user", "parts": [{ "type": "text", "text": "Hello" }] }],
  "systemPrompt": "You are...",
  "context": { "additional": "context" }
}
```

2. Return streaming responses in this format:

```
data: {"type": "text-delta", "textDelta": "Hello"}
data: {"type": "text-delta", "textDelta": " there!"}
```

See the existing `/api/ai-chat/langchain` endpoint as a reference implementation.

## TypeScript Support

The component is fully typed with TypeScript:

```tsx
import { ChatMessage, ChatBotConfig, ChatBotProps } from '@/stories/ChatBot';

const message: ChatMessage = {
  id: '1',
  role: 'user',
  content: 'Hello',
  timestamp: new Date(),
};
```

## Accessibility

The component includes:

- Keyboard navigation (Enter to send, Shift+Enter for new line)
- ARIA labels and roles
- Focus management
- Screen reader support
- High contrast support

## Performance Considerations

- Use `maxMessages` to limit memory usage
- Consider `autoFocus: false` for mobile to prevent keyboard popup
- The component handles streaming efficiently to minimize re-renders
- Messages are virtualized for large conversation histories

## Storybook Examples

Run Storybook to see all the configuration examples:

```bash
npm run storybook
```

Navigate to "Components/ChatBot" to explore all variants and configurations.
