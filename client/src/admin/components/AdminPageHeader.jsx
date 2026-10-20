import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * AdminPageHeader — Phase 2
 * 
 * Standardized PageHeader primitive for all admin views:
 * - Breadcrumb navigation row (supports both breadcrumb and breadcrumbs props)
 * - Sans-serif page title (Plus Jakarta Sans 700) with proper optical balance
 * - Concise operational description
 * - Aligned right-hand action container
 * - Hairline border divider
 */
export const AdminPageHeader = ({
  breadcrumb = [],
  breadcrumbs,
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  const activeCrumbs = breadcrumbs || breadcrumb || [];

  return (
    <div className={`mb-6 pb-4 border-b border-[var(--admin-border)] ${className}`}>
      {/* Breadcrumb line */}
      {activeCrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--admin-text-muted)] uppercase tracking-wider mb-2">
          {activeCrumbs.map((crumb, idx) => {
            const isLast = idx === activeCrumbs.length - 1;
            const target = crumb.to || crumb.href;
            return (
              <React.Fragment key={crumb.label || idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[var(--admin-border-strong)] shrink-0" />}
                {target && !isLast ? (
                  <Link
                    to={target}
                    className="hover:text-[var(--admin-text-primary)] transition-colors"
                    style={{ transitionDuration: 'var(--admin-duration-micro)' }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-[var(--admin-text-primary)] font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight truncate">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-[13px] text-[var(--admin-text-muted)] mt-1 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageHeader;
