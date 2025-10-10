import { tool } from '@langchain/core/tools';
import convert from 'convert-units';
import { z } from 'zod';
import {
  AREA_UNITS,
  DENSITY_UNITS,
  ENERGY_UNITS,
  FLOW_UNITS,
  LENGTH_UNITS,
  MASS_UNITS,
  normalizeUnitString,
  RATE_UNITS,
  TEMPERATURE_UNITS,
  VOLUME_UNITS,
} from '../constants';

/**
 * Merge all maps into one master alias map
 */
export function mergeUnitMaps(...maps: Map<string, string>[]): Map<string, string> {
  const merged = new Map<string, string>();
  for (const m of maps) for (const [key, val] of m.entries()) merged.set(key, val);
  return merged;
}

// --- Unified Map ---
export const UNIT_ALIASES = mergeUnitMaps(
  LENGTH_UNITS,
  AREA_UNITS,
  VOLUME_UNITS,
  MASS_UNITS,
  DENSITY_UNITS,
  TEMPERATURE_UNITS,
  ENERGY_UNITS,
  RATE_UNITS,
  FLOW_UNITS,
);

/**
 * Normalize a unit string using the smart normalizer, then check alias map.
 * This handles plurals, unicode, and other variants before looking up canonical form.
 */
function normalizeUnit(unit: string): string {
  const normalized = normalizeUnitString(unit);
  const alias = UNIT_ALIASES.get(normalized);
  return alias ?? normalized;
}

// --- Schema for tool input ---
const UomSchema = z.object({
  value: z.number().finite().describe('Numeric value to convert'),
  fromUnit: z.string().nonempty().describe('Unit to convert from (e.g., "m", "ft", "kg")'),
  toUnit: z.string().nonempty().describe('Unit to convert to'),
  fromRateUnit: z.string().optional().describe('Optional rate unit string “CURRENCY/UNIT”'),
  toRateUnit: z.string().optional().describe('Optional target rate unit string “CURRENCY/UNIT”'),
});

export type UomInput = z.infer<typeof UomSchema>;

export type UomSuccessResult = {
  value: number;
  unit: string;
  explanation: string;
};

export type UomErrorResult = {
  error: string;
  message: string;
  suggestion?: string;
};

export type UomResult = UomSuccessResult | UomErrorResult;

// --- Utility to suggest unit category ---
function getCategorySuggestion(from: string, to: string): string {
  const categories: Record<string, string[]> = {
    length: ['m', 'ft', 'in', 'km', 'mi', 'yd'],
    mass: ['kg', 'g', 'lb', 'oz', 't'],
    volume: ['l', 'ml', 'gal', 'qt', 'm3', 'ft3'],
    temperature: ['C', 'F', 'K'],
    speed: ['km/h', 'mph', 'm/s'],
    area: ['m2', 'ft2', 'ac', 'ha'],
  };
  for (const [cat, units] of Object.entries(categories)) {
    if (units.includes(from) || units.includes(to)) {
      return `Standard units in ${cat}: ${units.join(', ')}`;
    }
  }
  return 'Ensure both units belong to the same measurement category.';
}

/**
 * Handle rate-based conversion, e.g. “USD/gal” → “USD/l”.
 */
function handleRateConversion(value: number, fromRate: string, toRate: string): UomResult {
  // Expect format “CURRENCY/UNIT”
  const partsFrom = fromRate.split('/');
  const partsTo = toRate.split('/');
  if (partsFrom.length !== 2 || partsTo.length !== 2) {
    return {
      error: 'INVALID_RATE_FORMAT',
      message: 'Rates must be in "CURRENCY/UNIT" format, e.g. "USD/l".',
      suggestion: 'Use format CURRENCY/UNIT.',
    };
  }
  const [currencyFrom, denomFromRaw] = partsFrom;
  const [currencyTo, denomToRaw] = partsTo;

  const denomFrom = normalizeUnit(denomFromRaw);
  const denomTo = normalizeUnit(denomToRaw);

  try {
    const factor = convert(1)
      .from(denomFrom as any)
      .to(denomTo as any);
    const newValue = value * factor;
    return {
      value: Number(newValue.toFixed(8)),
      unit: `${currencyTo}/${denomTo}`,
      explanation: `Converted ${value} ${currencyFrom}/${denomFrom} → ${newValue.toFixed(
        6,
      )} ${currencyTo}/${denomTo} (factor: ${factor})`,
    };
  } catch (err: any) {
    return {
      error: 'RATE_CONVERSION_ERROR',
      message: `Failed to convert units ${denomFrom} → ${denomTo}: ${err.message}`,
      suggestion: getCategorySuggestion(denomFrom, denomTo),
    };
  }
}

/**
 * Main tool: convert units or rate-based conversions.
 */
export const unitConvertTool = tool(
  async (rawInput: unknown) => {
    // Validate input
    let input: UomInput;
    try {
      input = UomSchema.parse(rawInput);
    } catch (zErr) {
      const err = zErr as z.ZodError;
      return {
        error: 'INVALID_INPUT',
        message: 'Input does not conform to schema.',
        suggestion: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      } as UomErrorResult;
    }

    const { value, fromUnit, toUnit, fromRateUnit, toRateUnit } = input;
    const from = normalizeUnit(fromUnit);
    const to = normalizeUnit(toUnit);

    // Rate conversion if provided
    if (fromRateUnit && toRateUnit) {
      return handleRateConversion(value, fromRateUnit, toRateUnit);
    }

    // Ensure category compatibility if possible
    // (convert-units might itself throw for incompatible units)
    try {
      const result = convert(value)
        .from(from as any)
        .to(to as any);
      return {
        value: Number(result.toFixed(8)),
        unit: to,
        explanation: `Converted ${value} ${from} → ${result.toFixed(6)} ${to}`,
      };
    } catch (err: any) {
      return {
        error: 'CONVERSION_ERROR',
        message: `Could not convert from ${from} to ${to}: ${err.message}`,
        suggestion: getCategorySuggestion(from, to),
      } as UomErrorResult;
    }
  },
  {
    name: 'unit_convert',
    description:
      'Convert between physical units (length, mass, volume, temperature, speed, area), or perform rate-based conversions (e.g. USD/gal → USD/l).',
    schema: UomSchema,
  },
);
