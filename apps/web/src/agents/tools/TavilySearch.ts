import { tool } from '@langchain/core/tools';
import { TavilySearch } from '@langchain/tavily';
import { z } from 'zod';

const tavilySearch = new TavilySearch({
  maxResults: 5,
  topic: 'general',
  includeAnswer: false,
  includeRawContent: false,
  includeImages: false,
  includeImageDescriptions: false,
  searchDepth: 'basic',
  timeRange: 'day',
});

const schema = z.object({
  query: z.string().min(1, 'query is required'),
  searchDepth: z.enum(['basic', 'advanced']).optional(),
  timeRange: z.enum(['day', 'week', 'month', 'year']).optional(),
  includeDomains: z.array(z.string()).min(1).optional(),
  excludeDomains: z.array(z.string()).min(1).optional(),
  includeImages: z.boolean().optional(),
  topic: z.enum(['general', 'news', 'finance']).optional(),
});

type WebSearchArgs = z.infer<typeof schema>;

export const webSearch = tool(
  async (args: WebSearchArgs) => {
    // avoid sending empty arrays or undefined noise
    const cleaned = {
      ...args,
      includeDomains:
        args.includeDomains && args.includeDomains.length ? args.includeDomains : undefined,
      excludeDomains:
        args.excludeDomains && args.excludeDomains.length ? args.excludeDomains : undefined,
    };

    return tavilySearch.invoke(cleaned);
  },
  {
    name: 'web_search',
    description: 'Real-time web search for current info and sources.',
    schema,
  },
);
