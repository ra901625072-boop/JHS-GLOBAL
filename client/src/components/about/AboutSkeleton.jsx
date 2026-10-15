import React from 'react';
import { Skeleton, SkeletonText, SkeletonMedia } from '../ui/skeleton';

/**
 * AboutSkeleton
 * Layout-faithful skeleton mirror of the About Us page:
 * - Hero header placeholder
 * - 3 Foundation Pillars
 * - Merchants Story & Operating Principles
 * - Mission & Vision blocks
 * - 3 Commitments cards
 * - 3 Founder Dossier cards (with 3:4 portrait ratios)
 * - Closing statement band
 */
export const AboutSkeleton = () => {
  return (
    <div
      className="pb-20 bg-surface-canvas space-y-20 animate-pulse"
      data-testid="about-skeleton"
      aria-label="Loading About Us content..."
      aria-busy="true"
    >
      {/* 1. Hero Skeleton (Matches dark 2-column header layout) */}
      <div className="bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] py-16 lg:py-20 border-b border-primary-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Skeleton className="h-6 w-56 rounded-full bg-white/20" />
              <Skeleton className="h-12 sm:h-16 w-full rounded-xl bg-white/20" />
              <Skeleton className="h-8 w-80 rounded-lg bg-accent-400/20" />
              <div className="space-y-2 max-w-2xl">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-5/6 bg-white/10" />
                <Skeleton className="h-4 w-4/6 bg-white/10" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <Skeleton className="h-64 w-full rounded-3xl bg-white/10 border border-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Foundation 3 Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 rounded-2xl bg-white border border-surface-border space-y-4">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-7 w-40 rounded" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mission & Vision Skeleton */}
      <div className="bg-surface-subtle py-16 border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 p-8 rounded-2xl bg-white border border-surface-border space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-8 w-56 rounded" />
              <SkeletonText lines={4} />
            </div>
            <div className="lg:col-span-5 p-8 rounded-2xl bg-primary-950/20 border border-surface-border space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-8 w-48 rounded" />
              <SkeletonText lines={3} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Three Commitments Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-8 w-64 mx-auto rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 rounded-2xl bg-white border border-surface-border space-y-4">
              <Skeleton className="h-8 w-12 rounded" />
              <Skeleton className="h-7 w-48 rounded" />
              <SkeletonText lines={3} />
            </div>
          ))}
        </div>
      </div>

      {/* 5. 3 Founders Dossier Cards Skeleton (3:4 ratio) */}
      <div className="bg-surface-subtle py-16 border-y border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <Skeleton className="h-8 w-52 mx-auto rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-surface-border overflow-hidden">
                <SkeletonMedia aspectRatio="3/4" className="w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-7 w-48 rounded" />
                  <Skeleton className="h-4 w-40 rounded" />
                  <SkeletonText lines={3} />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSkeleton;
