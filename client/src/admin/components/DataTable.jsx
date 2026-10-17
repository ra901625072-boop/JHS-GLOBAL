import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  sortColumn,
  sortDirection = 'asc',
  onSort,
  page = 1,
  totalPages = 1,
  totalCount,
  onPageChange,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  loading = false,
  emptyMessage = 'No matching records found in database.',
  onRowClick,
  className = '',
}) => {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  const handleHeaderSort = (col) => {
    if (!col.sortable || !onSort) return;
    onSort(col.key || col.accessor);
  };

  return (
    <div className={`w-full overflow-hidden flex flex-col bg-white ${className}`}>
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
              {selectable && (
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => el && (el.indeterminate = someSelected)}
                    onChange={onSelectAll}
                    className="rounded border-neutral-300 text-primary-900 focus:ring-primary-800"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col, cIdx) => {
                const colKey = col.key || col.accessor || col.id || col.header || col.title || `col-${cIdx}`;
                const sortKey = col.key || col.accessor || colKey;
                const isSorted = sortColumn === sortKey;
                const headerText = col.label || col.header || col.title || '';
                return (
                  <th
                    key={colKey}
                    scope="col"
                    onClick={() => handleHeaderSort(col)}
                    className={`p-3.5 ${col.headerClassName || ''} ${
                      col.sortable ? 'cursor-pointer hover:bg-neutral-100/80 select-none' : ''
                    }`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{headerText}</span>
                      {col.sortable && (
                        <span className="text-neutral-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-primary-900" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-primary-900" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-neutral-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-neutral-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-900" />
                    <span className="text-xs font-medium text-neutral-500">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-neutral-400"
                >
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700">No records found</p>
                    <p className="text-xs text-neutral-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const id = row[keyField] ?? row._id ?? idx;
                const isSelected = selectedRows.includes(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      isSelected ? 'bg-primary-50/50' : 'hover:bg-neutral-50/70'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {selectable && (
                      <td
                        className="p-3 w-10 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(id)}
                          className="rounded border-neutral-300 text-primary-900 focus:ring-primary-800"
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    )}
                    {columns.map((col, cIdx) => {
                      const colKey = col.key || col.accessor || col.id || col.header || col.title || `col-${cIdx}`;
                      const colField = col.key || col.accessor;
                      const cellVal = (colField !== undefined && row && typeof row === 'object') ? row[colField] : undefined;

                      let cellContent;
                      if (typeof col.cell === 'function') {
                        cellContent = col.cell(row);
                      } else if (typeof col.render === 'function') {
                        cellContent = col.render(cellVal, row);
                      } else {
                        cellContent = cellVal ?? '—';
                      }

                      return (
                        <td key={colKey} className={`p-3.5 ${col.className || ''}`}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && onPageChange && (
        <div className="p-3 sm:px-4 border-t border-neutral-200/80 bg-neutral-50/60 flex items-center justify-between text-xs text-neutral-500">
          <div>
            {totalCount !== undefined && (
              <span>
                Page <strong className="text-neutral-800">{page}</strong> of{' '}
                <strong className="text-neutral-800">{totalPages}</strong> ({totalCount} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-xs font-semibold text-neutral-700">
              {page}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
