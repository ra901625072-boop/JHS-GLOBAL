import React from 'react';
import { Search, Inbox, Loader2 } from 'lucide-react';

/**
 * AdminTableShell
 *
 * High-Density Data Grid Container:
 * - Unified toolbar (Search, category/status filters, action buttons)
 * - Sticky polished header line
 * - Built-in Loading skeleton and Empty state
 * - Clean row separation matching luxury tokens
 */
export const AdminTableShell = ({
  title,
  description,
  badge,
  actions,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters,
  totalCount,
  loading = false,
  empty = false,
  emptyMessage = 'No matching records found in database.',
  children,
  footer,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl border border-neutral-200/90 bg-white shadow-subtle overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Header & Action Bar */}
      {(title || actions || searchQuery !== undefined || filters) && (
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 bg-white space-y-3">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  {title && (
                    <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                      {title}
                    </h3>
                  )}
                  {badge && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200">
                      {badge}
                    </span>
                  )}
                  {totalCount !== undefined && (
                    <span className="text-xs text-neutral-400 font-mono">
                      ({totalCount} total)
                    </span>
                  )}
                </div>
                {description && (
                  <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
                )}
              </div>

              {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
          )}

          {/* Search & Filter Toolbar */}
          {(searchQuery !== undefined || filters) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              {searchQuery !== undefined && (
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-8 py-2.5 h-11 sm:h-9 text-base sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-800 focus:bg-white transition-all text-neutral-800 placeholder-neutral-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="overflow-x-auto min-w-full flex-1">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-7 h-7 text-primary-800 animate-spin" />
            <p className="text-xs text-neutral-500 font-medium">Loading commercial records...</p>
          </div>
        ) : empty ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">No records found</p>
              <p className="text-xs text-neutral-500 mt-1">{emptyMessage}</p>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-neutral-900 hover:text-black font-semibold underline"
                >
                  Clear search query
                </button>
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer / Pagination */}
      {footer ? (
        <div className="p-3 sm:px-5 border-t border-neutral-200/80 bg-neutral-50/70 text-xs text-neutral-500">
          {footer}
        </div>
      ) : totalCount !== undefined && totalCount > 0 ? (
        <div className="px-5 py-2.5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Displaying {totalCount} total verified records</span>
          <span className="text-neutral-500 font-sans text-[10px] uppercase font-semibold tracking-wider">ICC & APEDA Grounded</span>
        </div>
      ) : null}
    </div>
  );
};

export default AdminTableShell;
