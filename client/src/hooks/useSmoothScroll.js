import { useEffect, useRef } from 'react';
import { isReducedMotion } from '../styles/motion';

/**
 * useSmoothScroll Hook
 *
 * Provides inertial, grounded smooth scrolling using Lenis, tightly coupled to GSAP ScrollTrigger.
 * - Gentle calibration: duration 1.1s, natural exponential decay easing, wheelMultiplier 1.0.
 * - Accessibility: Completely bypassed when prefers-reduced-motion is active.
 * - Performance: Dynamic import loaded post-paint, completely omitted on mobile/touch screens (<1024px).
 * - Cleanup: Tears down Lenis and removes GSAP ticker listener on unmount.
 */
export const useSmoothScroll = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Hard requirement: Disable Lenis when user requests reduced motion or on touch/mobile devices (<1024px)
    const isTouchOrMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 1024 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));

    if (isReducedMotion() || isTouchOrMobile) {
      return;
    }

    let isCancelled = false;
    let tickerHandler = null;
    let activeGsap = null;

    Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      if (isCancelled) return;

      activeGsap = gsap;
      gsap.registerPlugin(ScrollTrigger);

      // Initialize Lenis with refined, responsive inertial scroll
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 4), // Classic Quartic ease-out: responsive initial tick, buttery exponential glide
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      });

      lenisRef.current = lenis;

      // Synchronize Lenis scroll positions with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      tickerHandler = (time) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerHandler);
      window.__lenis = lenis;
    }).catch((err) => {
      console.warn('Smooth scroll initialization deferred or bypassed:', err);
    });

    return () => {
      isCancelled = true;
      if (activeGsap && tickerHandler) {
        activeGsap.ticker.remove(tickerHandler);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      delete window.__lenis;
    };
  }, []);

  return lenisRef;
};

export default useSmoothScroll;
