import { tool } from '@langchain/core/tools';
import convert from 'convert-units';
import { z } from 'zod';

// --- Unit Normalization Map ---
// Maps common natural language variations to standard unit symbols
const UNIT_ALIASES = new Map<string, string>([
  // Length (natural language)
  ['meter', 'm'],
  ['metre', 'm'],
  ['foot', 'ft'],
  ['feet', 'ft'],
  ['inch', 'in'],
  ['kilometer', 'km'],
  ['kilometre', 'km'],
  ['mile', 'mi'],
  ['yard', 'yd'],

  // Volume (natural language + special chars)
  ['liter', 'l'],
  ['litre', 'l'],
  ['milliliter', 'ml'],
  ['millilitre', 'ml'],
  ['gallon', 'gal'],
  ['quart', 'qt'],
  ['barrel', 'bbl'],
  ['m³', 'm3'],
  ['m^3', 'm3'],
  ['ft³', 'ft3'],
  ['ft^3', 'ft3'],
  ['cubic_meter', 'm3'],
  ['cubic_metre', 'm3'],
  ['cubic_foot', 'ft3'],

  // Weight / Mass (natural language)
  ['gram', 'g'],
  ['kilogram', 'kg'],
  ['pound', 'lb'],
  ['ounce', 'oz'],
  ['ton', 't'],
  ['tonne', 't'],
  ['metric_ton', 'mt'],

  // Temperature (natural language + symbols)
  // Note: convert-units uses uppercase for temperature
  ['celsius', 'C'],
  ['fahrenheit', 'F'],
  ['kelvin', 'K'],
  ['°c', 'C'],
  ['°f', 'F'],
  ['°k', 'K'],
  ['c', 'C'], // Handle single letter input
  ['f', 'F'],
  ['k', 'K'],

  // Area (natural language)
  ['square_meter', 'm2'],
  ['square_metre', 'm2'],
  ['square_foot', 'ft2'],
  ['hectare', 'ha'],
  ['acre', 'ac'],

  // Speed (variations)
  ['kmh', 'km/h'],
  ['kph', 'km/h'],
  ['mile_per_hour', 'mph'],
]);

/**
 * Normalizes unit strings to standard symbols used by convert-units library.
 * - Converts to lowercase for case-insensitive matching
 * - Checks aliases map for natural language variations
 * - Returns lowercase version of unit for consistent matching
 */
const normalizeUnit = (unit: string): string => {
  const lower = unit.trim().toLowerCase();
  return UNIT_ALIASES.get(lower) ?? lower;
};

// --- Schema ---
const UomSchema = z.object({
  value: z.number().describe('Numeric value to convert'),
  fromUnit: z
    .string()
    .describe('Unit to convert from (case-insensitive, e.g., l, usg, kg, m, ft)'),
  toUnit: z.string().describe('Unit to convert to (case-insensitive, e.g., l, usg, kg, m, ft)'),
  fromRateUnit: z
    .string()
    .optional()
    .describe('Optional rate unit for rate conversions, e.g., USD/usg'),
  toRateUnit: z
    .string()
    .optional()
    .describe('Optional target rate unit for rate conversions, e.g., USD/l'),
});

type UomInput = z.infer<typeof UomSchema>;

type UomResult =
  | { value: number; unit: string; explanation: string }
  | { error: string; message: string; suggestion?: string };

// --- Helper ---
function getCategorySuggestion(from: string, to: string): string {
  const categories = {
    length: ['m', 'ft', 'in', 'km', 'mi', 'yd'],
    mass: ['kg', 'lb', 'g', 'oz'],
    volume: ['l', 'ml', 'gal', 'qt', 'm3', 'ft3'],
    temperature: ['C', 'F', 'K'],
    speed: ['km/h', 'mph', 'm/s'],
  };
  for (const [name, list] of Object.entries(categories)) {
    if (list.includes(from) || list.includes(to))
      return `Try using standard ${name} units: ${list.join(', ')}`;
  }
  return 'Ensure both units belong to the same measurement category.';
}

function handleRateConversion(value: number, fromRate: string, toRate: string): UomResult {
  const [currencyFrom, denomFrom] = fromRate.split('/');
  const [currencyTo, denomTo] = toRate.split('/');
  if (!denomFrom || !denomTo) {
    return {
      error: 'INVALID_RATE_FORMAT',
      message: 'Rates must be in CURRENCY/UNIT format (e.g., USD/L)',
    };
  }

  try {
    const factor = convert(1)
      .from(normalizeUnit(denomFrom) as any)
      .to(normalizeUnit(denomTo) as any);
    const newValue = value * factor;
    return {
      value: Number(newValue.toFixed(8)),
      unit: toRate,
      explanation: `Converted ${value} ${fromRate} → ${newValue.toFixed(6)} ${toRate} (factor: ${factor})`,
    };
  } catch {
    return {
      error: 'RATE_CONVERSION_ERROR',
      message: `Failed to convert denominator units (${denomFrom} → ${denomTo})`,
      suggestion: 'Ensure denominator units are compatible (e.g., volume to volume)',
    };
  }
}

// --- Main Tool ---
export const uomConvert = tool(
  async (input: UomInput) => {
    const { value, fromUnit, toUnit, fromRateUnit, toRateUnit } = input;
    const from = normalizeUnit(fromUnit);
    const to = normalizeUnit(toUnit);

    try {
      if (fromRateUnit && toRateUnit) {
        return JSON.stringify(handleRateConversion(value, fromRateUnit, toRateUnit));
      }

      const result = convert(value)
        .from(from as any)
        .to(to as any);
      return JSON.stringify({
        value: Number(result.toFixed(8)),
        unit: to,
        explanation: `Converted ${value} ${from} → ${result.toFixed(6)} ${to}`,
      });
    } catch (err: any) {
      return JSON.stringify({
        error: 'CONVERSION_ERROR',
        message: err?.message ?? 'Invalid conversion',
        suggestion: getCategorySuggestion(from, to),
      });
    }
  },
  {
    name: 'uom_convert',
    description:
      'Converts between physical units (e.g., length, weight, volume, temperature, speed) or rate units (e.g., USD/USG → USD/L).',
    schema: UomSchema,
  },
);
