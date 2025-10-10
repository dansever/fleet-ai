/**
 * Utility functions for converting fuel bid and tender data to spreadsheet format
 * and exporting to various formats (CSV, Excel-ready)
 */

import type { FuelBid, FuelTender } from '@/drizzle/types';
import type { CellBase } from 'react-spreadsheet';

// ==================== TENDER EXPORT UTILITIES ====================

/**
 * Define which fields to include in tender exports
 */
export const TENDER_EXPORT_FIELDS = [
  // Basic Information
  { key: 'title', label: 'Tender Title' },
  { key: 'tenderType', label: 'Tender Type' },
  { key: 'description', label: 'Description' },

  // Fuel Specifications
  { key: 'fuelType', label: 'Fuel Type' },
  { key: 'forecastVolume', label: 'Forecast Volume' },
  { key: 'qualitySpecification', label: 'Quality Specification' },

  // Base Configuration
  { key: 'baseCurrency', label: 'Base Currency' },
  { key: 'baseUom', label: 'Base UOM' },

  // Benchmarking
  { key: 'benchmarkIndex', label: 'Benchmark Index' },
  { key: 'benchmarkLocation', label: 'Benchmark Location' },

  // Timeline
  { key: 'submissionStarts', label: 'Submission Starts' },
  { key: 'submissionEnds', label: 'Submission Ends' },
  { key: 'deliveryStarts', label: 'Delivery Starts' },
  { key: 'deliveryEnds', label: 'Delivery Ends' },

  // Status
  { key: 'processStatus', label: 'Process Status' },

  // AI
  { key: 'aiSummary', label: 'AI Summary' },
] as const;

/**
 * Convert tenders to CSV string
 */
