import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SHOWCASE_PRODUCTS } from '../../data/productShowcase';

/**
 * ProductShowcaseMarquee Component
 *
 * Silky-smooth 60fps continuous horizontal product marquee moving right-to-left.
 * Features:
 * - Circular product photography tokens with subtle elevation & border highlights
 * - Clear product name typography with directional hover feedback
 * - GPU hardware-accelerated transform with zero layout reflows (CLS = 0)
 * - Automatic pause on hover & touch active for effortless buyer inspection
 * - Edge gradient fade masks for soft visual boundary entrance & exit
 * - Accessible with prefers-reduced-motion fallback
 */
export const ProductShowcaseMarquee = () => {
  return (
    <section
      id="product-marquee-showcase"
      className="py-12 sm:py-16 bg-surface-subtle border-y border-surface-border relative overflow-hidden select-none"
      aria-label="Export Commodities Showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 border border-accent-200/70 text-accent-700 text-xs font-semibold mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-600 animate-pulse" />
              <span className="font-mono text-[11px] tracking-wider uppercase">
                EXPORT COMMODITY PORTFOLIO
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
              Direct Sourcing Across 3 Core Export Divisions
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 font-sans">
              Continuous container dispatch: Personal Care Raw Materials · Standardized Nutraceuticals · High-Protein Animal Feed
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-900 hover:text-accent-700 transition-colors duration-150 group shrink-0"
          >
            <span>Explore Full 20+ Commodity Catalogue</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* Marquee Viewport with Edge Fade Masks */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Left & Right Soft Gradient Fade Masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-surface-subtle via-surface-subtle/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-surface-subtle via-surface-subtle/80 to-transparent z-10" />

        {/* Marquee Track (Double buffer for seamless infinite loop from right to left) */}
        <div
          className="flex w-max animate-product-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:overflow-x-auto motion-reduce:w-full motion-reduce:pb-4"
          data-testid="product-marquee-track"
        >
          {/* Buffer 1 */}
          <div className="flex items-start gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
            {SHOWCASE_PRODUCTS.map((product) => (
              <ProductMarqueeItem key={`p1-${product.id}`} product={product} />
            ))}
          </div>

          {/* Buffer 2 (Cloned for seamless, zero-stutter loop) */}
          <div className="flex items-start gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10" aria-hidden="true">
            {SHOWCASE_PRODUCTS.map((product) => (
              <ProductMarqueeItem key={`p2-${product.id}`} product={product} isDuplicate />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductMarqueeItem = ({ product, isDuplicate = false }) => {
  return (
    <Link
      to={`/products/${product.slug}`}
      tabIndex={isDuplicate ? -1 : 0}
      aria-label={isDuplicate ? undefined : `View export specifications for ${product.name}`}
      className="group flex flex-col items-center gap-2.5 text-center shrink-0 w-24 sm:w-28 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-500 rounded-xl py-1 transition-transform duration-200"
      data-testid={isDuplicate ? undefined : `marquee-product-${product.slug}`}
    >
      {/* Circular Product Photography Frame ("cercal") */}
      <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-1 bg-white border-2 border-surface-border shadow-xs group-hover:border-accent-500 group-hover:shadow-card group-hover:scale-105 transition-all duration-300">
        <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100 aspect-square">
          <img
            src={product.image}
            alt={isDuplicate ? '' : product.name}
            width="88"
            height="88"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-full transform-gpu group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Division Badge */}
        <span className="absolute -bottom-1 -right-0.5 px-1.5 py-0.5 rounded-full bg-primary-950 text-accent-400 border border-accent-500/40 text-[9px] font-mono font-bold shadow-xs">
          {product.divisionBadge}
        </span>
      </div>

      {/* Product Name ("line under circle") */}
      <div className="flex flex-col items-center w-full">
        <span className="text-xs font-semibold text-neutral-800 group-hover:text-primary-900 transition-colors duration-150 leading-tight line-clamp-2">
          {product.shortName}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 font-medium mt-0.5">
          {product.category}
        </span>
        {/* Subtle accent line indicator */}
        <span className="w-4 h-0.5 bg-accent-500/0 group-hover:w-8 group-hover:bg-accent-500 rounded-full transition-all duration-300 mt-1" />
      </div>
    </Link>
  );
};

export default ProductShowcaseMarquee;
