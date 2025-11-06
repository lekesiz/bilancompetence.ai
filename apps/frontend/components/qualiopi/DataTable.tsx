/**
 * DataTable Component
 * Reusable table with sorting, pagination, and filtering capabilities
 */

import React, { useState } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  rowsPerPage?: number;
  emptyMessage?: string;
  selectable?: boolean;
  onRowClick?: (row: any) => void;
  variant?: 'default' | 'striped' | 'bordered';
}

export default function DataTable({
  columns,
  data,
  title,
  rowsPerPage = 10,
  emptyMessage = 'Veri bulunamadı',
  selectable = false,
  onRowClick,
  variant = 'default',
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Sort data
  let sortedData = [...data];
  if (sortBy) {
    sortedData.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIdx, startIdx + rowsPerPage);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, i) => startIdx + i)));
    }
  };

  const handleSelectRow = (rowIdx: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIdx)) {
      newSelected.delete(rowIdx);
    } else {
      newSelected.add(rowIdx);
    }
    setSelectedRows(newSelected);
  };

  const variantClasses = {
    default: 'border-b border-gray-200',
    striped: 'border-b border-gray-200 hover:bg-gray-50',
    bordered: 'border border-gray-200 hover:bg-gray-50',
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 rounded-lg overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white ${col.width || 'auto'}`}
                  style={{ width: col.width }}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="flex items-center gap-2 hover:text-primary-600 transition"
                    >
                      {col.label}
                      {sortBy === col.key && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowIdx = startIdx + idx;
                return (
                  <tr
                    key={rowIdx}
                    className={`${variantClasses[variant]} cursor-pointer`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowIdx)}
                          onChange={() => handleSelectRow(rowIdx)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {startIdx + 1}-{Math.min(startIdx + rowsPerPage, sortedData.length)} / {sortedData.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
