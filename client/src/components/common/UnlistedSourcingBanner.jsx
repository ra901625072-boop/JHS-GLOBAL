import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import Button from '../ui/Button';

export const UnlistedSourcingBanner = ({ className = '' }) => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    'Hello JHS GLOBAL Trade Desk, I am looking for a custom or unlisted commodity specification. Can you assist with sourcing?'
  );

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 text-white p-8 sm:p-10 border border-accent-500/30 shadow-xl ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-400 text-xs font-semibold tracking-wide uppercase">
            <Clock className="w-3.5 h-3.5 text-accent-400 animate-pulse" />
            <span>48-Hour Guaranteed Sourcing Protocol</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
            Can’t find the product or grade you are looking for?
          </h3>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Share your target specification, mesh size, moisture profile, or custom packaging with our procurement team. We will source, verify, and quote it in <span className="font-semibold text-accent-300">48 hours</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0" />
              <span>Direct Mandi & Farmer Network</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-400 shrink-0" />
              <span>Custom Milling & Mesh Sizing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0" />
              <span>Lab COA Matching Standard</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 sm:w-auto w-full">
          <Link to="/contact" className="w-full sm:w-auto">
            <Button
              variant="cta"
              size="md"
              className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-lg shadow-accent-500/20"
            >
              <span>Share Sourcing Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <a
            href={`https://wa.me/${cleanNumber}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-[0.98] min-h-[44px]"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default UnlistedSourcingBanner;
