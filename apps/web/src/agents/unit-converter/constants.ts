// --- Aviation Fuel Densities (kg/L at standard conditions) ---
export const DEFAULT_DENSITIES = {
  jet_a1: 0.804,
  jet_a: 0.82,
  avgas: 0.72,
} as const;

/**
 * Normalizes unit strings for consistent matching:
 * - Converts to lowercase
 * - Strips trailing 's' for plurals
 * - Replaces underscores/hyphens with nothing or spaces
 * - Handles unicode: m³→m3, m^3→m3, °C→C, °F→F, °K→K
 */
export function normalizeUnitString(input: string): string {
  let normalized = input.trim().toLowerCase();

  // Unicode conversions
  normalized = normalized.replace(/³/g, '3');
  normalized = normalized.replace(/\^3/g, '3');
  normalized = normalized.replace(/°([cfk])/g, '$1');

  // Remove underscores (meter_per_second → meterpersecond, or keep spaces if needed)
  // We'll keep underscores for now since some units use them semantically

  // Strip trailing 's' for plurals (meters→meter, gallons→gallon)
  // But be careful not to break units that end in 's' naturally
  if (normalized.endsWith('s') && !['celsius', 'fahrenheit'].includes(normalized)) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

// --- Unit Alias Maps (trimmed - plurals handled by normalizer) ---

export const LENGTH_UNITS = new Map<string, string>([
  ['meter', 'm'],
  ['metre', 'm'],
  ['foot', 'ft'],
  ['feet', 'ft'],
  ['inch', 'in'],
  ['kilometer', 'km'],
  ['kilometre', 'km'],
  ['mile', 'mi'],
  ['yard', 'yd'],
]);

export const AREA_UNITS = new Map<string, string>([
  ['square_meter', 'm2'],
  ['square_metre', 'm2'],
  ['square_foot', 'ft2'],
  ['square_feet', 'ft2'],
  ['hectare', 'ha'],
  ['acre', 'ac'],
]);

export const VOLUME_UNITS = new Map<string, string>([
  ['liter', 'l'],
  ['litre', 'l'],
  ['milliliter', 'ml'],
  ['millilitre', 'ml'],
  ['m3', 'm3'],
  ['usg', 'gal'], // US gallon
  ['us_gallon', 'gal'],
  ['gallon', 'gal'],
  ['imp_gallon', 'gal_imp'], // Imperial gallon
  ['imperial_gallon', 'gal_imp'],
  ['bbl', 'bbl'], // Barrel (42 USG)
  ['barrel', 'bbl'],
  ['quart', 'qt'],
]);

export const MASS_UNITS = new Map<string, string>([
  ['gram', 'g'],
  ['kilogram', 'kg'],
  ['kgm', 'kg'],
  ['pound', 'lb'],
  ['lbm', 'lb'],
  ['ton', 't'],
  ['tonne', 't'],
  ['metric_ton', 't'],
  ['metric_tonne', 't'],
  ['mt', 't'],
  ['short_ton', 'us_ton'],
]);

export const DENSITY_UNITS = new Map<string, string>([
  ['kg/l', 'kg_per_l'],
  ['kg/litre', 'kg_per_l'],
  ['kg/liter', 'kg_per_l'],
  ['kilogram_per_liter', 'kg_per_l'],
  ['kilogram_per_litre', 'kg_per_l'],
  ['kg/m3', 'kg_per_m3'],
  ['kilogram_per_m3', 'kg_per_m3'],
  ['kilogram_per_cubic_meter', 'kg_per_m3'],
  ['g/cm3', 'g_per_cm3'],
  ['gram_per_cm3', 'g_per_cm3'],
  ['gram_per_cubic_centimeter', 'g_per_cm3'],
]);

export const TEMPERATURE_UNITS = new Map<string, string>([
  ['celsius', 'c'],
  ['fahrenheit', 'f'],
  ['kelvin', 'k'],
  ['c', 'c'],
  ['f', 'f'],
  ['k', 'k'],
]);

export const ENERGY_UNITS = new Map<string, string>([
  ['mj/kg', 'mj_per_kg'],
  ['megajoule_per_kg', 'mj_per_kg'],
  ['btu/lb', 'btu_per_lb'],
  ['british_thermal_unit_per_lb', 'btu_per_lb'],
  ['kcal/kg', 'kcal_per_kg'],
  ['kilocalorie_per_kg', 'kcal_per_kg'],
]);

export const RATE_UNITS = new Map<string, string>([
  ['usd/usg', 'usd/gal'],
  ['usd/gal', 'usd/gal'],
  ['usd/l', 'usd/l'],
  ['usd/lt', 'usd/t'],
  ['usd/mt', 'usd/t'],
  ['usd/kg', 'usd/kg'],
  ['usd/bbl', 'usd/bbl'],
  ['eur/l', 'eur/l'],
  ['eur/mt', 'eur/t'],
  ['eur/kg', 'eur/kg'],
]);

export const FLOW_UNITS = new Map<string, string>([
  ['l/min', 'l_per_min'],
  ['liter_per_minute', 'l_per_min'],
  ['usg/min', 'gal_per_min'],
  ['gallon_per_minute', 'gal_per_min'],
  ['m3/h', 'm3_per_h'],
  ['cubic_meter_per_hour', 'm3_per_h'],
]);
