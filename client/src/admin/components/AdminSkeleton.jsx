import React from 'react';

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-neutral-200/90 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="h-6 bg-neutral-200/70 rounded w-1/4" />
        <div className="h-8 bg-neutral-200/60 rounded w-1/3" />
      </div>
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="p-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-neutral-200/60 rounded"
                style={{ width: `${Math.max(12, 100 / cols - 4)}%` }}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-xl border border-neutral-200/80 bg-white space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 bg-neutral-200/70 rounded w-1/2" />
            <div className="w-8 h-8 rounded-lg bg-neutral-200/60" />
          </div>
          <div className="h-7 bg-neutral-200/80 rounded w-3/4" />
          <div className="h-3 bg-neutral-100 rounded w-full pt-2" />
        </div>
      ))}
    </div>
  );
};

export const DrawerSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="space-y-2 border-b border-neutral-100 pb-4">
        <div className="h-5 bg-neutral-200/80 rounded w-1/3" />
        <div className="h-3 bg-neutral-200/60 rounded w-2/3" />
      </div>
      <div className="space-y-4">
        <div className="h-24 bg-neutral-100 rounded-xl" />
        <div className="h-32 bg-neutral-100 rounded-xl" />
        <div className="h-20 bg-neutral-100 rounded-xl" />
      </div>
    </div>
  );
};

export const AdminSkeleton = ({ variant = 'table', rows = 5, cols = 6, count = 4, className = '' }) => {
  if (variant === 'cards') return <div className={className}><CardGridSkeleton count={count} /></div>;
  if (variant === 'drawer') return <div className={className}><DrawerSkeleton /></div>;
  return <div className={className}><TableSkeleton rows={rows} cols={cols} /></div>;
};

export default AdminSkeleton;
