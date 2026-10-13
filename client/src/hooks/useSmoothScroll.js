import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isReducedMotion } from '../styles/motion';

// Register ScrollTrigger with GSAP core
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * useSmoothScroll Hook
 *
 * Provides inertial, grounded smooth scrolling using Lenis, tightly coupled to GSAP ScrollTrigger.
 * - Gentle calibration: duration 1.1s, natural exponential decay easing, wheelMultiplier 0.85.
 * - Accessibility: Completely bypassed when prefers-reduced-motion is active.
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

    // Initialize Lenis with refined, responsive inertial scroll
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4), // Classic Quartic ease-out: responsive initial tick, buttery exponential glide
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,  // Natural 1:1 wheel translation, zero sluggish friction
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll positions with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const handleTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(handleTicker);
    // Keep GSAP lag smoothing active to absorb dropped frames and prevent micro-stutters

    // Provide global access for anchor scrolling if needed
    window.__lenis = lenis;

    return () => {
      gsap.ticker.remove(handleTicker);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
      delete window.__lenis;
    };
  }, []);

  return lenisRef;
};

export default useSmoothScroll;
