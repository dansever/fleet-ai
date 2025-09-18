// Improved UOM Parser - Better extraction and validation
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

const ParsedConversionSchema = z.object({
  kind: z.enum(['unit', 'currency']),
  value: z.number().positive('Value must be positive'),
  from: z.string().min(1, 'Source unit/currency is required'),
  to: z.string().min(1, 'Target unit/currency is required'),
  confidence: z.number().min(0).max(1).optional(), // Add confidence scoring
});

export type ParsedConversion = z.infer<typeof ParsedConversionSchema>;

const parser = new StructuredOutputParser(ParsedConversionSchema);

const prompt = new PromptTemplate({
  inputVariables: ['input'],
  template: `Extract conversion intent from user input with high precision.

RULES:
- For currency: use ISO 4217 codes (USD, EUR, GBP, etc.)
- For units: use standard abbreviations (m, km, ft, in, kg, lb, l, ml, C, F, K, etc.)
- Set confidence to 0.9+ for clear conversions, lower for ambiguous cases
- If unclear, prefer 'unit' over 'currency'

Return only valid JSON matching this schema:
{format_instructions}

Examples:
"Convert 100 USD to EUR" → {"kind": "currency", "value": 100, "from": "USD", "to": "EUR", "confidence": 0.95}
"5 feet to meters" → {"kind": "unit", "value": 5, "from": "ft", "to": "m", "confidence": 0.9}
"25°C to Fahrenheit" → {"kind": "unit", "value": 25, "from": "C", "to": "F", "confidence": 0.9}

User input: {input}`,
});

export async function parseConversionInput(
  llm: ChatOpenAI,
  text: string,
): Promise<ParsedConversion> {
  const chain = prompt.pipe(llm).pipe(parser);
  return await chain.invoke({ input: text });
}

// Utility function to validate parsed conversion
export function validateParsedConversion(parsed: ParsedConversion): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (parsed.value <= 0) {
    errors.push('Value must be positive');
  }

  if (parsed.kind === 'currency') {
    if (!/^[A-Z]{3}$/.test(parsed.from)) {
      errors.push('Currency codes must be 3 uppercase letters');
    }
    if (!/^[A-Z]{3}$/.test(parsed.to)) {
      errors.push('Currency codes must be 3 uppercase letters');
    }
  }

  if (parsed.confidence && parsed.confidence < 0.5) {
    errors.push('Low confidence in parsing - please clarify your request');
  }

  return { valid: errors.length === 0, errors };
}
