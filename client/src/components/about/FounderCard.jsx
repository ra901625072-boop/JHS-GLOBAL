import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Quote, ShieldCheck, User } from 'lucide-react';

/**
 * Accessible, resilient Founder Card component following Option A:
 * - 3:4 aspect ratio responsive portrait with blur placeholder.
 * - Resilient fallback: renders clean monogram/fallback on image load failure (never breaks layout).
 * - Full text preserved in DOM for SEO and screen readers.
 * - Accessible inline expander for multi-paragraph biographies.
 * - Philosophy callout block with client's exact quotes.
 */
export const FounderCard = ({ founder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const bioId = `founder-bio-extended-${founder.id}`;
  const nameId = `founder-name-${founder.id}`;

  return (
    <article
      className="rounded-2xl bg-white border border-surface-border shadow-subtle overflow-hidden flex flex-col h-full hover:border-primary-700/40 hover:shadow-card hover:-translate-y-1 transition-all duration-300 group"
      aria-labelledby={nameId}
      data-testid={`founder-card-${founder.id}`}
    >
      {/* 3:4 Aspect Ratio Image Container with Zero Layout Shift */}
      <div className="relative overflow-hidden bg-neutral-900 aspect-[3/4] w-full border-b border-surface-border">
        {!imageError ? (
          <picture>
            <source
              type="image/avif"
              srcSet={founder.images?.srcSetAvif}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            />
            <source
              type="image/webp"
              srcSet={founder.images?.srcSetWebp}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
            />
            <img
              src={founder.images?.jpg}
              alt={founder.alt}
              width="768"
              height="1024"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: founder.images?.blur ? `url(${founder.images.blur})` : undefined,
                backgroundSize: 'cover',
              }}
            />
          </picture>
        ) : (
          /* Dignified Fallback State on Image Load Failure */
          <div
            className="w-full h-full aspect-[3/4] flex flex-col items-center justify-center p-6 bg-surface-subtle border-b border-surface-border text-center"
            data-testid={`founder-fallback-${founder.id}`}
          >
            <div className="w-20 h-20 rounded-full bg-primary-100 border-2 border-primary-800/30 flex items-center justify-center text-primary-900 mb-4 shadow-xs">
              <User className="w-10 h-10 text-primary-800" />
            </div>
            <span className="font-serif text-lg font-bold text-neutral-900 block">
              {founder.name}
            </span>
            <span className="font-sans text-xs text-accent-700 font-semibold block mt-1">
              {founder.displayTitle}
            </span>
            <span className="font-sans text-[10px] text-neutral-400 uppercase tracking-widest mt-4">
              JHS GLOBAL · LEADERSHIP
            </span>
          </div>
        )}

        {/* Display Role Badge */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-semibold bg-white/95 backdrop-blur-md text-primary-950 shadow-xs border border-neutral-200/80">
            {founder.displayTitle}
          </span>
          {founder.isStatutoryProprietor && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans font-semibold bg-emerald-50/95 backdrop-blur-md text-emerald-800 shadow-xs border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statutory Proprietor</span>
            </span>
          )}
        </div>
      </div>

      {/* Founder Details & Content Section */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-accent-800 block">
              {founder.eyebrow}
            </span>
            <h3
              id={nameId}
              className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 leading-tight group-hover:text-primary-900 transition-colors"
            >
              {founder.name}
            </h3>
            <p className="font-sans text-xs sm:text-sm font-bold text-primary-900 tracking-wide pt-0.5">
              {founder.role}
            </p>
            <p className="font-serif text-sm italic text-accent-700 font-medium leading-snug pt-1.5 border-l-2 border-accent-300 pl-3 my-2">
              "{founder.tagline}"
            </p>
          </div>

          {/* Biographical Content: Paragraph 1 always visible, additional paragraphs expand inline */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-neutral-700 leading-relaxed font-sans">
              {founder.bioParagraphs?.[0]}
            </p>

            {founder.bioParagraphs?.length > 1 && (
              <>
                <div
                  id={bioId}
                  className={`space-y-3 transition-all duration-300 ${
                    isExpanded ? 'block' : 'hidden'
                  }`}
                  data-testid={`founder-extended-bio-${founder.id}`}
                >
                  {founder.bioParagraphs.slice(1).map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-sm text-neutral-700 leading-relaxed font-sans"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={toggleExpand}
                  aria-expanded={isExpanded}
                  aria-controls={bioId}
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-primary-900 hover:text-accent-700 bg-primary-50/80 hover:bg-primary-100/80 border border-primary-200/70 px-3 py-1.5 rounded-lg transition-all min-h-[44px] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-accent-500 mt-2"
                >
                  <span>{isExpanded ? 'Show Less' : 'Read Full Biography'}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-primary-800" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-primary-800" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Philosophy Block */}
        <div className="pt-4 border-t border-surface-border space-y-2 bg-[#FBF9F4] border border-accent-200/80 p-4 sm:p-5 rounded-xl relative shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-accent-700 block">
              {founder.philosophyTitle || 'His Philosophy'}
            </span>
            <Quote className="w-3.5 h-3.5 text-accent-600/70" />
          </div>

          <blockquote className="font-serif text-xs sm:text-sm text-neutral-900 italic leading-relaxed font-medium">
            "{founder.philosophyQuote}"
          </blockquote>

          {founder.philosophyReflection && (
            <p className="text-xs text-neutral-600 font-sans pt-2 border-t border-accent-200/50 leading-relaxed">
              {founder.philosophyReflection}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default FounderCard;
