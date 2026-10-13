import React from 'react';
import clsx from 'clsx';
import Skeleton from './Skeleton';

/**
 * SkeletonCircle
 *
 * Circular skeleton primitive for avatars, icons, badges, and status dots.
 */
export const SkeletonCircle = ({
  size = 'w-10 h-10',
  dark = false,
  className = '',
  ...props
}) => {
  return (
    <Skeleton
      dark={dark}
      rounded="rounded-full"
      className={clsx('flex-shrink-0', size, className)}
      {...props}
    />
  );
};

export default SkeletonCircle;
