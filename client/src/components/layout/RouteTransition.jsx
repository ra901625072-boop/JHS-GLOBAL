import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteTransition Component
 *
 * Provides a short, calm route transition (250ms) across page changes.
 * - Animates strictly compositor properties: `opacity` and `transform`.
 * - Automatically scrolls to top on navigation (synchronizing with Lenis smooth scroll).
 * - Bypasses spatial translation when prefers-reduced-motion is active.
 */
export const RouteTransition = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top immediately on route change
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      className="w-full transform-gpu animate-route-enter motion-reduce:animate-none"
    >
      {children}
    </div>
  );
};

export default RouteTransition;
