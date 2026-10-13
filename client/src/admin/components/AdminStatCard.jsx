import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

/**
 * AdminStatCard
 *
 * Executive KPI Metric Card:
 * - Playfair Display hero typography for prestige numbers
 * - JetBrains Mono for currency & technical metric precision
 * - Soft 1px border with delicate hover elevation
 * - Subtle status / delta indicators
 * - Smooth Quartic rolling telemetry via AnimatedCounter
 */
export const AdminStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const isDark = variant === 'dark';
  const isPrimary = variant === 'primary';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border p-5 transition-all duration-200 group hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isDark
          ? 'bg-gradient-to-br from-[#06180E] to-[#0A2619] border-primary-800 text-white shadow-card hover:border-primary-700'
          : isPrimary
          ? 'bg-primary-900 border-primary-800 text-white shadow-card hover:border-primary-700'
          : 'bg-white border-neutral-200/90 text-neutral-900 shadow-subtle hover:shadow-card hover:border-neutral-400'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p
            className={`text-xs font-semibold tracking-wider uppercase ${
              isDark || isPrimary ? 'text-neutral-300' : 'text-neutral-500'
            }`}
          >
            {title}
          </p>

          <div className="flex items-baseline gap-2 pt-1">
            <h3
              className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight ${
                isDark || isPrimary ? 'text-white' : 'text-neutral-900'
              }`}
            >
              <AnimatedCounter value={value} duration={1.2} />
            </h3>

            {badge && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isDark || isPrimary
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              isDark || isPrimary
                ? 'bg-white/10 border-white/15 text-white'
                : 'bg-neutral-100 border-neutral-200 text-neutral-900'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-neutral-100/80 flex items-center justify-between text-xs">
          {subtitle && (
            <p className={`${isDark || isPrimary ? 'text-neutral-300' : 'text-neutral-500'} truncate`}>
              {subtitle}
            </p>
          )}

          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold text-[11px] ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-neutral-400 font-normal ml-0.5">({trend.label})</span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStatCard;
