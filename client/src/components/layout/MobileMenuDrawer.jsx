import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  FileText,
  Clock,
  Home,
  Award,
  Send,
  MessageSquare,
} from 'lucide-react';
import WhatsAppIcon from '../common/WhatsAppIcon';
import Button from '../ui/Button';

export const MobileMenuDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello Export Desk, I would like to inquire about container export availability.'
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

  const navItems = [
    { name: 'Home', path: '/', end: true, icon: Home },
    { name: 'About', path: '/about', icon: FileText },
    { name: 'Product', path: '/products', icon: ShoppingBag },
    { name: 'Quality&certificate', path: '/quality', icon: Award },
    { name: 'Export process', path: '/export-process', icon: Clock },
    { name: 'Contact', path: '/contact', icon: Send },
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
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-In Full Sheet Container */}
      <div
        className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 mr-auto overflow-hidden animate-in slide-in-from-left duration-300"
        style={{ transitionTimingFunction: 'var(--ease-standard)' }}
      >
        {/* Top Header Bar */}
        <div className="p-4 bg-primary-950 text-white flex items-center justify-between border-b border-primary-900 shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#0e3b2e] border-2 border-[#c59b27]/80 flex items-center justify-center font-serif font-black text-[#c59b27] text-xs shrink-0 relative overflow-hidden">
              <div className="absolute inset-0.5 rounded-full border border-[#c59b27]/40 pointer-events-none" />
              <span>JHS</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-base text-white tracking-tight leading-none truncate">
                {brandName}
              </span>
              <span className="text-[9px] text-[#c59b27] uppercase tracking-[0.2em] font-semibold mt-1">
                INDIA • TO THE WORLD
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-neutral-300 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 admin-scrollbar">
          {/* Quick Direct Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/products');
              }}
              className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 active:scale-[0.98] transition-all text-left flex flex-col justify-between min-h-[64px]"
            >
              <ShoppingBag className="w-4 h-4 text-primary-900 mb-1" />
              <span className="text-xs font-bold text-neutral-900">Explore Products</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/contact');
              }}
              className="p-3.5 rounded-xl border border-[#c59b27]/40 bg-[#c59b27]/10 hover:bg-[#c59b27]/20 active:scale-[0.98] transition-all text-left flex flex-col justify-between min-h-[64px]"
            >
              <Clock className="w-4 h-4 text-[#9c781d] mb-1" />
              <span className="text-xs font-bold text-neutral-900">48h Quote (RFQ)</span>
            </button>
          </div>

          {/* Core Navigation Links */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block pb-1">
              Main Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors min-h-[46px] ${
                      isActive
                        ? 'bg-[#0e3b2e] text-white font-semibold shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#c59b27]' : 'text-neutral-500'}`} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Secondary Quick Links */}
          <div className="space-y-1 pt-4 border-t border-neutral-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block pb-1">
              Resources
            </span>
            <Link
              to="/sample-request"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              <span>Commercial Sample Request</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
            <Link
              to="/faq"
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-50"
            >
              <span>Procurement FAQ</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>

        {/* Drawer Bottom Action Bar */}
        <div className="p-4 bg-surface-canvas border-t border-surface-border space-y-2.5 pb-safe shrink-0">
          <Button
            variant="cta"
            size="lg"
            onClick={() => {
              onClose();
              navigate('/contact');
            }}
            className="w-full flex items-center justify-center gap-2 shadow-card min-h-[48px] text-xs font-bold bg-[#0e3b2e] hover:bg-[#092b21] text-white"
          >
            <span>Request Commercial Quote (RFQ)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] shadow-xs transition-all"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chat with Export Desk (WhatsApp)</span>
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileMenuDrawer;
