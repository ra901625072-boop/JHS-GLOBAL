import React from 'react';

/**
 * AdminSkeleton — Phase 2
 *
 * Content-shaped loading skeletons that match actual table columns and card layouts.
 * Prevents layout shifts during data loading.
 */
export const TableSkeleton = ({ rows = 6, cols = 6 }) => {
  const colWidths = ['w-24', 'w-40', 'w-28', 'w-48', 'w-16', 'w-20'];
  return (
    <div className="w-full bg-white rounded-admin-lg border border-[var(--admin-border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--admin-border-subtle)] bg-[var(--admin-surface-subtle)] flex items-center justify-between">
        <div className="h-4 bg-[#E5E7EB] rounded-admin-sm w-36 animate-pulse" />
        <div className="h-6 bg-[#E5E7EB] rounded-admin-sm w-20 animate-pulse" />
      </div>
      <div className="divide-y divide-[var(--admin-border-subtle)]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-4 py-3 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={`h-3.5 bg-[#F1F3F5] rounded-admin-sm animate-pulse ${
                  colWidths[cIdx % colWidths.length] || 'w-24'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-admin-lg border border-[var(--admin-border)] bg-white space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 bg-[#E5E7EB] rounded-admin-sm w-24 animate-pulse" />
            <div className="w-8 h-8 rounded-admin-md bg-[#F1F3F5] animate-pulse" />
          </div>
          <div className="h-7 bg-[#E5E7EB] rounded-admin-sm w-16 animate-pulse" />
          <div className="h-3 bg-[#F1F3F5] rounded-admin-sm w-32 pt-2 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export const DrawerSkeleton = () => {
  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2 border-b border-[var(--admin-border-subtle)] pb-4">
        <div className="h-5 bg-[#E5E7EB] rounded-admin-sm w-1/3 animate-pulse" />
        <div className="h-3 bg-[#F1F3F5] rounded-admin-sm w-2/3 animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-24 bg-white border border-[var(--admin-border)] rounded-admin-md animate-pulse" />
        <div className="h-32 bg-white border border-[var(--admin-border)] rounded-admin-md animate-pulse" />
        <div className="h-20 bg-white border border-[var(--admin-border)] rounded-admin-md animate-pulse" />
      </div>
    </div>
  );
};

export const AdminSkeleton = ({ variant = 'table', rows = 6, cols = 6, count = 4, className = '' }) => {
  if (variant === 'cards') return <div className={className}><CardGridSkeleton count={count} /></div>;
  if (variant === 'drawer') return <div className={className}><DrawerSkeleton /></div>;
  return <div className={className}><TableSkeleton rows={rows} cols={cols} /></div>;
};

export default AdminSkeleton;
