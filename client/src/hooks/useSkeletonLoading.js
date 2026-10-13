import { useState, useEffect, useRef } from 'react';

/**
 * useSkeletonLoading
 *
 * Smooth, flicker-free skeleton loading coordinator:
 * 1. Fast Load Bypass: Waits `delayMs` (default 180ms) before mounting skeleton.
 *    If real content loads faster than 180ms, no skeleton flashes.
 * 2. Minimum Display Lock: If a skeleton is mounted, it remains visible for at least
 *    `minDisplayMs` (default 400ms) to prevent jarring quick blinks.
 * 3. Smooth Fade Transition: Exits with a 200ms opacity-only crossfade.
 * 4. Safety Timeout: After `timeoutMs` (default 12s), flags `isTimedOut` so views
 *    can gracefully offer retry buttons instead of hanging skeletons forever.
 * 5. Accessibility: Generates appropriate aria-busy and polite announcement contracts.
 */
export const useSkeletonLoading = ({
  isLoading,
  delayMs = 180,
  minDisplayMs = 400,
  timeoutMs = 12000,
  label = 'Loading export specifications',
} = {}) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const mountedTimestampRef = useRef(null);

  useEffect(() => {
    let delayTimer = null;
    let minDisplayTimer = null;
    let timeoutTimer = null;

    if (isLoading) {
      setIsTimedOut(false);

      // 1. Wait delayMs before displaying the skeleton
      delayTimer = setTimeout(() => {
        mountedTimestampRef.current = Date.now();
        setShowSkeleton(true);
      }, delayMs);

      // 2. Timeout protection (fail gracefully after timeoutMs)
      timeoutTimer = setTimeout(() => {
        setIsTimedOut(true);
      }, timeoutMs);
    } else {
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);

      if (showSkeleton && mountedTimestampRef.current) {
        // Enforce minimum display duration to prevent flicker
        const elapsed = Date.now() - mountedTimestampRef.current;
        const remaining = Math.max(0, minDisplayMs - elapsed);

        minDisplayTimer = setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            setShowSkeleton(false);
            setIsFading(false);
            mountedTimestampRef.current = null;
          }, 200); // 200ms opacity crossfade
        }, remaining);
      } else {
        setShowSkeleton(false);
        setIsFading(false);
      }
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minDisplayTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading, delayMs, minDisplayMs, timeoutMs, showSkeleton]);

  const containerProps = showSkeleton
    ? {
        'aria-busy': 'true',
        'aria-live': 'polite',
        role: 'status',
      }
    : {
        'aria-busy': 'false',
      };

  return {
    showSkeleton,
    isFading,
    isTimedOut,
    containerProps,
    srLabel: showSkeleton ? `${label}...` : null,
  };
};

export default useSkeletonLoading;
