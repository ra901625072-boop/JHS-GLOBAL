import React from 'react';
import { clsx } from 'clsx';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { motionTokens } from '../../styles/motion';

/**
 * Reveal Component
 *
 * Declarative wrapper for calm, purposeful scroll reveals across pages and sections.
 *
 * @param {string} as - HTML tag to render (default 'div')
 * @param {'up' | 'down' | 'left' | 'right' | 'none'} direction - Reveal direction
 * @param {number} distance - Travel distance in pixels (default 24px)
 * @param {number} duration - Animation duration in seconds (default 0.6s)
 * @param {number} delay - Delay before animation starts (default 0s)
 * @param {number} stagger - Stagger delay for multiple children (seconds)
 * @param {boolean} cascade - If true, automatically staggers direct children ('> *')
 * @param {string} selector - Custom CSS selector to target specific children
 * @param {string} start - ScrollTrigger start position (default 'top 85%')
 * @param {boolean} once - If true, animation triggers once and stays completed
 * @param {boolean} disabled - If true, skips animation
 */
export const Reveal = ({
  as = 'div',
  children,
  className = '',
  direction = 'up',
  distance = motionTokens.distance.reveal,
  duration = motionTokens.duration.slow / 1000,
  delay = 0,
  stagger = 0,
  cascade = false,
  selector = null,
  start = motionTokens.scrollTrigger.start,
  once = true,
  disabled = false,
  style = {},
  ...props
}) => {
  // If cascade is requested without an explicit selector, target all direct children safely
  const effectiveSelector = selector || (cascade ? ':scope > *' : null);
  const effectiveStagger = cascade && stagger === 0 ? motionTokens.stagger.base : stagger;

  const containerRef = useScrollReveal({
    direction,
    distance,
    duration,
    delay,
    stagger: effectiveStagger,
    selector: effectiveSelector,
    start,
    once,
    disabled,
  });

  const Component = as;

  return (
    <Component
      ref={containerRef}
      className={clsx('reveal-block', className)}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Reveal;
