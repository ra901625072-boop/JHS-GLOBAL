import React from 'react';

/**
 * Timeline — Phase 2
 *
 * Vertical activity timeline for RFQs and administrative events.
 */
export const Timeline = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) {
    return (
      <p className="text-xs text-[var(--admin-text-placeholder)] italic py-2">
        No historical activity recorded.
      </p>
    );
  }

  return (
    <div className={`relative pl-4 space-y-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[var(--admin-border)] ${className}`}>
      {items.map((item, idx) => (
        <div key={item.id || idx} className="relative flex items-start gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full -ml-[23px] border-2 bg-white flex items-center justify-center shrink-0 ${
              item.status === 'primary'
                ? 'border-[var(--admin-brand)] bg-[var(--admin-brand)]'
                : item.status === 'success'
                ? 'border-emerald-600 bg-emerald-600'
                : item.status === 'danger'
                ? 'border-rose-600 bg-rose-600'
                : 'border-[var(--admin-border-strong)]'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-xs font-semibold text-[var(--admin-text-primary)]">
                {item.title}
              </h4>
              {item.timestamp && (
                <span className="text-[10px] text-[var(--admin-text-placeholder)] font-mono whitespace-nowrap">
                  {item.timestamp}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5 leading-relaxed">
                {item.description}
              </p>
            )}
            {item.meta && (
              <div className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                {item.meta}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
