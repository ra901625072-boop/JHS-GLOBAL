import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { isReducedMotion } from '../../styles/motion';

/**
 * PageHeader Component
 *
 * Signature calm, masked entrance header for secondary pages.
 * - Slow-feeling, noble typography reveal through overflow mask.
 * - Subtle background ambient drift and gold dot grid depth.
 * - Isolated GSAP context for zero memory leaks and automatic cleanup.
 * - Bypasses immediately when prefers-reduced-motion is active.
 */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  badge = null,
  actions = null,
  className = '',
}) => {
  const headerRef = useRef(null);

  useEffect(() => {
    if (isReducedMotion() || !headerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Eyebrow badge / pill soft settle
      if (eyebrow || badge) {
        tl.fromTo(
          '.page-header-eyebrow',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45 }
        );
      }

      // 2. Noble masked headline ascending reveal
      tl.fromTo(
        '.page-header-title',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
        },
        eyebrow || badge ? '-=0.3' : 0
      );

      // 3. Subtext description paragraph
      if (description) {
        tl.fromTo(
          '.page-header-desc',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.55 },
          '-=0.45'
        );
      }

      // 4. Optional actions
      if (actions) {
        tl.fromTo(
          '.page-header-actions',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45 },
          '-=0.35'
        );
      }
    }, headerRef);

    return () => ctx.revert();
  }, [eyebrow, title, description]);

  return (
    <section
      ref={headerRef}
      className={`relative bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-primary-800/80 overflow-hidden ${className}`}
    >
      {/* Subtle Brand Pattern & Soft Ambient Glow */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute -top-10 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-3xl">
          {badge ? (
            <div className="page-header-eyebrow mb-3">{badge}</div>
          ) : eyebrow ? (
            <span className="page-header-eyebrow text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-2.5">
              {eyebrow}
            </span>
          ) : null}

          {/* Masked Headline for slow, noble reveal */}
          <div className="overflow-hidden">
            <h1 className="page-header-title font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              {title}
            </h1>
          </div>

          {description && (
            <p className="page-header-desc mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-sans font-normal max-w-2xl">
              {description}
            </p>
          )}

          {actions && (
            <div className="page-header-actions mt-6 flex flex-wrap items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;
