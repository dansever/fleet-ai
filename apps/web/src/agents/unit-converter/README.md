# Unit & Currency Converter Agent

A precise, aviation-focused conversion assistant that handles physical unit conversions and real-time currency exchanges.

---

## Features

### Physical Unit Conversions

- **Length**: meters, feet, inches, kilometers, miles, yards
- **Mass**: grams, kilograms, pounds, tons, tonnes
- **Volume**: liters, gallons (US/Imperial), milliliters, barrels, cubic meters
- **Temperature**: Celsius, Fahrenheit, Kelvin
- **Area**: square meters, square feet, hectares, acres
- **Speed**: m/s, km/h, mph, ft/s
- **Density**: kg/L, kg/m³, g/cm³
- **Energy**: MJ/kg, BTU/lb, kcal/kg
- **Flow**: L/min, gal/min, m³/h

### Currency Conversions

Supports 10 major currencies with real-time exchange rates:

- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **GBP** - British Pound (£)
- **JPY** - Japanese Yen (¥)
- **CNY** - Chinese Yuan (¥)
- **NIS** - Israeli Shekel (₪) _[also accepts ILS]_
- **INR** - Indian Rupee (₹)
- **AUD** - Australian Dollar ($)
- **CAD** - Canadian Dollar ($)
- **CHF** - Swiss Franc (₣)

### Rate Conversions

Handles complex rate conversions like:

- USD/gallon → USD/liter
- USD/gallon → EUR/liter
- USD/barrel → USD/gallon
- Price per weight → Price per volume (with fuel density)

---

## Architecture

### Tools

1. **`unit_convert`** - Physical unit and rate conversions
2. **`currency_convert`** - Real-time currency exchange (exchangerate-api.com)

### Key Functions

#### `normalizeUnitString(input: string): string`

Smart unit normalization that handles:

- Case conversion (Meters → meters)
- Plural stripping (gallons → gallon)
- Unicode conversion (m³ → m3, °C → C)
- Consistent formatting

#### `normalizeCurrencyCode(input: string): string`

Currency code normalization that:

- Maps symbols to codes (€ → EUR, $ → USD)
- Handles equivalences (ILS → NIS, RMB → CNY)
- Validates against `CURRENCY_MAP`
- Detects ambiguous symbols (¥ requires clarification)

### Constants

#### `DEFAULT_DENSITIES`

Aviation fuel densities (kg/L at standard conditions):

- **Jet A-1**: 0.804 kg/L
- **Jet A**: 0.82 kg/L
- **Avgas**: 0.72 kg/L

#### Unit Alias Maps

Minimal, canonical mappings:

- `LENGTH_UNITS`, `AREA_UNITS`, `VOLUME_UNITS`
- `MASS_UNITS`, `DENSITY_UNITS`, `TEMPERATURE_UNITS`
- `ENERGY_UNITS`, `RATE_UNITS`, `FLOW_UNITS`

---

## Usage

### Simple Unit Conversion

```typescript
await runConversionAgent('Convert 100 meters to feet');
// Result: 328.084 ft
```

### Simple Currency Conversion

```typescript
await runConversionAgent('Convert 1000 USD to EUR');
// Result: ~920 EUR (based on current rate)
```

### Rate Conversion (UOM only)

```typescript
await runConversionAgent('Convert 2.3 USD/gallon to USD/liter');
// Result: ~0.607 USD/L
```

### Rate Conversion (UOM + Currency)

```typescript
await runConversionAgent('Convert 2.3 USD/gallon to EUR/liter');
// Agent process:
// 1. Convert 2.3 USD/gal → 0.607 USD/L
// 2. Convert 0.607 USD → EUR
// Result: ~0.558 EUR/L
```

### Complex Rate with Normalization

```typescript
await runConversionAgent('I paid 4 USD for 2 gallons. How much is that per liter in NIS?');
// Agent process:
// 1. Normalize: 4 ÷ 2 = 2 USD/gallon
// 2. Convert: 2 USD/gal → 0.528 USD/L
// 3. Convert: 0.528 USD → ~1.93 NIS
// Result: ~1.93 NIS/L
```

### Flexible Input

```typescript
// All of these work identically:
await runConversionAgent('Convert 250 liters to gallons');
await runConversionAgent('Convert 250 litres to gallons');
await runConversionAgent('Convert 250 l to gal');

// Unicode support:
await runConversionAgent('Convert 1 m³ to liters');
await runConversionAgent('Convert 1 m^3 to liters');

// Symbol support:
await runConversionAgent('Convert €100 to $');
await runConversionAgent('Convert 100 EUR to USD');
```