export function convertTendersToCSV(tenders: FuelTender[]): string {
  if (!tenders || tenders.length === 0) return '';

  const headers = TENDER_EXPORT_FIELDS.map((field) => field.label);

  const rows = tenders.map((tender) => {
    return TENDER_EXPORT_FIELDS.map((field) => {
      const value = formatCellValue(tender[field.key as keyof FuelTender]);
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
  });

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

/**
 * Download tenders as CSV file
 */
export function downloadTendersAsCSV(tenders: FuelTender[], filename?: string): void {
  const csv = convertTendersToCSV(tenders);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const defaultFilename = `fuel_tenders_${new Date().toISOString().split('T')[0]}.csv`;

  link.href = URL.createObjectURL(blob);
  link.download = filename || defaultFilename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ==================== BID EXPORT UTILITIES ====================

/**
 * Define which fields to include in the export and their display names
 */
export const BID_EXPORT_FIELDS = [
  // Vendor Information
  { key: 'vendorName', label: 'Vendor Name' },
  { key: 'vendorContactName', label: 'Contact Name' },
  { key: 'vendorContactEmail', label: 'Contact Email' },
  { key: 'vendorContactPhone', label: 'Contact Phone' },
  { key: 'vendorAddress', label: 'Vendor Address' },

  // Bid Basic Info
  { key: 'title', label: 'Bid Title' },
  { key: 'round', label: 'Round' },
  { key: 'bidSubmittedAt', label: 'Submitted Date' },

  // Product & Measurement
  { key: 'productGrade', label: 'Product Grade' },
  { key: 'uom', label: 'Unit of Measure' },
  { key: 'temperatureBasisC', label: 'Temperature Basis (°C)' },
  { key: 'densityAt15C', label: 'Density at 15°C' },
  { key: 'qualitySpecification', label: 'Quality Spec' },

  // Pricing
  { key: 'currency', label: 'Currency' },
  { key: 'priceType', label: 'Price Type' },
  { key: 'baseUnitPrice', label: 'Base Unit Price' },

  // Index-Linked Pricing
  { key: 'indexName', label: 'Index Name' },
  { key: 'indexLocation', label: 'Index Location' },
  { key: 'indexCurrency', label: 'Index Currency' },
  { key: 'differentialValue', label: 'Differential Value' },
  { key: 'differentialUnit', label: 'Differential Unit' },
  { key: 'differentialCurrency', label: 'Differential Currency' },
  { key: 'quoteLagDays', label: 'Quote Lag Days' },

  // Fees & Charges
  { key: 'intoPlaneFee', label: 'Into-Plane Fee' },
  { key: 'intoPlaneFeeUnit', label: 'Into-Plane Fee Unit' },
  { key: 'handlingFee', label: 'Handling Fee' },
  { key: 'handlingFeeBasis', label: 'Handling Fee Basis' },
  { key: 'otherFee', label: 'Other Fee' },
  { key: 'otherFeeBasis', label: 'Other Fee Basis' },
  { key: 'otherFeeDescription', label: 'Other Fee Description' },

  // Commercial Terms
  { key: 'paymentTerms', label: 'Payment Terms' },
  { key: 'creditDays', label: 'Credit Days' },

  // Inclusions
  { key: 'includesTaxes', label: 'Includes Taxes' },
  { key: 'includesAirportFees', label: 'Includes Airport Fees' },

  // Decision
  { key: 'decision', label: 'Decision' },

  // AI Summary
  { key: 'aiSummary', label: 'AI Summary' },

  // Comments
  { key: 'vendorComments', label: 'Vendor Comments' },
] as const;

/**
 * Format a cell value for display
 */
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Convert fuel bids to react-spreadsheet format
 * Returns data suitable for the Spreadsheet component
 */
export function convertBidsToSpreadsheetData(bids: FuelBid[]): Array<Array<CellBase<any>>> {
  if (!bids || bids.length === 0) return [];

  // Create header row
  const headerRow: Array<CellBase<any>> = BID_EXPORT_FIELDS.map((field) => ({
    value: field.label,
    readOnly: true,
    className: 'font-bold bg-gray-100',
  }));

  // Create data rows - one row per bid
  const dataRows: Array<Array<CellBase<any>>> = bids.map((bid) => {
    return BID_EXPORT_FIELDS.map((field) => ({
      value: formatCellValue(bid[field.key as keyof FuelBid]),
    }));
  });

  return [headerRow, ...dataRows];
}

/**
 * Convert fuel bids to CSV string
 */
export function convertBidsToCSV(bids: FuelBid[]): string {
  if (!bids || bids.length === 0) return '';

  // Create header row
  const headers = BID_EXPORT_FIELDS.map((field) => field.label);

  // Create data rows
  const rows = bids.map((bid) => {
    return BID_EXPORT_FIELDS.map((field) => {
      const value = formatCellValue(bid[field.key as keyof FuelBid]);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

  return csvContent;
}

/**
 * Download bids as CSV file
 */
export function downloadBidsAsCSV(
  bids: FuelBid[],
  tender?: FuelTender | null,
  filename?: string,
): void {
  const csv = convertBidsToCSV(bids);

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  // Generate filename
  const defaultFilename = tender
    ? `${tender.title}_bids_${new Date().toISOString().split('T')[0]}.csv`
    : `fuel_bids_${new Date().toISOString().split('T')[0]}.csv`;

  link.href = URL.createObjectURL(blob);
  link.download = filename || defaultFilename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(link.href);
}

/**
 * Transpose data for alternative view (fields as rows, bidders as columns)
 * This can be useful for comparing a few bids side-by-side
 */
export function convertBidsToTransposedSpreadsheetData(
  bids: FuelBid[],
): Array<Array<CellBase<any>>> {
  if (!bids || bids.length === 0) return [];

  // Create header row with field name + vendor names
  const headerRow: Array<CellBase<any>> = [
    {
      value: 'Field',
      readOnly: true,
      className: 'font-bold bg-gray-100',
    },
    ...bids.map((bid) => ({
      value: bid.vendorName || 'Unknown Vendor',
      readOnly: true,
      className: 'font-bold bg-gray-100',
    })),
  ];

  // Create data rows - one row per field
  const dataRows: Array<Array<CellBase<any>>> = BID_EXPORT_FIELDS.map((field) => {
    return [
      {
        value: field.label,
        readOnly: true,
        className: 'font-semibold bg-gray-50',
      },
      ...bids.map((bid) => ({
        value: formatCellValue(bid[field.key as keyof FuelBid]),
      })),
    ];
  });

  return [headerRow, ...dataRows];
}

/**
 * Copy spreadsheet data to clipboard in a format that can be pasted into Excel/Google Sheets
 */
export function copyBidsToClipboard(bids: FuelBid[]): Promise<void> {
  const csv = convertBidsToCSV(bids);

  return navigator.clipboard.writeText(csv).then(
    () => {
      console.log('Bids copied to clipboard');
    },
    (err) => {
      console.error('Failed to copy to clipboard:', err);
      throw err;
    },
  );
}

/**
 * Get a subset of fields for a simpler export
 */
export const SIMPLIFIED_BID_EXPORT_FIELDS = [
  { key: 'vendorName', label: 'Vendor' },
  { key: 'productGrade', label: 'Product' },
  { key: 'baseUnitPrice', label: 'Base Price' },
  { key: 'currency', label: 'Currency' },
  { key: 'uom', label: 'UOM' },
  { key: 'intoPlaneFee', label: 'Into-Plane Fee' },
  { key: 'handlingFee', label: 'Handling Fee' },
  { key: 'paymentTerms', label: 'Payment Terms' },
  { key: 'creditDays', label: 'Credit Days' },
  { key: 'decision', label: 'Decision' },
] as const;

/**
 * Create a simplified spreadsheet view with key fields only
 */
export function convertBidsToSimplifiedSpreadsheetData(
  bids: FuelBid[],
): Array<Array<CellBase<any>>> {
  if (!bids || bids.length === 0) return [];

  // Create header row
  const headerRow: Array<CellBase<any>> = SIMPLIFIED_BID_EXPORT_FIELDS.map((field) => ({
    value: field.label,
    readOnly: true,
    className: 'font-bold bg-gray-100',
  }));

  // Create data rows
  const dataRows: Array<Array<CellBase<any>>> = bids.map((bid) => {
    return SIMPLIFIED_BID_EXPORT_FIELDS.map((field) => ({
      value: formatCellValue(bid[field.key as keyof FuelBid]),
    }));
  });

  return [headerRow, ...dataRows];
}
