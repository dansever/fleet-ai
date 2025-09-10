# FleetAI Chat Interface

A robust, production-ready chat interface for FleetAI, built with LangChain for advanced AI capabilities and future extensibility.

## Architecture Decision

**Why LangChain over AI SDK?**

- **RAG Ready**: Built-in support for vector stores and document retrieval
- **Agent Support**: Native tool calling and multi-step reasoning capabilities
- **Extensibility**: Easy to add memory, custom chains, and complex workflows
- **Production Scale**: Better error handling, retry logic, and robustness

## Components

### ChatWindow.tsx (Single, Robust Component)

A comprehensive chat interface featuring:

- **ChatGPT-like UI**: Smooth scrolling, rounded message bubbles, sticky bottom input
- **LangChain Integration**: Streaming responses with robust error handling
- **Professional Design**: FleetAI branding with aviation industry context
- **Future-Ready**: Structured for easy RAG and agent integration

## API Routes

### `/api/ai-chat/langchain/` (Primary)

- LangChain-powered chat responses
- Enhanced FleetAI system prompt with aviation expertise
- Streaming support with proper error handling
- Retry logic and rate limiting awareness
- Structured for future RAG/agent capabilities

## Usage

```tsx
import ChatWindow from './_components/ChatWindow';

export default function MyPage() {
  return (
    <div className="h-screen">
      <ChatWindow />
    </div>
  );
}
```

## Key Features

### LangChain Integration

- **Advanced Prompts**: Detailed FleetAI system prompt with aviation expertise
- **Streaming**: Real-time response streaming with proper buffering
- **Error Handling**: Graceful error recovery with user-friendly messages
- **Extensible**: Ready for RAG, agents, and custom tools

### UI/UX (ChatGPT-inspired)

- **Sticky Bottom Input**: Always accessible input with Enter/Shift+Enter support
- **Smooth Scrolling**: Auto-scroll to latest messages like ChatGPT
- **Message Layout**: Clean, centered layout with proper spacing
- **Loading States**: Professional typing indicators and error states
- **Responsive**: Works on all screen sizes

### FleetAI Specific

- **Aviation Expertise**: Specialized in fleet management, operations, compliance
- **Industry Context**: Understands aviation terminology and processes
- **Professional Tone**: Appropriate for business aviation use cases
- **Safety Awareness**: Acknowledges limitations for critical information

## Future Roadmap

### Phase 1: RAG Integration (Next)

```typescript
// Placeholder already created
export const createRAGFleetAIChain = () => {
  // TODO: Vector store integration
  // TODO: Document retrieval
  // TODO: Context-aware responses
};
```

### Phase 2: Agent Capabilities

```typescript
// Placeholder already created
export const createAgentFleetAIChain = () => {
  // TODO: Tool calling
  // TODO: Multi-step reasoning
  // TODO: External API integration
};
```

### Phase 3: Advanced Features

- Conversation memory persistence
- Multi-modal support (images, documents)
- Real-time data integration
- Custom aviation tools and calculators

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
```

## Dependencies

**Core:**

- `@langchain/openai` - LangChain OpenAI integration
- `@langchain/core` - LangChain core functionality
- `lucide-react` - Icons
- `@/components/ui/*` - shadcn/ui components

**Removed:**

- `@ai-sdk/react` - No longer needed
- `ai` - Replaced with direct LangChain integration

## Performance & Reliability

- **Streaming**: Efficient real-time response rendering
- **Error Recovery**: Automatic retry with exponential backoff
- **Rate Limiting**: Graceful handling of API limits
- **Memory Management**: Efficient message state management
- **Type Safety**: Full TypeScript coverage

This architecture provides a solid foundation for building advanced AI features while maintaining excellent user experience and code maintainability.
