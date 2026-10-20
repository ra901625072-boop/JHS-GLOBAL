import React from 'react';

/**
 * Tabs — Phase 2
 *
 * Clean horizontal tab bar with underline active indicator.
 * No pill shapes or heavy active backgrounds.
 */
export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-[var(--admin-border)] flex items-center gap-6 overflow-x-auto admin-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-2.5 text-xs font-medium whitespace-nowrap relative transition-colors flex items-center gap-1.5 ${
              isActive
                ? 'text-[var(--admin-text-primary)] font-semibold'
                : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]'
            }`}
            style={{ transitionDuration: 'var(--admin-duration-micro)' }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-admin-sm font-mono ${
                  isActive
                    ? 'bg-[var(--admin-surface-subtle)] text-[var(--admin-text-primary)] font-bold'
                    : 'bg-[#F1F3F5] text-[var(--admin-text-muted)]'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--admin-brand)] rounded-t-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
