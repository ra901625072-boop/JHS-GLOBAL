import React from 'react';
import { ShieldCheck, Award, Sparkles, Sprout, Wheat, FlaskConical, Droplet } from 'lucide-react';

/**
 * ProductArtwork Component
 * 
 * Graphic Designer & Visual Art Director Component
 * Provides a high-end, editorial, category-themed studio artwork plate
 * for products that do not have photography or when an image fails to load.
 */
export const ProductArtwork = ({ product, isLarge = false, className = '' }) => {
  const categorySlug = (product?.category?.slug || product?.categoryId?.slug || product?.category || '').toLowerCase();
  const categoryName = (product?.category?.name || product?.categoryId?.name || product?.category || '').toLowerCase();
  const productName = product?.name || 'Commercial Raw Material';
  const forms = Array.isArray(product?.forms) ? product.forms.slice(0, 3).join(' • ') : '';

  // Determine category visual theme
  let theme = {
    division: 'FOOD & FOOD INGREDIENTS',
    badgeText: 'INDIAN AGRICULTURAL EXPORT',
    gradient: 'from-[#2A1005] via-[#1C0D05] to-[#451A03]',
    accentColor: '#F59E0B',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    glowColor: 'rgba(245, 158, 11, 0.12)',
    icon: Wheat,
    patternType: 'agro',
  };

  if (categorySlug.includes('nutra') || categoryName.includes('nutra')) {
    theme = {
      division: 'NUTRACEUTICAL RAW MATERIALS',
      badgeText: 'STANDARDIZED BOTANICAL EXTRACT',
      gradient: 'from-[#03221B] via-[#021813] to-[#064E3B]',
      accentColor: '#10B981',
      accentClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/30',
      glowColor: 'rgba(16, 185, 129, 0.12)',
      icon: Sprout,
      patternType: 'botanical',
    };
  } else if (categorySlug.includes('personal') || categoryName.includes('personal') || categorySlug.includes('cosmetic')) {
    theme = {
      division: 'PERSONAL CARE RAW MATERIALS',
      badgeText: 'COSMETIC FORMULATION GRADE',
      gradient: 'from-[#0F172A] via-[#090D16] to-[#1E293B]',
      accentColor: '#38BDF8',
      accentClass: 'text-sky-400',
      borderClass: 'border-sky-500/30',
      glowColor: 'rgba(56, 189, 248, 0.12)',
      icon: Droplet,
      patternType: 'chemical',
    };
  } else if (categorySlug.includes('feed') || categoryName.includes('feed')) {
    theme = {
      division: 'ANIMAL FEED RAW MATERIALS',
      badgeText: 'HIGH-PROTEIN FEED GRADE',
      gradient: 'from-[#261307] via-[#150B04] to-[#3B1D08]',
      accentColor: '#FBBF24',
      accentClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
      glowColor: 'rgba(251, 191, 36, 0.12)',
      icon: FlaskConical,
      patternType: 'feed',
    };
  }

  const IconComponent = theme.icon;

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-between p-5 sm:p-6 select-none bg-gradient-to-br ${theme.gradient} ${className}`}
      style={{
        boxShadow: `inset 0 0 60px ${theme.glowColor}`,
      }}
      aria-label={`${productName} export specification artwork`}
    >
      {/* Background SVG Geometric Linework & Watermark */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`glow-${product?.id || 'gen'}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.accentColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={theme.accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Center Glow */}
        <circle cx="200" cy="150" r="140" fill={`url(#glow-${product?.id || 'gen'})`} />

        {/* Concentric Precision Rings */}
        <circle cx="200" cy="150" r="120" fill="none" stroke={theme.accentColor} strokeWidth="0.75" strokeDasharray="4 6" />
        <circle cx="200" cy="150" r="90" fill="none" stroke={theme.accentColor} strokeWidth="0.5" />
        <circle cx="200" cy="150" r="60" fill="none" stroke={theme.accentColor} strokeWidth="0.5" strokeDasharray="2 4" />

        {/* Diagonal Tension Grid Lines */}
        <line x1="0" y1="0" x2="400" y2="300" stroke={theme.accentColor} strokeWidth="0.3" strokeOpacity="0.6" />
        <line x1="400" y1="0" x2="0" y2="300" stroke={theme.accentColor} strokeWidth="0.3" strokeOpacity="0.6" />

        {/* Corner Reticle Marks */}
        <path d="M 20 35 L 20 20 L 35 20" fill="none" stroke={theme.accentColor} strokeWidth="1" />
        <path d="M 380 35 L 380 20 L 365 20" fill="none" stroke={theme.accentColor} strokeWidth="1" />
        <path d="M 20 265 L 20 280 L 35 280" fill="none" stroke={theme.accentColor} strokeWidth="1" />
        <path d="M 380 265 L 380 280 L 365 280" fill="none" stroke={theme.accentColor} strokeWidth="1" />
      </svg>

      {/* Top Header: JHS GLOBAL Brand Seal & Division */}
      <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
          <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-neutral-300 font-semibold">
            JHS GLOBAL • EXPORT GRADE
          </span>
        </div>
        <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
          RAW MATERIAL
        </span>
      </div>

      {/* Centerpiece: Geometric Icon Crest & Product Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2">
        {/* Crest Icon Badge */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 bg-white/5 backdrop-blur-sm border ${theme.borderClass} shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-500`}
        >
          <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${theme.accentClass}`} />
        </div>

        {/* Product Commodity Name */}
        <div
          role="presentation"
          className={`font-serif font-bold text-white tracking-wide leading-tight line-clamp-2 max-w-[280px] drop-shadow-md ${
            isLarge ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg'
          }`}
        >
          {productName}
        </div>

        {/* Division / Subtitle Pill */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`text-[9px] sm:text-[10px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 border ${theme.borderClass} text-neutral-200`}>
            {theme.badgeText}
          </span>
        </div>

        {/* Available Forms snippet if provided */}
        {forms && (
          <p className="mt-2 text-[10px] font-mono text-neutral-400 max-w-[260px] truncate">
            {forms}
          </p>
        )}
      </div>

      {/* Bottom Footer: Quality & Specification Seal */}
      <div className="relative z-10 w-full flex items-center justify-between border-t border-white/10 pt-2.5 text-[9px] sm:text-[10px] font-sans text-neutral-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-400" />
          <span>Specification on Request</span>
        </span>
        <span className="font-mono text-[9px] text-neutral-400">
          48h Quote Turnaround
        </span>
      </div>
    </div>
  );
};

export default ProductArtwork;
