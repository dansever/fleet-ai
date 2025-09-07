/**
 * Date Utility Functions
 *
 * Centralized date handling utilities to ensure consistency across the application.
 * Follow the patterns outlined in DATE_TIME_HANDLING_GUIDE.md
 */

/**
 * Safely converts various input types to a Date object or null
 * Handles null, undefined, Date objects, and ISO strings
 */
export const safeDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

/**
 * Safely converts various input types to an ISO string or null
 * Used for API serialization
 */
export const safeISOString = (value: unknown): string | null => {
  const date = safeDate(value);
  return date?.toISOString() || null;
};

/**
 * Converts form data dates to ISO strings for API submission
 * Handles nested objects and arrays
 */
export const serializeDatesForAPI = <T extends Record<string, unknown>>(
  data: T,
  dateFields: (keyof T)[],
): T => {
  const serialized = { ...data };

  dateFields.forEach((field) => {
    if (serialized[field]) {
      serialized[field] = safeISOString(serialized[field]) as T[keyof T];
    }
  });

  return serialized;
};

/**
 * Converts API response dates from ISO strings to Date objects
 * Handles nested objects and arrays
 */
export const deserializeDatesFromAPI = <T extends Record<string, unknown>>(
  data: T,
  dateFields: (keyof T)[],
): T => {
  const deserialized = { ...data };

  dateFields.forEach((field) => {
    if (deserialized[field]) {
      deserialized[field] = safeDate(deserialized[field]) as T[keyof T];
    }
  });

  return deserialized;
};

/**
 * Creates a date range filter for list filtering
 */
export const createDateFilter = (days: number) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return (dateValue: unknown): boolean => {
    if (!dateValue) return true; // Include items without dates
    const itemDate = safeDate(dateValue);
    return itemDate ? itemDate >= cutoff : true;
  };
};

/**
 * Sorts array by date field (newest first by default)
 */
export const sortByDate = <T extends Record<string, unknown>>(
  array: T[],
  dateField: keyof T,
  ascending: boolean = false,
): T[] => {
  return [...array].sort((a, b) => {
    const dateA = safeDate(a[dateField]);
    const dateB = safeDate(b[dateField]);

    // Handle null dates (put them at the end)
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    const result = dateA.getTime() - dateB.getTime();
    return ascending ? result : -result;
  });
};

/**
 * Checks if a date is within a specific range
 */
export const isDateInRange = (date: unknown, startDate: unknown, endDate: unknown): boolean => {
  const checkDate = safeDate(date);
  const start = safeDate(startDate);
  const end = safeDate(endDate);

  if (!checkDate) return false;

  const time = checkDate.getTime();
  const startTime = start?.getTime() ?? -Infinity;
  const endTime = end?.getTime() ?? Infinity;

  return time >= startTime && time <= endTime;
};

/**
 * Gets a human-readable relative time string
 */
export const getRelativeTime = (date: unknown): string => {
  const dateObj = safeDate(date);
  if (!dateObj) return '';

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return dateObj.toLocaleDateString();
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Validates if a date string is in valid ISO format
 */
export const isValidISOString = (value: string): boolean => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString();
};

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
