import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

/**
 * FilterBar — Phase 2
 *
 * Restrained operational filter bar:
 * - Flat 1px border input with admin focus ring
 * - Soft-tint status selection pills
 * - Reset button with subtle styling
 */
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
          <Search className="w-4 h-4 text-[var(--admin-text-placeholder)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[var(--admin-border)] rounded-admin-md focus:outline-none focus:border-[var(--admin-brand)] focus:ring-1 focus:ring-[var(--admin-brand)] text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] transition-colors"
            style={{ transitionDuration: 'var(--admin-duration-micro)' }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-placeholder)] hover:text-[var(--admin-text-primary)] p-1 rounded-admin-sm transition-colors"
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
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] bg-[var(--admin-surface-subtle)] hover:bg-[#E5E7EB] rounded-admin-md border border-[var(--admin-border)] transition-colors"
            style={{ transitionDuration: 'var(--admin-duration-micro)' }}
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
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-admin-sm text-xs font-medium whitespace-nowrap transition-colors select-none ${
                  isSelected
                    ? 'bg-[var(--admin-brand)] text-white font-semibold'
                    : 'bg-white hover:bg-[var(--admin-surface-subtle)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] border border-[var(--admin-border)]'
                }`}
                style={{ transitionDuration: 'var(--admin-duration-micro)' }}
              >
                <span>{opt.label}</span>
                {opt.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-admin-sm font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--admin-surface-subtle)] text-[var(--admin-text-muted)]'
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
