/**
 * Calculate progress percentage between two dates based on today.
 * @param startDate - contract start date (string | Date)
 * @param endDate - contract end date (string | Date)
 * @returns number between 0 and 100
 */
export function calculateProgress(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const today = Date.now();

  if (isNaN(start) || isNaN(end) || start >= end) {
    return 0; // invalid dates
  }

  const fraction = (today - start) / (end - start);
  const percentage = fraction * 100;

  // clamp between 0 and 100
  return Math.min(100, Math.max(0, Math.round(percentage)));
}
