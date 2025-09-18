// Improved UOM Agent - using centralized OpenAI provider
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';

import { createOpenAIAgent } from '@/lib/langchain/providers/openai';
import { CurrencyConvertTool } from './tools/currencyTool';
import { UomConvertTool } from './tools/uomTool';

let _unitConverterAgent: AgentExecutor | null = null;

function makePrompt() {
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a conversion assistant for aviation fuel and contracts.
Your job:
1) Parse value, units, currency. 2) Call exactly one tool:
- uom_convert for units (L, USG, IMPG, bbl, m³, kg, MT, lb, ST) and rate conversions (USD/USG to USD/L, USD/MT to USD/kg).
- currency_convert for currency amounts (USD to EUR, etc.).

For rate conversions (e.g., "2.3 USD/USG to USD/L"):
- Use uom_convert with fromRateUnit="USD/USG" and toRateUnit="USD/L"
- Set fromUnit and toUnit to the denominator units ("USG" and "L")
- Set value to the rate value (2.3)

Rules:
- Always call a tool; return only the tool's JSON result.
- Normalize: L, USG, IMPG, bbl(42 USG), m3, kg, MT(t), lb, ST; $=USD, €=EUR, £=GBP, ₪=ILS unless context says otherwise.
- Volume↔mass needs density (e.g., kg/L). If missing, ask once for it.`,
    ],
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);
}

async function getExecutor(): Promise<AgentExecutor> {
  if (_unitConverterAgent) return _unitConverterAgent;
  const llm = createOpenAIAgent({ temperature: 0 });
  const tools = [new UomConvertTool(), new CurrencyConvertTool()];
  const prompt = makePrompt();

  const agent = await createOpenAIToolsAgent({ llm, tools, prompt });
  _unitConverterAgent = new AgentExecutor({
    agent,
    tools,
    maxIterations: 3,
    returnIntermediateSteps: true,
  });
  return _unitConverterAgent;
}

// Public API — single entry point you call from the app
export async function runConversionAgent(text: string): Promise<{
  value: number;
  unit: string;
  explanation: string;
  meta: {
    fromUnit: string;
    toUnit: string;
    precision: number;
    intermediateConversion: string;
  } | null;
} | null> {
  try {
    const executor = await getExecutor();
    const result = await executor.invoke({ input: text });
    console.log('result:', result);
    const raw = result.output;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    console.error('Error parsing conversion result:', error);
    return null;
  }
}
