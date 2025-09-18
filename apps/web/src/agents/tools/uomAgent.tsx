// Improved UOM Agent - Simplified and more focused
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { CurrencyConvertTool } from './currencyTool';
import { UomConvertTool } from './uomTool';

export async function createImprovedUOMAgent() {
  const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  });

  const tools = [new UomConvertTool(), new CurrencyConvertTool()];

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a precision conversion assistant. Your job is to:

1. Analyze the user's conversion request
2. Extract the numeric value and units/currencies
3. Call the appropriate tool (uom_convert for physical units, currency_convert for money)
4. Return the tool's result directly

IMPORTANT: Always call a tool for conversion requests. Do not provide explanations without using tools.

CRITICAL UNIT MAPPINGS FOR SPEED:
- "kph" or "km/h" = kilometers per hour
- "miles per hour" or "mph" = miles per hour (NOT meters per second!)
- "m/s" = meters per second (completely different from mph!)
- "meters per second" = m/s

When user says "miles per hour" they mean mph, NOT m/s!

Examples:
- "40 kph to miles per hour" → call uom_convert with value: 40, fromUnit: "km/h", toUnit: "mph"
- "40 kph to m/s" → call uom_convert with value: 40, fromUnit: "km/h", toUnit: "m/s"
- "100 USD to EUR" → call currency_convert with value: 100, from: "USD", to: "EUR"

Always return the tool's JSON result directly.`,
    ],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);

  const agent = await createOpenAIToolsAgent({ llm, tools, prompt });
  return new AgentExecutor({
    agent,
    tools,
    maxIterations: 3, // Prevent infinite loops
    returnIntermediateSteps: true, // Enable to debug tool calls
  });
}

// Simplified direct conversion function
export async function convertValue(text: string) {
  const executor = await createImprovedUOMAgent();
  const result = await executor.invoke({ input: text });
  return result.output;
}
