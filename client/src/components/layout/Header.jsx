import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import MobileMenuDrawer from './MobileMenuDrawer';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);
  const { totalItemCount, setIsDrawerOpen } = useQuoteBasket();
  const navigate = useNavigate();
  const location = useLocation();

  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';

  // Automatically close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Track scroll position to subtly adjust header elevation and backdrop blur
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tactile feedback when items are added to quote basket
  useEffect(() => {
    if (totalItemCount > 0) {
      setBadgeBump(true);
      const timer = setTimeout(() => setBadgeBump(false), 250);
      return () => clearTimeout(timer);
    }
  }, [totalItemCount]);

  const navLinks = [
    { name: 'Home', path: '/', end: true },
    { name: 'About', path: '/about' },
    { name: 'Product', path: '/products' },
    { name: 'Quality&certificate', path: '/quality' },
    { name: 'Export process', path: '/export-process' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 transform-gpu ${
        isScrolled
          ? 'bg-white/98 backdrop-blur-md border-b border-neutral-200/90 shadow-card'
          : 'bg-white backdrop-blur-sm border-b border-neutral-200/60 shadow-subtle'
      }`}
      style={{ transitionTimingFunction: 'var(--ease-standard)' }}
    >
      {/* Top Utility / Trust Bar */}
      <div className="bg-primary-950 text-white text-[11px] xl:text-xs py-1.5 px-4 hidden sm:block border-b border-primary-900/60">
        <div className="max-w-7xl mx-auto flex justify-between items-center tracking-normal">
          <div className="flex items-center gap-3 xl:gap-4">
            <span className="inline-flex items-center gap-1.5 text-accent-400 font-semibold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>FSSAI Central & APEDA Certified Exporter</span>
            </span>
            <span className="text-primary-700 select-none">•</span>
            <span className="text-neutral-300 whitespace-nowrap">
              Port of Loading: Hazira, Mundra & JNPT
            </span>
          </div>
          <div className="flex items-center gap-3 xl:gap-4 text-neutral-300">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-accent-400 shrink-0" />
              <span>Guaranteed 48h RFQ Turnaround</span>
            </span>
            <span className="text-primary-700 select-none">•</span>
            <span className="text-accent-400 font-medium whitespace-nowrap">
              B2B Container Volume (FCL / MT)
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4 xl:gap-8">
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0e3b2e] border-2 border-[#c59b27]/80 shadow-xs flex items-center justify-center font-serif font-black text-[#c59b27] text-xs sm:text-sm tracking-widest group-hover:scale-105 transition-all duration-200 transform-gpu shrink-0 relative overflow-hidden">
              <div className="absolute inset-0.5 rounded-full border border-[#c59b27]/40 pointer-events-none" />
              <span>JHS</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-lg sm:text-xl text-neutral-900 tracking-tight leading-none whitespace-nowrap group-hover:text-primary-900 transition-colors duration-150">
                {brandName}
              </span>
              <span className="text-[9px] xl:text-[10px] uppercase tracking-[0.22em] text-[#b8860b] font-sans font-semibold whitespace-nowrap mt-1 leading-none">
                INDIA • TO THE WORLD
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Home, About, Product, Quality&certificate, Export process, Contact) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-9">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `relative py-2 text-sm xl:text-[15px] transition-colors duration-150 whitespace-nowrap inline-flex flex-col items-center group font-medium ${
                    isActive
                      ? 'text-primary-950 font-semibold'
                      : 'text-neutral-700 hover:text-primary-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.name}</span>
                    {isActive && (
                      <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-[2.5px] bg-[#c59b27] rounded-full animate-in fade-in zoom-in-75 duration-200"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 xl:gap-3.5 shrink-0">
            {/* Quote Basket Trigger with Settle Feedback Badge */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-[0.96] text-neutral-700 hover:text-primary-800 transition-all duration-150 shadow-2xs focus:ring-2 focus:ring-primary-800 focus:outline-none flex items-center justify-center shrink-0 min-h-[42px] min-w-[42px]"
              aria-label={`View Quote Basket (${totalItemCount} items)`}
            >
              <ShoppingBag className="w-4 h-4 xl:w-5 xl:h-5 transition-transform duration-150 group-hover:scale-105" />
              {totalItemCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-1.5 bg-[#c59b27] text-primary-950 font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white transition-transform duration-200 transform-gpu ${
                    badgeBump ? 'scale-125' : 'scale-100'
                  }`}
                  style={{ transitionTimingFunction: 'var(--ease-standard)' }}
                >
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* High-Contrast "Request a Quote →" CTA Button */}
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0e3b2e] hover:bg-[#092b21] active:scale-[0.98] transform-gpu text-white text-xs xl:text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 whitespace-nowrap shrink-0 group focus:outline-none focus:ring-2 focus:ring-primary-800 focus:ring-offset-2"
            >
              <span>Request a Quote</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-150" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 active:scale-[0.96] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-primary-800"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 transition-transform duration-150 rotate-90" />
              ) : (
                <Menu className="w-5 h-5 transition-transform duration-150" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Header;
