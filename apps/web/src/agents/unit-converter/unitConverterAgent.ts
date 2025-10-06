'use server';

/**
 * Unit Converter Agent - LangGraph implementation
 * Handles unit of measure and currency conversions for aviation fuel and contracts
 */

import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableConfig } from '@langchain/core/runnables';
import { Annotation, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';

import { createOpenAIAgent } from '@/lib/langchain/providers/openai';
import { CurrencyConvertTool } from './tools/currencyTool';
import { UomConvertTool } from './tools/uomTool';

// 1. Define state annotation for the converter agent
export const ConverterStateAnnotation = Annotation.Root({
  /**
   * Input text to parse and convert
   * e.g., "convert 100 liters to gallons" or "2.5 USD/USG to USD/L"
   */
  input: Annotation<string>,
  /**
   * Messages array for agent communication
   */
  messages: Annotation<any[]>({
    reducer: (x, y) => x.concat(y),
  }),
  /**
   * Final conversion result
   */
  result: Annotation<any | null>,
});

// 2. Define the type for our converter state
export type ConverterState = typeof ConverterStateAnnotation.State;

// 3. Define the conversion tools
const tools = [new UomConvertTool(), new CurrencyConvertTool()];

// 4. Define the converter node - processes conversion requests
async function converter_node(state: ConverterState, config: RunnableConfig) {
  // 4.1 Initialize the model with deterministic settings for accurate conversions
  const model = createOpenAIAgent({
    temperature: 0,
    maxTokens: 1000,
  });

  // 4.2 Bind the conversion tools to the model
  const modelWithTools = model.bindTools(tools);

  // 4.3 Define the system message with conversion instructions
  const systemMessage = new SystemMessage({
    content: `You are a conversion assistant for aviation fuel and contracts.

Your job:
1) Parse value, units, currency from the user input
2) Call exactly one tool:
   - uom_convert for units (L, USG, IMPG, bbl, m³, kg, MT, lb, ST) and rate conversions
   - currency_convert for currency amounts (USD to EUR, etc.)

For rate conversions (e.g., "2.3 USD/USG to USD/L"):
- Use uom_convert with fromRateUnit="USD/USG" and toRateUnit="USD/L"
- Set fromUnit and toUnit to the denominator units ("USG" and "L")
- Set value to the rate value (2.3)

Rules:
- Always call a tool to perform the conversion
- Return only the tool's result
- Normalize units: L, USG, IMPG, bbl(42 USG), m³, kg, MT(t), lb, ST
- Normalize currencies: $=USD, €=EUR, £=GBP, ₪=ILS unless context specifies otherwise
- Volume↔mass conversions need density (kg/L). If missing, ask for it.`,
  });

  // 4.4 Invoke the model with the system message and user input
  const response = await modelWithTools.invoke([systemMessage, ...state.messages], config);

  // 4.5 Return the response
  return {
    messages: [response],
  };
}

// 5. Define the result extractor node - extracts final result from tool outputs
function extract_result_node(state: ConverterState) {
  const lastMessage = state.messages[state.messages.length - 1];

  // If we have tool results, parse and return them
  if (lastMessage && lastMessage.tool_calls?.length > 0) {
    // Look for the last tool message with content
    const toolMessages = state.messages.filter((m: any) => m._getType() === 'tool');
    if (toolMessages.length > 0) {
      const lastToolMessage = toolMessages[toolMessages.length - 1];
      try {
        const parsed = JSON.parse(lastToolMessage.content);
        return { result: parsed };
      } catch (error) {
        console.error('Error parsing tool result:', error);
        return {
          result: {
            error: 'PARSING_ERROR',
            message: 'Failed to parse conversion result',
          },
        };
      }
    }
  }

  // If no tool results, return the AI message content
  if (lastMessage && lastMessage.content) {
    return {
      result: {
        value: null,
        unit: null,
        explanation: lastMessage.content,
      },
    };
  }

  return { result: null };
}

// 6. Define routing function - determines next node
function should_continue(state: ConverterState) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

  // If the LLM makes a tool call, route to the tools node
  if (lastMessage.tool_calls?.length) {
    return 'tool_node';
  }

  // Otherwise, extract the result
  return 'extract_result';
}

// 7. Build the workflow graph
const workflow = new StateGraph(ConverterStateAnnotation)
  .addNode('converter_node', converter_node)
  .addNode('tool_node', new ToolNode(tools))
  .addNode('extract_result', extract_result_node)
  .addEdge(START, 'converter_node')
  .addConditionalEdges('converter_node', should_continue as any)
  .addEdge('tool_node', 'converter_node')
  .addEdge('extract_result', '__end__');

// 8. Compile and export the graph
export const graph = workflow.compile();
// Backwards compatibility - keep the old export name
export const unitConverterGraph = graph;

// 9. Convenience function for simple conversions
export async function runConversion(text: string): Promise<{
  value: number;
  unit: string;
  explanation: string;
  meta?: any;
} | null> {
  try {
    const result = await unitConverterGraph.invoke({
      input: text,
      messages: [{ role: 'user', content: text }],
      result: null,
    });

    return result.result;
  } catch (error) {
    console.error('Conversion error:', error);
    return null;
  }
}

// 10. Backwards compatibility alias
export const runConversionAgent = runConversion;
