import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

/**
 * Button Component
 *
 * Micro-interactions:
 * - 150ms hover duration with standard decelerated curve.
 * - 0.98x active press scaling for tactile feedback on click/tap.
 * - Disabled state prevents pointer events and scaling.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 active:scale-[0.98] transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none min-h-[44px]';

  const variants = {
    // High-contrast conversion button
    cta: 'bg-cta-500 hover:bg-cta-600 text-white shadow-card hover:shadow-hover focus:ring-cta-500 font-semibold',
    // Trust brand primary
    primary: 'bg-primary-800 hover:bg-primary-900 text-white focus:ring-primary-800 shadow-subtle hover:shadow-card',
    // Sparing gold accent
    accent: 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500 hover:bg-accent-600',
    // Outline (for light surfaces)
    outline: 'border border-primary-800 text-primary-800 hover:bg-primary-50 focus:ring-primary-800',
    // Outline on dark backgrounds (Hero, dark sections)
    'outline-light': 'border border-neutral-300/60 hover:border-white text-white hover:text-white bg-white/5 hover:bg-white/15 focus:ring-white/50 backdrop-blur-xs',
    // Secondary subtle
    secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 focus:ring-neutral-400',
    // Ghost
    ghost: 'hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-4 py-2.5 text-sm sm:text-base',
    lg: 'px-6 py-3.5 text-base sm:text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className
        )
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
