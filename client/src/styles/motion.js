/**
 * Export B2B Motion Design System Tokens
 * 
 * Strict Motion Principles:
 * 1. Purposeful: Guides attention, confirms action, or reveals hierarchy.
 * 2. Subtle & Slow-in/Slow-out: Custom decelerated bezier curves, never bouncy or linear.
 * 3. Restraint: Small and quiet. Zero layout shift.
 * 4. Compositor only: Transform and Opacity only. Never width, height, top, or left.
 * 5. Instant bypass: Never block clicks, form fields, or the "Request a Quote" CTA.
 */

export const motionTokens = {
  duration: {
    instant: 0,
    fast: 150,     // Micro-interactions, button active, badges (150ms)
    base: 300,     // Card hover, dropdowns, tabs, modals (300ms)
    slow: 600,     // Section scroll reveals, drawer slide (600ms)
    hero: 900,     // Signature hero masked unveil (900ms)
  },

  // Milliseconds formatted as CSS strings
  durationCss: {
    instant: '0ms',
    fast: '150ms',
    base: '300ms',
    slow: '600ms',
    hero: '900ms',
  },

  // Easing curves (CSS cubic-bezier)
  easing: {
    // Smooth deceleration curve: fast arrival, calm, elegant settle
    standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
    // Swift entrance for incoming elements
    enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // Prompt exit curve for departing elements
    exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
    // Linear (strictly for continuous tickers/marquees)
    linear: 'linear',
  },

  // Easing strings for GSAP
  gsapEasing: {
    standard: 'power3.out',
    enter: 'power3.out',
    exit: 'power2.in',
    linear: 'none',
  },

  // Stagger timings
  stagger: {
    fast: 0.04,    // 40ms between compact list items
    base: 0.06,    // 60ms between cards (max 6 items = 360ms max sequence)
    maxItems: 6,   // Maximum elements in a stagger chain
  },

  // Physical spatial travel distances (pixels)
  distance: {
    micro: 4,      // Button active press / subtle nudge
    subtle: 10,    // Badges, secondary metadata
    reveal: 20,    // Standard reveals (16-32px range)
    hero: 28,      // Signature hero reveal
  },

  // ScrollTrigger defaults
  scrollTrigger: {
    start: 'top 85%', // Element 85% into the viewport, plays once
    once: true,       // Plays once, stays rendered, zero layout jump on reverse scroll
  },
};

/**
 * Utility: Check if the user has requested reduced motion
 */
export const isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default motionTokens;
