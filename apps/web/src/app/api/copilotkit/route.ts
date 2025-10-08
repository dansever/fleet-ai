import { getServiceAdapter } from '@/lib/dynamic-service-adapters';
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  langGraphPlatformEndpoint,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';

/**
 * Service adapter
 */
const serviceAdapter = await getServiceAdapter('openai');

/**
 * Copilot runtime
 */
const runtime = new CopilotRuntime({
  remoteEndpoints: [
    langGraphPlatformEndpoint({
      deploymentUrl: process.env.LANGRAPH_DEPLOYMENT_URL || '',
      langsmithApiKey: process.env.LANGSMITH_API_KEY,
      agents: [
        {
          name: 'assistant_agent',
          description: 'Main AI assistant',
        },
        {
          name: 'uom_converter_agent',
          description: 'UOM converter assistant.',
        },
      ],
    }),
  ],
});

/**
 * CopilotKit API endpoint
 * @param req - NextRequest
 * @returns
 */
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
