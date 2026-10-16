import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

export const FilterBar = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records by keyword, reference, company...',
  statusOptions = [],
  selectedStatus = 'all',
  onStatusChange,
  extraFilters,
  onClear,
  className = '',
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    (selectedStatus && selectedStatus !== 'all');

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800/30 focus:border-primary-800 focus:bg-white transition-all text-neutral-800 placeholder-neutral-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {extraFilters && <div className="flex flex-wrap items-center gap-2">{extraFilters}</div>}

        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100/80 hover:bg-neutral-200/80 rounded-xl border border-neutral-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Status Pills */}
      {statusOptions.length > 0 && onStatusChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 admin-scrollbar">
          {statusOptions.map((opt) => {
            const isSelected = selectedStatus === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onStatusChange(opt.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 transform-gpu active:scale-[0.98] ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200/80'
                }`}
              >
                <span>{opt.label}</span>
                {opt.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
