/**
 * FilterBar Component
 * Reusable filter toolbar with search and filter options
 */

import React from 'react';

interface FilterOption {
  key: string;
  label: string;
  value: string | number | boolean;
}

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  filters?: {
    key: string;
    label: string;
    type: 'text' | 'select' | 'checkbox' | 'date';
    options?: FilterOption[];
    defaultValue?: any;
  }[];
  searchPlaceholder?: string;
  showReset?: boolean;
  onReset?: () => void;
}

export default function FilterBar({
  onSearch,
  onFilter,
  filters = [],
  searchPlaceholder = 'Ara...',
  showReset = true,
  onReset,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterValues, setFilterValues] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    onSearch?.(searchQuery);
  }, [searchQuery, onSearch]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  const handleReset = () => {
    setSearchQuery('');
    setFilterValues({});
    onReset?.();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      {onSearch && (
        <div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search"
          />
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filter.label}
              </label>

              {filter.type === 'text' && (
                <input
                  type="text"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              )}

              {filter.type === 'select' && (
                <select
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seçiniz</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.key} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'checkbox' && (
                <div className="space-y-2">
                  {filter.options?.map((opt) => (
                    <label key={opt.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filterValues[filter.key]?.includes(opt.value) || false}
                        onChange={(e) => {
                          const current = filterValues[filter.key] || [];
                          const updated = e.target.checked
                            ? [...current, opt.value]
                            : current.filter((v: any) => v !== opt.value);
                          handleFilterChange(filter.key, updated);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reset Button */}
      {showReset && (Object.keys(filterValues).length > 0 || searchQuery) && (
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
}
