import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  langGraphPlatformEndpoint,
  OpenAIAdapter,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

const serviceAdapter = new OpenAIAdapter({});
const runtime = new CopilotRuntime({
  remoteEndpoints: [
    langGraphPlatformEndpoint({
      deploymentUrl: 'http://localhost:8000',
      langsmithApiKey: process.env.LANGSMITH_API_KEY || '', // only used in LangGraph Platform deployments
      agents: [
        {
          name: 'assistant_agent',
          description: 'FleetAI main AI assistant (copilot chat assistant).',
        },
      ],
    }),
  ],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
