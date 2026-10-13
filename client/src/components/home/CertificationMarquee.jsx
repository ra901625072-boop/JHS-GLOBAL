import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, CheckCircle2, FileCheck2, ArrowRight } from 'lucide-react';

const CERTIFICATIONS = [
  { label: 'APEDA Registered Exporter (Ministry of Commerce)', icon: Award },
  { label: 'FSSAI Central License (10725997001058)', icon: ShieldCheck },
  { label: 'Spices Board of India (CRES Registered)', icon: Award },
  { label: 'DGFT Importer-Exporter Code (IEC)', icon: FileCheck2 },
  { label: 'GST Registered Commercial Exporter', icon: CheckCircle2 },
  { label: 'Ministry of MSME Udyam Certified', icon: ShieldCheck },
];

/**
 * CertificationMarquee Component
 *
 * Smooth, hypnotic, slow continuous marquee ticker for accredited compliance.
 * - Pauses gracefully on hover so buyers can inspect accreditation details.
 * - Double-buffered item set for seamless, zero-jump infinite translation.
 * - Bypasses continuous animation when prefers-reduced-motion is requested.
 */
export const CertificationMarquee = () => {
  return (
    <section className="bg-white border-b border-surface-border py-4 px-4 overflow-hidden relative select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 mb-2 sm:mb-0">
        <div className="flex items-center gap-2 shrink-0 z-10 bg-white pr-4 sm:pr-6 border-r border-surface-border">
          <span className="w-2 h-2 rounded-full bg-accent-600 animate-pulse" />
          <span className="font-semibold text-neutral-900 uppercase tracking-wider text-[11px] whitespace-nowrap">
            Verified Accreditations:
          </span>
        </div>

        {/* Marquee Viewport with Edge Fade Masks */}
        <div className="relative flex-1 overflow-hidden py-1">
          {/* Left & Right gradient fade masks for smooth boundary clipping */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10" />

          {/* Marquee Track (Double buffer for seamless loop with hover & touch pause) */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-start">
            {/* First sequence */}
            <div className="flex items-center gap-8 sm:gap-12 text-xs text-neutral-600 font-medium shrink-0 pr-8 sm:pr-12">
              {CERTIFICATIONS.map((cert, index) => {
                const Icon = cert.icon;
                return (
                  <span
                    key={`cert-1-${index}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap hover:text-primary-800 transition-colors duration-150"
                  >
                    <Icon className="w-4 h-4 text-primary-800 shrink-0" />
                    <span>{cert.label}</span>
                  </span>
                );
              })}
            </div>

            {/* Cloned sequence for seamless loop */}
            <div className="flex items-center gap-8 sm:gap-12 text-xs text-neutral-600 font-medium shrink-0 pr-8 sm:pr-12">
              {CERTIFICATIONS.map((cert, index) => {
                const Icon = cert.icon;
                return (
                  <span
                    key={`cert-2-${index}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap hover:text-primary-800 transition-colors duration-150"
                  >
                    <Icon className="w-4 h-4 text-primary-800 shrink-0" />
                    <span>{cert.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Verification Link */}
        <div className="shrink-0 z-10 bg-white pl-4 sm:pl-6 border-l border-surface-border hidden md:block">
          <a
            href="#certifications-documents"
            className="text-primary-800 hover:text-accent-600 font-semibold text-xs inline-flex items-center gap-1 transition-colors duration-150 link-underline"
          >
            <span>Inspect Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CertificationMarquee;
