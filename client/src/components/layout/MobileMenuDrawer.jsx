import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link } from 'react-router-dom';
import {
  X,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Home,
  Award,
  Send,
  Sparkles,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  Building,
  Ship,
  Package,
  Leaf,
  FlaskRound,
  Wheat,
} from 'lucide-react';
import WhatsAppIcon from '../common/WhatsAppIcon';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import { openAiAssistant } from '../ai/chatEvents';

export const MobileMenuDrawer = ({ isOpen, onClose }) => {
  const { totalItemCount, setIsDrawerOpen } = useQuoteBasket();

  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';
  const cleanWhatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    'Hello JHS GLOBAL Export Desk, I would like to inquire about container export availability.'
  )}`;

  // Lock body scroll and pause smooth scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (window.__lenis) window.__lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (window.__lenis) window.__lenis.start();
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleLaunchAiAssistant = (query = null) => {
    onClose();
    setTimeout(() => {
      openAiAssistant(query);
    }, 150);
  };

  const navItems = [
    {
      name: 'Home',
      path: '/',
      end: true,
      icon: Home,
    },
    {
      name: 'Products Catalogue',
      path: '/products',
      icon: Package,
    },
    {
      name: 'Quality & Certifications',
      path: '/quality',
      icon: Award,
    },
    {
      name: 'Export Process',
      path: '/export-process',
      icon: Ship,
    },
    {
      name: 'About Us',
      path: '/about-us',
      icon: Building,
    },
    {
      name: 'Procurement FAQ',
      path: '/faq',
      icon: HelpCircle,
    },
    {
      name: 'Contact & Sales Desk',
      path: '/contact',
      icon: Send,
    },
  ];

  const categories = [
    {
      name: 'Personal Care Raw Materials',
      slug: 'personal-care-raw-materials',
      icon: FlaskRound,
    },
    {
      name: 'Nutraceutical Raw Materials',
      slug: 'nutraceutical-raw-materials',
      icon: Leaf,
    },
    {
      name: 'Animal Feed & Meals',
      slug: 'animal-feed',
      icon: Wheat,
    },
  ];

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      data-lenis-prevent
      className="fixed inset-0 z-50 lg:hidden overflow-hidden flex flex-col"
    >
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/75 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-In Minimal Dark Luxury Drawer */}
      <aside
        className="relative w-72 sm:w-80 max-w-[85vw] h-[100dvh] h-screen bg-gradient-to-b from-[#05140B] via-[#0A2619] to-[#04120A] text-neutral-200 border-r border-primary-800/80 flex flex-col justify-between z-10 mr-auto overflow-hidden animate-in slide-in-from-left duration-200 shadow-2xl"
        style={{ transitionTimingFunction: 'var(--ease-standard)' }}
      >
        <div className="flex flex-col flex-1 overflow-y-auto admin-scrollbar">
          {/* Top Header: Official JHS Global Logo, Serif Wordmark & Gold Subtitle */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-primary-950/30">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 min-w-0 group focus:outline-none"
            >
              {/* Authentic Circular JHS Emblem */}
              <div className="w-10 h-10 rounded-full bg-white border border-[#c59b27]/60 shadow-sm flex items-center justify-center p-0.5 shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
                <img
                  src="/images/logo/logo-mark.png"
                  alt="JHS GLOBAL Logo"
                  className="w-full h-full object-contain"
                  width="40"
                  height="40"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-base text-white tracking-tight leading-none truncate">
                  {brandName}
                </span>
                <span className="text-[9px] font-sans font-semibold text-[#c59b27] tracking-[0.22em] uppercase mt-1 leading-none">
                  INDIA • TO THE WORLD
                </span>
              </div>
            </Link>

            {/* Minimal Circular Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 active:scale-95 flex items-center justify-center transition-all focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Minimal AI Assistant Card */}
          <div className="mx-3.5 mt-3 mb-1 p-3 rounded-xl bg-white/[0.04] border border-[#c59b27]/30 text-white shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#c59b27]/20 border border-[#c59b27]/40 flex items-center justify-center text-[#e8c15a] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-serif font-bold text-xs text-white tracking-tight">
                  JHS Export AI Desk
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-neutral-300 mb-2 leading-relaxed">
              Instant verified specs, assays, MOQs & container freight
            </p>
            <button
              type="button"
              onClick={() => handleLaunchAiAssistant()}
              className="w-full py-1.5 px-3 rounded-lg bg-[#c59b27] hover:bg-[#b0871d] active:scale-[0.98] text-primary-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Ask AI Assistant Now</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-primary-950" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#c59b27]/80">
              Commercial Sourcing
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 transform-gpu active:scale-[0.98] ${
                      isActive
                        ? 'bg-white/10 text-white border border-white/20 font-semibold shadow-xs'
                        : 'text-neutral-300 hover:bg-primary-800/50 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-1 w-1 h-4 bg-[#c59b27] rounded-full transition-all duration-200" />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                        }`}
                      />
                      <span className="font-serif tracking-normal text-[13px] truncate">{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* SOURCING DIVISIONS SECTION */}
            <div className="pt-3.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#c59b27]/80 flex items-center justify-between">
              <span>Sourcing Divisions</span>
              <span className="text-[9px] text-[#c59b27] font-semibold">3 Lines</span>
            </div>

            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-primary-800/50 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-[#c59b27] group-hover:text-white transition-colors" />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}

            {/* BUYER RESOURCES SECTION */}
            <div className="pt-3.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#c59b27]/80">
              Buyer Resources
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                setIsDrawerOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-primary-800/50 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-neutral-400 group-hover:text-white" />
                <span>Quote Basket</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                {totalItemCount === 0 ? 'Empty' : `${totalItemCount} Items`}
              </span>
            </button>

            <Link
              to="/sample-request"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-primary-800/50 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="w-3.5 h-3.5 shrink-0 text-neutral-400 group-hover:text-white" />
                <span>Commercial Sample Request</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            <Link
              to="/faq"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-primary-800/50 hover:text-white transition-colors group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-neutral-400 group-hover:text-white" />
                <span>Procurement FAQ (Incoterms)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </nav>
        </div>

        {/* Minimal Bottom Action Dock */}
        <div className="p-3.5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] border-t border-white/10 bg-[#04120A]/90 backdrop-blur-md shrink-0 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsDrawerOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-[#0e3b2e] hover:bg-[#092b21] border border-[#c59b27]/40 rounded-xl transition-all shadow-xs active:scale-[0.98]"
          >
            <span>Request Commercial Quote (RFQ)</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#c59b27]" />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] rounded-xl transition-all shadow-xs"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Chat with Export Desk (WhatsApp)</span>
          </a>
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default MobileMenuDrawer;
