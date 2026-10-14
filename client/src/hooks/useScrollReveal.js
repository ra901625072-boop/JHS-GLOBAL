import { useEffect, useRef } from 'react';
import { motionTokens, isReducedMotion } from '../styles/motion';

let gsapLoader = null;
const loadGsap = () => {
  if (!gsapLoader) {
    gsapLoader = import('gsap').then((m) => m.gsap);
  }
  return gsapLoader;
};

/**
 * useScrollReveal Hook
 *
 * Professional scroll-triggered entrance reveals using GSAP driven by native IntersectionObserver.
 * Ensures animations trigger strictly when elements physically enter the viewport.
 * Elements never trigger prematurely while off-screen.
 *
 * Rules strictly followed:
 * 1. Only animates `transform` and `opacity`. Never layout properties (width, height, top, left).
 * 2. Clears `willChange` after animation completes to conserve GPU memory.
 * 3. Immediately renders final state if `prefers-reduced-motion` is active.
 * 4. Automatic cleanup on unmount via isolated `gsap.context()`.
 * 5. Plays once (`once: true`) by default to prevent reverse-scroll jumping.
 */
const resolveTargets = (container, selector) => {
  if (!container) return [];
  if (!selector) return [container];
  if (selector === '> *' || selector === ':scope > *') {
    return Array.from(container.children);
  }
  if (typeof selector === 'string' && selector.startsWith('>')) {
    try {
      return Array.from(container.querySelectorAll(`:scope ${selector}`));
    } catch {
      return Array.from(container.children);
    }
  }
  try {
    const found = container.querySelectorAll(selector);
    return found.length > 0 ? Array.from(found) : [container];
  } catch (err) {
    console.warn('Invalid selector in useScrollReveal:', selector, err);
    return [container];
  }
};

export const useScrollReveal = (options = {}) => {
  const {
    direction = 'up',
    distance = motionTokens.distance.reveal,
    duration = motionTokens.duration.slow / 1000, // 0.5s
    delay = 0,
    ease = motionTokens.gsapEasing.standard,
    stagger = 0,
    selector = null,
    once = true,
    disabled = false,
  } = options;

  const containerRef = useRef(null);

  useEffect(() => {
    if (disabled || !containerRef.current) return;

    const targets = resolveTargets(containerRef.current, selector);
    if (!targets || targets.length === 0) return;

    // Handle reduced motion accessibility: reveal immediately without spatial motion
    if (isReducedMotion()) {
      targets.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    let ctx = null;
    let observer = null;
    let isCancelled = false;

    loadGsap().then((gsap) => {
      if (isCancelled || !containerRef.current) return;

      ctx = gsap.context(() => {
        // Compute initial spatial offsets
        let initialX = 0;
        let initialY = 0;

        if (direction === 'up') initialY = distance;
        else if (direction === 'down') initialY = -distance;
        else if (direction === 'left') initialX = distance;
        else if (direction === 'right') initialX = -distance;

        // Initialize hidden starting state
        gsap.set(targets, {
          opacity: 0,
          x: initialX,
          y: initialY,
          willChange: 'transform, opacity',
        });

        // Robust IntersectionObserver guarantees animation triggers strictly when visible in viewport
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                gsap.to(targets, {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  duration,
                  delay,
                  ease,
                  stagger:
                    stagger > 0
                      ? { each: stagger, amount: Math.min(stagger * targets.length, 0.48) }
                      : 0,
                  onComplete: () => {
                    gsap.set(targets, { willChange: 'auto', clearProps: 'transform' });
                  },
                });

                if (once) {
                  observer.unobserve(entry.target);
                }
              } else if (!once) {
                gsap.to(targets, {
                  opacity: 0,
                  x: initialX,
                  y: initialY,
                  duration: duration * 0.5,
                  ease: 'power2.in',
                });
              }
            });
          },
          {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px', // Must physically enter at least 40px into the viewport
          }
        );

        observer.observe(containerRef.current);
      }, containerRef);
    });

    return () => {
      isCancelled = true;
      if (observer) observer.disconnect();
      if (ctx) ctx.revert();
    };
  }, [direction, distance, duration, delay, ease, stagger, selector, once, disabled]);

  return containerRef;
};

export default useScrollReveal;
