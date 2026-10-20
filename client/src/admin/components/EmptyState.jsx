import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — Phase 2
 *
 * Restrained operational empty state:
 * - Specific microcopy rather than generic text
 * - Optional primary action
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching the current view or filters.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto ${className}`}
    >
      <div className="w-10 h-10 rounded-admin-md bg-[var(--admin-surface-subtle)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-placeholder)] mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--admin-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--admin-text-muted)] mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
