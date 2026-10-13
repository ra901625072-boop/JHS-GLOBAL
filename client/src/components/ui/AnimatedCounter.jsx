import React, { useEffect, useRef, useState } from 'react';
import { isReducedMotion } from '../../styles/motion';

/**
 * Parses numeric and non-numeric components from formatted strings
 * E.g.: "18,000+" -> { prefix: "", num: 18000, suffix: "+", decimals: 0 }
 *       "99.5%"   -> { prefix: "", num: 99.5, suffix: "%", decimals: 1 }
 *       "48 Hours"-> { prefix: "", num: 48, suffix: " Hours", decimals: 0 }
 */
const parseFormattedValue = (input) => {
  if (typeof input === 'number') {
    return { prefix: '', num: input, suffix: '', decimals: 0 };
  }

  const str = String(input).trim();
  // Match prefix, numeric portion (including commas/decimals), and suffix
  const match = str.match(/^([^\d.]*)(\d[\d,]*(?:\.\d+)?)(.*)$/);

  if (!match) {
    return { prefix: '', num: 0, suffix: str, decimals: 0, raw: str };
  }

  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';
  const num = parseFloat(numStr);

  const decimalParts = numStr.split('.');
  const decimals = decimalParts.length > 1 ? decimalParts[1].length : 0;

  return { prefix, num: isNaN(num) ? 0 : num, suffix, decimals };
};

/**
 * AnimatedCounter Component
 *
 * Smooth scroll-triggered rolling counter for statistics and metrics.
 * - Counts up once when visible in viewport.
 * - Gentle ease-out quartic deceleration curve for a calm, expensive feel.
 * - Reveals exact final formatted value at completion.
 * - Bypasses immediately when prefers-reduced-motion is active.
 */
export const AnimatedCounter = ({
  value,
  duration = 1.8,
  delay = 0.2, // Default 200ms delay gives parent card time to glide in
  className = '',
  as: Component = 'span',
}) => {
  const [displayValue, setDisplayValue] = useState(() => {
    if (isReducedMotion()) return value;
    const { prefix, suffix, raw } = parseFormattedValue(value);
    if (raw) return raw;
    return `${prefix}0${suffix}`;
  });

  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (isReducedMotion()) {
      setDisplayValue(value);
      return;
    }

    const { prefix, num, suffix, decimals, raw } = parseFormattedValue(value);

    if (raw) {
      setDisplayValue(raw);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    let animId = null;
    let delayTimer = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.disconnect();

          delayTimer = setTimeout(() => {
            const startTime = performance.now();
            const durationMs = duration * 1000;

            const tick = (now) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / durationMs, 1);

              // Quartic Ease-Out: 1 - (1 - t)^4 (starts prompt, lands with velvety deceleration)
              const easedProgress = 1 - Math.pow(1 - progress, 4);
              const currentNum = easedProgress * num;

              if (progress < 1) {
                const formattedNum =
                  decimals > 0
                    ? currentNum.toFixed(decimals)
                    : Math.floor(currentNum).toLocaleString();

                setDisplayValue(`${prefix}${formattedNum}${suffix}`);
                animId = requestAnimationFrame(tick);
              } else {
                // Final reveal: exact original formatted string
                setDisplayValue(value);
              }
            };

            animId = requestAnimationFrame(tick);
          }, delay * 1000);
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px', // Prevents triggering while off-screen
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (delayTimer) clearTimeout(delayTimer);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [value, duration, delay]);

  return (
    <Component
      ref={containerRef}
      className={className}
      aria-label={String(value)}
    >
      {displayValue}
    </Component>
  );
};

export default AnimatedCounter;
