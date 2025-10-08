/**
 * Dynamically get the service adapter for the given model provider
 * @param name
 * @returns
 */
export async function getServiceAdapter(name: string) {
  switch (name) {
    case 'openai':
      return getOpenAIAdapter();
    case 'anthropic':
      return getAnthropicAdapter();
    case 'gemini':
      return getGeminiAdapter();
    case 'langchain_openai':
      return getLangChainOpenAIAdapter();
    case 'bedrock':
      return getBedrockAdapter();
    default:
      throw new Error(`Service adapter "${name}" not found`);
  }
}

async function getOpenAIAdapter() {
  const { OpenAIAdapter } = await import('@copilotkit/runtime');
  return new OpenAIAdapter();
}

async function getAnthropicAdapter() {
  const { AnthropicAdapter } = await import('@copilotkit/runtime');
  return new AnthropicAdapter({ model: 'claude-3-7-sonnet-20250219' });
}

async function getGeminiAdapter() {
  const { GoogleGenerativeAIAdapter } = await import('@copilotkit/runtime');
  return new GoogleGenerativeAIAdapter();
}

async function getLangChainOpenAIAdapter() {
  const { LangChainAdapter } = await import('@copilotkit/runtime');
  const { ChatOpenAI } = await import('@langchain/openai');
  return new LangChainAdapter({
    chainFn: async ({ messages, tools, threadId }) => {
      const model = new ChatOpenAI({ modelName: 'gpt-4-1106-preview' }).bindTools(tools, {
        strict: true,
      });
      return model.stream(messages, { tools, metadata: { conversation_id: threadId } });
    },
  });
}

async function getBedrockAdapter() {
  const { BedrockAdapter } = await import('@copilotkit/runtime');
  return new BedrockAdapter();
}
