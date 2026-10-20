import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

/**
 * AdminStatCard — Phase 2
 *
 * Flat border card with clear type hierarchy.
 * No hover lift. No gradient variants. No shadow on default.
 * Uses CSS custom properties from .admin-root.
 */
export const AdminStatCard = ({
  title,
  label,
  value,
  subtitle,
  sublabel,
  icon: Icon,
  trend,
  badge,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const displayTitle = title || label;
  const displaySubtitle = subtitle || sublabel;
  const isDark = variant === 'dark';
  const isPrimary = variant === 'primary';

  const badgeText = typeof badge === 'object' && badge !== null ? badge.text : badge;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-admin-lg p-5 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isDark || isPrimary
          ? 'bg-[#06180E] border border-[#0A2619] text-white'
          : 'bg-white border border-[var(--admin-border)] text-[var(--admin-text-primary)]'
      } ${className}`}
      style={{ transitionDuration: 'var(--admin-duration-micro)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p
            className={`text-[11px] font-semibold tracking-wider uppercase truncate ${
              isDark || isPrimary ? 'text-neutral-400' : 'text-[var(--admin-text-muted)]'
            }`}
          >
            {displayTitle}
          </p>

          <div className="flex items-baseline gap-2 pt-0.5 flex-wrap">
            <h3
              className={`text-2xl font-bold tracking-tight tabular-nums ${
                isDark || isPrimary ? 'text-white' : 'text-[var(--admin-text-primary)]'
              }`}
            >
              <AnimatedCounter value={value} duration={1.0} />
            </h3>

            {badgeText && (
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-admin-sm border uppercase tracking-wider ${
                  isDark || isPrimary
                    ? 'bg-white/10 text-white/70 border-white/15'
                    : 'bg-[var(--admin-surface-subtle)] text-[var(--admin-text-muted)] border-[var(--admin-border)]'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-8 h-8 rounded-admin-md flex items-center justify-center shrink-0 ${
              isDark || isPrimary
                ? 'bg-white/[0.08] text-white/60'
                : 'bg-[var(--admin-surface-subtle)] text-[var(--admin-text-muted)]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {(displaySubtitle || trend) && (
        <div
          className="mt-3 pt-3 flex items-center justify-between text-[12px] gap-2"
          style={{ borderTop: '1px solid var(--admin-border-subtle)' }}
        >
          {displaySubtitle && (
            <p className={`${isDark || isPrimary ? 'text-neutral-400' : 'text-[var(--admin-text-muted)]'} truncate`}>
              {displaySubtitle}
            </p>
          )}

          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium text-[11px] tabular-nums shrink-0 ${
                trend.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-[var(--admin-text-placeholder)] font-normal ml-0.5">({trend.label})</span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStatCard;
