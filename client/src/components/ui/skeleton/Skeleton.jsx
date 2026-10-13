import React from 'react';
import clsx from 'clsx';

/**
 * Skeleton Primitive
 *
 * Base building block for synchronized skeleton loaders.
 * - Decorative elements are strictly `aria-hidden="true"`.
 * - Uses GPU-accelerated `.skeleton-shimmer` or `.skeleton-shimmer-dark`.
 * - Respects prefers-reduced-motion automatically via tailwind.css rules.
 */
export const Skeleton = ({
  className = '',
  dark = false,
  rounded = 'rounded-md',
  style,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        rounded,
        dark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer',
        'select-none pointer-events-none transform-gpu',
        className
      )}
      style={style}
      {...props}
    />
  );
};

export default Skeleton;
