import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  AlignJustify,
  ListFilter,
  Download,
} from 'lucide-react';

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
  density: initialDensity = 'default', // 'compact' | 'default'
  enableExportCsv = true,
  filename = 'export-data',
  onExportCsv,
  className = '',
}) => {
  const [density, setDensity] = useState(initialDensity);
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  const handleHeaderSort = (col) => {
    if (!col.sortable || !onSort) return;
    onSort(col.key || col.accessor);
  };

  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv(data);
      return;
    }
    if (!data || data.length === 0) return;

    const exportCols = columns.filter(
      (c) => c.key !== 'actions' && c.key !== 'action' && (c.key || c.accessor)
    );

    const headers = exportCols.map((c) => `"${(c.label || c.title || c.key || '').replace(/"/g, '""')}"`);
    const rows = data.map((row) =>
      exportCols
        .map((c) => {
          const val = row[c.key || c.accessor];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') {
            if (val.name) return `"${String(val.name).replace(/"/g, '""')}"`;
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isCompact = density === 'compact';
  const cellPadding = isCompact ? 'px-3 py-2 text-[12px]' : 'px-4 py-3 text-[13px]';
  const headerPadding = isCompact ? 'px-3 py-2 text-[11px]' : 'px-4 py-2.5 text-[11px]';

  return (
    <div
      className={`w-full overflow-hidden flex flex-col bg-white border border-[var(--admin-border)] rounded-admin-lg ${className}`}
    >
      {/* Table toolbar / Density toggle & Export CSV (shown if data exists) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--admin-border-subtle)] bg-[var(--admin-surface-subtle)] text-[11px] text-[var(--admin-text-muted)]">
        <div className="flex items-center gap-2">
          {totalCount !== undefined ? (
            <span>
              Showing <strong className="font-semibold text-[var(--admin-text-primary)]">{data.length}</strong> of{' '}
              <strong className="font-semibold text-[var(--admin-text-primary)]">{totalCount}</strong> records
            </span>
          ) : (
            <span><strong className="font-semibold text-[var(--admin-text-primary)]">{data.length}</strong> items</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {enableExportCsv && data.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-admin-sm hover:bg-white text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] border border-transparent hover:border-[var(--admin-border)] transition-colors"
              title="Export visible records to CSV"
            >
              <Download className="w-3 h-3" />
              <span className="text-[10px]">Export CSV</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setDensity(isCompact ? 'default' : 'compact')}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-admin-sm hover:bg-white text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] border border-transparent hover:border-[var(--admin-border)] transition-colors"
            title={`Toggle table density (current: ${density})`}
          >
            <AlignJustify className="w-3 h-3" />
            <span className="capitalize text-[10px]">{isCompact ? 'Compact' : 'Comfortable'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-subtle)] font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider sticky top-0 z-10">
              {selectable && (
                <th className={`w-10 text-center ${headerPadding}`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => el && (el.indeterminate = someSelected)}
                    onChange={onSelectAll}
                    className="rounded border-[var(--admin-border-strong)] text-[var(--admin-brand)] focus:ring-[var(--admin-brand)] cursor-pointer"
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
                    className={`${headerPadding} ${col.headerClassName || ''} ${
                      col.sortable ? 'cursor-pointer hover:bg-[var(--admin-border-subtle)] select-none' : ''
                    }`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{headerText}</span>
                      {col.sortable && (
                        <span className="text-[var(--admin-text-placeholder)]">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[var(--admin-text-primary)]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[var(--admin-text-primary)]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-[var(--admin-border-strong)]" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border-subtle)] text-[var(--admin-text-secondary)]">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--admin-brand)]" />
                    <span className="text-xs text-[var(--admin-text-muted)] font-medium">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <div className="w-10 h-10 rounded-admin-md bg-[var(--admin-surface-subtle)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-placeholder)]">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--admin-text-primary)]">No records found</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">{emptyMessage}</p>
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
                      isSelected
                        ? 'bg-[var(--admin-surface-subtle)]'
                        : 'hover:bg-[#F9FAFB]'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    style={{ transitionDuration: 'var(--admin-duration-micro)' }}
                  >
                    {selectable && (
                      <td
                        className={`w-10 text-center ${cellPadding}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(id)}
                          className="rounded border-[var(--admin-border-strong)] text-[var(--admin-brand)] focus:ring-[var(--admin-brand)] cursor-pointer"
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
                        <td key={colKey} className={`${cellPadding} ${col.className || ''}`}>
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
        <div className="px-4 py-3 border-t border-[var(--admin-border)] bg-[var(--admin-surface-subtle)] flex items-center justify-between text-xs text-[var(--admin-text-muted)]">
          <div>
            {totalCount !== undefined && (
              <span>
                Page <strong className="text-[var(--admin-text-primary)]">{page}</strong> of{' '}
                <strong className="text-[var(--admin-text-primary)]">{totalPages}</strong> ({totalCount} total)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-admin-md border border-[var(--admin-border)] bg-white hover:bg-[var(--admin-surface-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[var(--admin-text-secondary)]"
              aria-label="Previous page"
              style={{ transitionDuration: 'var(--admin-duration-micro)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-xs font-semibold text-[var(--admin-text-primary)]">
              {page}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-admin-md border border-[var(--admin-border)] bg-white hover:bg-[var(--admin-surface-subtle)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[var(--admin-text-secondary)]"
              aria-label="Next page"
              style={{ transitionDuration: 'var(--admin-duration-micro)' }}
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
