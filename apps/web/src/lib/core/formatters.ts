/* Example usage:
1. formatCompactNumber(1000, "en-US", 0);      // "1K"
2. formatCompactNumber(2500000, "en-US", 1);   // "2.5M"
3. formatCompactNumber(2500000, "en-US", 2);   // "2.53M"
*/
export function formatCompactNumber(
  number: number,
  locale: string = 'en-US',
  maximumFractionDigits: number = 1,
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits,
  }).format(number);
}

/* Example usage:
// --- DATE columns (YYYY-MM-DD) ---
// Use for calendar-only fields (no time). 
// Stored as "YYYY-MM-DD" in DB, displayed consistently in any timezone.
1. Default format (date-only): 
   formatDate("2025-05-21") 
   → "May 21, 2025"

2. Only weekday (date-only): 
   formatDate("2024-10-01", { weekday: "long" }) 
   → "Tuesday"

3. Long format with weekday (date-only): 
   formatDate("2024-12-01", {
     weekday: "long",
     year: "numeric",
     month: "long",
     day: "numeric",
   }) 
   → "Sunday, December 1, 2024"

4. Short numeric format (date-only): 
   formatDate("2025-05-21", {
     year: "2-digit",
     month: "numeric",
     day: "numeric",
   }) 
   → "5/21/25"

5. Month and Year only (date-only): 
   formatDate("2025-05-21", {
     year: "numeric",
     month: "long",
   }) 
   → "May 2025"

// --- TIMESTAMPTZ columns (instants in time) ---
// Use for exact moments stored as ISO strings with Z (UTC).
// Use `useUTC` when you want to show the raw UTC time rather than local.
6. Local display from instant: 
   formatDate("2025-05-21T18:30:00.000Z") 
   → (user’s local equivalent date)

7. UTC display from instant: 
   formatDate("2025-05-21T18:30:00.000Z", undefined, "en-US", true) 
   → "May 21, 2025" (UTC date)
*/
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale: string = 'en-US',
  useUTC: boolean = false,
): string {
  let d: Date;
  let isDateOnly = false;

  if (typeof date === 'string') {
    const s = date.trim();

    // Detect YYYY-MM-DD (date-only)
    if (s.length === 10 && s[4] === '-' && s[7] === '-') {
      isDateOnly = true;
      const [y, m, dd] = s.split('-').map(Number);
      // Create UTC midnight so it won't shift across time zones
      d = new Date(Date.UTC(y, m - 1, dd, 0, 0, 0, 0));
    } else {
      // Timestamps like "2025-05-21T12:34:56.123Z" round-trip correctly
      d = new Date(s);
    }
  } else {
    // Already a Date (usually from toISOString() or now())
    d = new Date(date.getTime());
  }

  if (isNaN(d.getTime())) return '';

  // For date-only values, force UTC to avoid any local-time drift.
  // For instants, use UTC only when explicitly requested.
  const timeZone = isDateOnly ? 'UTC' : useUTC ? 'UTC' : undefined;

  return d.toLocaleDateString(locale, { ...options, timeZone });
}

/* Example usage:
1. formatCurrency(1234, "USD") → "$1,234"
2. formatCurrency(500) → "$500"  (defaults to USD)
3. formatCurrency(9876.54, "EUR") → "€9,877"
4. formatCurrency(9999, "ILS") → "₪9,999"
5. formatCurrency(2500, "usd") → "$2,500" (case-insensitive)
6. formatCurrency(null, "EUR") → null (safely returns null on invalid input)
 */
export function formatCurrency(
  amount?: number | string | null,
  currency: string | null = 'USD',
): string | null {
  if (amount == null) return null;

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  if (isNaN(parsedAmount)) return null;

  const resolvedCurrency = currency?.toUpperCase() || 'USD';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: resolvedCurrency,
    maximumFractionDigits: 0,
  }).format(parsedAmount);
}

/* Example usage:
1. formatSnakeCaseToTitle("hello_world") → "Hello World"
*/
export function formatSnakeCaseToTitle(text: string): string {
  return text
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
