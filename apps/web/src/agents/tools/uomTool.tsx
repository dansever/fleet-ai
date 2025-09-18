// Improved UOM Tool - Simplified and more robust
import { StructuredTool } from '@langchain/core/tools';
// @ts-ignore - convert-units doesn't have types
import convert from 'convert-units';
import { z } from 'zod';

// Enhanced unit aliases with more comprehensive mapping
const UNIT_ALIASES: Record<string, string> = {
  // Length
  metre: 'm',
  meter: 'm',
  metres: 'm',
  meters: 'm',
  foot: 'ft',
  feet: 'ft',
  inch: 'in',
  inches: 'in',
  kilometre: 'km',
  kilometer: 'km',
  kilometres: 'km',
  kilometers: 'km',
  mile: 'mi',
  miles: 'mi',
  yard: 'yd',
  yards: 'yd',

  // Volume
  litre: 'l',
  liter: 'l',
  litres: 'l',
  liters: 'l',
  milliliter: 'ml',
  millilitre: 'ml',
  milliliters: 'ml',
  millilitres: 'ml',
  gallon: 'gal',
  gallons: 'gal',
  quart: 'qt',
  quarts: 'qt',
  'm^3': 'm3',
  'm³': 'm3',
  cubic_meter: 'm3',
  cubic_meters: 'm3',
  cubic_metre: 'm3',
  cubic_metres: 'm3',
  'ft^3': 'ft3',
  'ft³': 'ft3',
  cubic_foot: 'ft3',
  cubic_feet: 'ft3',

  // Weight/Mass
  gram: 'g',
  grams: 'g',
  kilogram: 'kg',
  kilograms: 'kg',
  pound: 'lb',
  pounds: 'lb',
  ounce: 'oz',
  ounces: 'oz',
  ton: 't',
  tonne: 't',
  tons: 't',
  tonnes: 't',

  // Temperature
  celsius: 'C',
  fahrenheit: 'F',
  kelvin: 'K',
  '°c': 'C',
  '°f': 'F',
  '°k': 'K',

  // Area
  square_meter: 'm2',
  square_meters: 'm2',
  sq_meter: 'm2',
  square_foot: 'ft2',
  square_feet: 'ft2',
  sq_foot: 'ft2',
  sq_feet: 'ft2',

  // Speed
  kilometer_per_hour: 'km/h',
  kmh: 'km/h',
  kph: 'km/h',
  mile_per_hour: 'mph',
  miles_per_hour: 'mph',
  'miles per hour': 'mph',
  'mile per hour': 'mph',
  mph: 'mph',
};

function normalizeUnit(unit: string): string {
  const normalized = unit.trim().toLowerCase();
  return UNIT_ALIASES[normalized] ?? unit;
}

function getConversionSuggestion(from: string, to: string): string {
  const speedUnits = ['mph', 'km/h', 'm/s', 'ft/min', 'ft/s'];
  const lengthUnits = ['m', 'ft', 'in', 'km', 'mi', 'yd'];
  const weightUnits = ['kg', 'lb', 'g', 'oz'];
  const volumeUnits = ['l', 'ml', 'gal', 'qt'];
  const tempUnits = ['C', 'F', 'K'];

  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  if (
    speedUnits.some((u) => fromLower.includes(u)) &&
    speedUnits.some((u) => toLower.includes(u))
  ) {
    return 'Try using standard speed units: mph, km/h, m/s, ft/min, ft/s';
  }
  if (
    lengthUnits.some((u) => fromLower.includes(u)) &&
    lengthUnits.some((u) => toLower.includes(u))
  ) {
    return 'Try using standard length units: m, ft, in, km, mi, yd';
  }
  if (
    weightUnits.some((u) => fromLower.includes(u)) &&
    weightUnits.some((u) => toLower.includes(u))
  ) {
    return 'Try using standard weight units: kg, lb, g, oz';
  }
  if (
    volumeUnits.some((u) => fromLower.includes(u)) &&
    volumeUnits.some((u) => toLower.includes(u))
  ) {
    return 'Try using standard volume units: l, ml, gal, qt';
  }
  if (tempUnits.some((u) => fromLower.includes(u)) && tempUnits.some((u) => toLower.includes(u))) {
    return 'Try using standard temperature units: C, F, K';
  }

  return 'Check if units are compatible (e.g., length to length, not length to weight)';
}

const UomSchema = z.object({
  value: z.number(),
  fromUnit: z.string(),
  toUnit: z.string(),
});

export type UomInput = z.infer<typeof UomSchema>;

export class UomConvertTool extends StructuredTool<typeof UomSchema> {
  name = 'uom_convert';
  description =
    'Convert numeric values between physical units (length, weight, volume, temperature, speed, etc.). For speed: use km/h for kph, mph for miles per hour, m/s for meters per second.';
  schema = UomSchema;

  async _call(input: UomInput): Promise<string> {
    const { value, fromUnit, toUnit } = input;
    const from = normalizeUnit(fromUnit);
    const to = normalizeUnit(toUnit);

    // Debug logging
    console.log('UOM Tool called with:', {
      value,
      fromUnit,
      toUnit,
      normalizedFrom: from,
      normalizedTo: to,
    });

    try {
      // Special case: Convert kph to mi/min via mph
      if (from === 'km/h' && to === 'mi/min') {
        // First convert km/h to mph
        const mph = convert(value).from('km/h').to('mph');
        // Then convert mph to mi/min (1 mph = 1/60 mi/min)
        const miPerMin = mph / 60;

        return JSON.stringify({
          value: Number(miPerMin.toFixed(12)),
          unit: 'mi/min',
          explanation: `Converted ${value} km/h to ${miPerMin.toFixed(6)} mi/min via mph conversion`,
          meta: {
            fromUnit: from,
            toUnit: to,
            precision: 12,
            intermediateConversion: `${mph.toFixed(6)} mph`,
          },
        });
      }

      // Regular conversion for supported units
      const result = convert(value).from(from).to(to);

      return JSON.stringify({
        value: Number(result.toFixed(12)),
        unit: to,
        explanation: `Converted ${value} ${from} to ${result.toFixed(6)} ${to}`,
        meta: {
          fromUnit: from,
          toUnit: to,
          precision: 12,
        },
      });
    } catch (error: any) {
      return JSON.stringify({
        error: 'CONVERSION_ERROR',
        message: error?.message ?? 'Unit conversion failed',
        details: {
          value,
          fromUnit: from,
          toUnit: to,
          suggestion: getConversionSuggestion(from, to),
        },
      });
    }
  }
}
