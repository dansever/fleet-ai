'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/stories/Button/Button';
import { downloadTableAsCSV } from '@/utils/download-csv';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Expand,
  FileDown,
  FilterIcon,
  SearchIcon,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  normalizeAccessor?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  showNormalizedRow?: boolean;
  csvDownload?: boolean;
  csvFilename?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  description,
  searchable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  className = '',
  onRowClick,
  rowClassName,
  showNormalizedRow = true,
  csvDownload = true,
  csvFilename,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) =>
          String(item[key]).toLowerCase().includes(value.toLowerCase()),
        );
      }
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn] as string | number;
        const bValue = b[sortColumn] as string | number;

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const handleCSVDownload = () => {
    // Use filtered data for CSV export (respects current search/filter state)
    const dataToExport = filteredData;

    // Convert columns to format expected by CSV utility
    const csvColumns = columns.map((col) => ({
      key: col.key,
      header: col.header,
      accessor: col.accessor
        ? (item: T) => {
            const value = col.accessor!(item);
            // Convert React nodes to string for CSV
            if (value && typeof value === 'object' && typeof (value as any).props === 'object') {
              const props = (value as any).props;
              return String(props.children || value);
            }
            return value;
          }
        : undefined,
    }));

    // Generate filename
    const filename = csvFilename || title || 'table-data';

    downloadTableAsCSV(dataToExport, filename, csvColumns);
  };

  return (
    <div>
      {/* Header */}
      {(title || description) && (
        <div className="p-6 border-b border-gray-200/50">
          {title && <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>}
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      {/* Controls */}
      {(searchable || filterable) && (
        <div>
          {searchable && (
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
          )}

          {filterable && (
            <div className="flex flex-wrap gap-3">
              {columns
                .filter((col) => col.filterable)
                .map((column) => (
                  <div key={String(column.key)} className="flex-1 min-w-[200px]">
                    <Input
                      placeholder={`Filter by ${column.header}...`}
                      value={filters[String(column.key)] || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [String(column.key)]: e.target.value,
                        }))
                      }
                      className="rounded-2xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Button Container */}
      <div className="w-full max-w-full flex justify-end p-4 gap-2">
        {csvDownload && (
          <Button
            intent="info"
            size="sm"
            text="Download"
            icon={FileDown}
            onClick={handleCSVDownload}
            disabled={filteredData.length === 0}
          />
        )}
        <Button disabled intent="info" size="sm" text="Full View" icon={Expand} />
      </div>

      <div
        className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-lg ${className}`}
      >
        {/* Table */}
        <div className="w-full max-w-full overflow-x-auto">
          <ScrollArea className="w-full max-w-full rounded-3xl">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-400/50">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={`px-6 py-4 text-left text-sm font-semibold text-gray-800 bg-secondary/30 ${
                        column.sortable ? 'cursor-pointer hover:bg-secondary/40' : ''
                      } ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(String(column.key))}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {column.sortable && getSortIcon(String(column.key))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <React.Fragment key={index}>
                    {/* Original row */}
                    <tr
                      className={`border-b border-gray-100/50 hover:bg-gray-50/30 ransition-colors ${
                        onRowClick ? 'cursor-pointer' : ''
                      } ${rowClassName ? rowClassName(item) : ''}`}
                      onClick={() => onRowClick?.(item)}
                    >
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={`px-6 py-4 text-sm text-gray-700 ${
                            column.align === 'center'
                              ? 'text-center'
                              : column.align === 'right'
                                ? 'text-right'
                                : ''
                          }`}
                        >
                          {column.accessor
                            ? column.accessor(item)
                            : (item as any)[column.key as keyof T]}
                        </td>
                      ))}
                    </tr>

                    {/* Normalized row */}
                    {showNormalizedRow && (
                      <tr className="border-b border-gray-100/50 bg-accent/20">
                        {columns.map((column, i) => (
                          <td
                            key={`${String(column.key)}-normalized`}
                            className={`px-6 py-2 text-xs text-gray-600 ${
                              column.align === 'center'
                                ? 'text-center'
                                : column.align === 'right'
                                  ? 'text-right'
                                  : ''
                            }`}
                          >
                            {/* Small prefix label only once per row if you like */}
                            {i === 0 ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-700">
                                  normalized
                                </span>
                                <span className="font-mono text-blue-500">
                                  {column.normalizeAccessor?.(item)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-xs font-mono text-blue-500">
                                {column.normalizeAccessor?.(item)}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            <br />
            <ScrollBar orientation="horizontal" className="px-4" />
          </ScrollArea>
        </div>

        {/* Empty State */}
        {paginatedData.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">
              <FilterIcon className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No results found</h4>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="p-6 border-t border-gray-200/50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{' '}
              results
            </div>
            <div className="flex items-center gap-2">
              <Button
                intent="ghost"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-xl"
                text="Previous"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      intent={currentPage === page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="rounded-xl w-10"
                      text={page.toString()}
                    />
                  );
                })}
              </div>
              <Button
                intent="ghost"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl"
                text="Next"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
