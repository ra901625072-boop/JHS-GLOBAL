import React from 'react';
import clsx from 'clsx';
import Skeleton from './Skeleton';

/**
 * SkeletonMedia
 *
 * Dedicated aspect-ratio media placeholder that enforces strict zero-CLS
 * box reserving for product images, certificates, blogs, and heroes.
 */
export const SkeletonMedia = ({
  aspectRatio = 'aspect-[4/3]',
  rounded = 'rounded-none',
  dark = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={clsx('relative w-full overflow-hidden', aspectRatio, rounded, className)}
      {...props}
    >
      <Skeleton
        dark={dark}
        rounded={rounded}
        className="absolute inset-0 h-full w-full"
      />
      {children && (
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default SkeletonMedia;
