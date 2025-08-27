/**
 * Escapes CSV field values by wrapping in quotes and escaping internal quotes
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }

  const str = String(field);

  // If the field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Converts array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T | string; header: string; accessor?: (item: T) => any }[],
): string {
  if (data.length === 0) {
    return '';
  }

  // If no columns provided, use all keys from first object
  const csvColumns =
    columns ||
    Object.keys(data[0]).map((key) => ({
      key,
      header:
        key.charAt(0).toUpperCase() +
        key
          .slice(1)
          .replace(/([A-Z])/g, ' $1')
          .trim(),
    }));

  // Create header row
  const headers = csvColumns.map((col) => escapeCSVField(col.header));
  const csvContent = [headers.join(',')];

  // Create data rows
  data.forEach((item) => {
    const row = csvColumns.map((col) => {
      let value;
      if ('accessor' in col && col.accessor) {
        value = col.accessor(item);
      } else {
        value = item[col.key as keyof T];
      }

      // If value is a React node or complex object, convert to string
      if (value && typeof value === 'object' && value.toString) {
        value = value.toString();
      }

      return escapeCSVField(value);
    });
    csvContent.push(row.join(','));
  });

  return csvContent.join('\n');
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up the URL object
}

/**
 * Converts table data to CSV and downloads it
 */
export function downloadTableAsCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T | string; header: string; accessor?: (item: T) => any }[],
): void {
  const csvContent = convertToCSV(data, columns);
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadCSV(csvContent, finalFilename);
}
