import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonMedia, SkeletonText, SkeletonCircle } from '../../components/ui/skeleton';

describe('UI Component: Skeleton Loaders Suite (Zero-CLS & A11y)', () => {
  it('enforces aria-hidden="true" on base Skeleton primitive to avoid screen-reader noise', () => {
    const { container } = render(<Skeleton className="w-48 h-6" />);
    const skeletonEl = container.firstChild;
    expect(skeletonEl).toHaveAttribute('aria-hidden', 'true');
    expect(skeletonEl).toHaveClass('skeleton-shimmer');
  });

  it('renders dark shimmer variant when dark prop is true', () => {
    const { container } = render(<Skeleton dark className="w-48 h-6" />);
    const skeletonEl = container.firstChild;
    expect(skeletonEl).toHaveClass('skeleton-shimmer-dark');
  });

  it('SkeletonMedia preserves aspect ratio to guarantee zero CLS layout shift', () => {
    const { container } = render(
      <SkeletonMedia aspectRatio="aspect-[16/9]" rounded="rounded-lg" />
    );
    const mediaWrapper = container.firstChild;
    expect(mediaWrapper).toHaveAttribute('aria-hidden', 'true');
    expect(mediaWrapper).toHaveClass('aspect-[16/9]');
    expect(mediaWrapper).toHaveClass('rounded-lg');
  });

  it('SkeletonText renders the exact count of lines requested', () => {
    const { container } = render(<SkeletonText lines={4} gap="space-y-3" />);
    const lines = container.querySelectorAll('.skeleton-shimmer');
    expect(lines.length).toBe(4);
  });

  it('SkeletonCircle renders equal width and height circle dimensions', () => {
    const { container } = render(<SkeletonCircle size="w-12 h-12" />);
    const circle = container.firstChild;
    expect(circle).toHaveClass('rounded-full');
    expect(circle).toHaveClass('w-12');
    expect(circle).toHaveClass('h-12');
  });
});
