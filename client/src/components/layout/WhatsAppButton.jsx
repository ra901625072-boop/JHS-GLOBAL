import React from 'react';
import WhatsAppIcon from '../common/WhatsAppIcon';

export const WhatsAppButton = () => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const defaultMessage = encodeURIComponent(
    'Hello JHS GLOBAL Export Desk, I am an international buyer looking to request a quotation for Indian agro-commodities.'
  );

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="Direct WhatsApp Export Inquiries"
      className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 flex items-center group select-none"
    >
      {/* Tooltip Pill */}
      <div
        className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-neutral-900/95 text-white text-xs font-medium shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none backdrop-blur-sm"
        role="tooltip"
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span className="whitespace-nowrap">Chat with Export Desk</span>
        <span className="text-[10px] text-neutral-400 font-mono">| Instant</span>
      </div>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat directly on WhatsApp with JHS GLOBAL Export Desk"
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA851] text-white flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(37,211,102,0.45),0_4px_10px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_14px_30px_-5px_rgba(37,211,102,0.55),0_6px_12px_-2px_rgba(0,0,0,0.15)] hover:scale-108 active:scale-95 transform-gpu transition-all duration-200 min-h-[48px] min-w-[48px] focus:outline-none focus:ring-3 focus:ring-[#25D366] focus:ring-offset-2 ring-offset-white"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10 pointer-events-none motion-reduce:hidden"
          aria-hidden="true"
        />

        {/* Authentic WhatsApp Logo Icon */}
        <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-xs transition-transform duration-200 group-hover:scale-105" />
      </a>
    </aside>
  );
};

export default WhatsAppButton;