---

## System Prompt Strategy

The system prompt focuses on **behavior**, not **data**:

### ✅ Included in Prompt

- Decision logic (which tool to call when)
- Multi-step conversion process
- Rate normalization strategy
- Ambiguity handling guidance
- Output formatting requirements

### ❌ Not in Prompt (in code instead)

- Currency symbols and codes → `CURRENCY_MAP`
- Fuel densities → `DEFAULT_DENSITIES`
- Unit aliases → Alias maps + `normalizeUnitString()`
- Supported units list → Inferred from constants

**Benefit**: Shorter prompts (48% reduction) = lower token usage, faster responses

---

## Error Handling

### Unsupported Currency

```typescript
await runConversionAgent('Convert 100 XYZ to USD');
// Error: "Unsupported currency: XYZ. Supported currencies: USD, EUR, GBP, NIS, INR, JPY, CNY, AUD, CAD, CHF"
```

### Ambiguous Symbol

```typescript
await runConversionAgent('Convert ¥1000 to USD');
// Error: "Currency symbol ¥ is ambiguous (JPY or CNY). Please specify the currency code."
```

### Invalid Unit Category

```typescript
await runConversionAgent('Convert 5 meters to kilograms');
// Error: "Could not convert from m to kg. Standard units in length: m, ft, in, km, mi, yd"
```

---

## Testing

See `test-validation.md` for comprehensive test case coverage including:

- Rate conversions (UOM, currency, both)
- Plural/unicode normalization
- Ambiguous currency handling
- Default fuel density usage
- Barrel/gallon conversions

---

## Maintenance

### Adding a New Currency

1. Add to `lib/constants/currencies.ts`:
   ```typescript
   export const CURRENCY_MAP = {
     // ...
     MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$', display: 'Mexican Peso ($)' },
   };
   ```
2. (Optional) Add symbol mapping in `normalizeCurrencyCode()`:
   ```typescript
   const symbolMap: Record<string, string> = {
     // ...
     MX$: 'MXN',
   };
   ```
3. Done! Works everywhere automatically.

### Adding a New Unit

1. Add to appropriate map in `constants.ts`:
   ```typescript
   export const LENGTH_UNITS = new Map<string, string>([
     // ...
     ['nautical_mile', 'nmi'],
   ]);
   ```
2. Ensure `convert-units` library supports it
3. Done! Plurals handled automatically by `normalizeUnitString()`

### Updating Fuel Densities

1. Update `DEFAULT_DENSITIES` in `constants.ts`:
   ```typescript
   export const DEFAULT_DENSITIES = {
     jet_a1: 0.804,
     jet_a: 0.82,
     avgas: 0.72,
     jet_b: 0.775, // New fuel type
   } as const;
   ```
2. Agent will use new density when fuel type is mentioned

---

## Files

- **`UnitConverterAgent.ts`** - Main agent graph definition
- **`constants.ts`** - Unit aliases, densities, normalization functions
- **`prompts.ts`** - System prompt with behavioral guidance
- **`tools/unitConversionTool.tsx`** - Physical unit conversion tool
- **`tools/currencyConversionTool.tsx`** - Currency conversion tool with `CURRENCY_MAP` integration
- **`test-validation.md`** - Comprehensive test case documentation
- **`REFACTOR_CHANGELOG.md`** - Detailed refactor history and reasoning

---

## Design Principles

1. **Single Source of Truth**: `CURRENCY_MAP` is authoritative for all currency data
2. **Inference over Enumeration**: Normalize programmatically, don't list every variant
3. **Separation of Concerns**: Data in constants, logic in tools, behavior in prompts
4. **User-Friendly**: Accept flexible input (symbols, plurals, unicode)
5. **Transparent**: Show intermediate steps in multi-step conversions
6. **Maintainable**: Update constants once, propagates everywhere

---

## Dependencies

- **convert-units** - Unit conversion library
- **exchangerate-api.com** - Real-time exchange rates (requires API key)
- **@langchain/core** - LangChain tools and messages
- **@langchain/langgraph** - State graph for agent workflow
- **zod** - Schema validation

---

## Future Enhancements

- [ ] Density-based mass↔volume conversions using `DEFAULT_DENSITIES`
- [ ] Exchange rate caching to reduce API calls
- [ ] Context-aware ¥ inference (JPY vs CNY based on location mentions)
- [ ] Unit tests for `normalizeUnitString()` and `normalizeCurrencyCode()`
- [ ] Support for more currencies (easy to add to `CURRENCY_MAP`)
- [ ] Historical exchange rates (date-based conversions)

---

## License

Part of FleetAI V1 project.
