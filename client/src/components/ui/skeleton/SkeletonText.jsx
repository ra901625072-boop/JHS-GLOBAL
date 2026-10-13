import React from 'react';
import clsx from 'clsx';
import Skeleton from './Skeleton';

/**
 * SkeletonText
 *
 * Renders multiple realistic text placeholder lines with varied widths
 * matching typography line-heights to eliminate layout shift.
 */
export const SkeletonText = ({
  lines = 2,
  widths = ['100%', '65%'],
  lineHeight = 'h-3.5',
  gap = 'gap-2',
  dark = false,
  className = '',
}) => {
  return (
    <div className={clsx('flex flex-col', gap, className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => {
        const width = widths[index % widths.length];
        return (
          <Skeleton
            key={index}
            dark={dark}
            className={clsx(lineHeight, 'rounded-sm')}
            style={{ width }}
          />
        );
      })}
    </div>
  );
};

export default SkeletonText;
