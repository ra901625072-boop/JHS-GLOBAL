import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * AdminDrawer
 *
 * Slide-over Inspector Panel (matching visitor QuoteDrawer):
 * - Smooth backdrop fade & translate slide-in
 * - Fixed header with title, status badge, and close button
 * - Sleek scrollable body with admin custom scrollbar
 * - Fixed sticky bottom action bar with blur
 */
export const AdminDrawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  tabs,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        style={{ transitionTimingFunction: 'var(--ease-standard)' }}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className={`w-screen ${maxWidth} bg-white shadow-2xl flex flex-col border-l border-neutral-200/90 transform-gpu transition-transform duration-300 animate-in slide-in-from-right`}
          style={{ transitionTimingFunction: 'var(--ease-enter)' }}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 tracking-tight truncate">
                    {title}
                  </h2>
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-neutral-500 line-clamp-1">{subtitle}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-none"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Header Tab Bar */}
            {tabs && <div className="mt-4 pt-1">{tabs}</div>}
          </div>

          {/* Scrollable Body with Sleek Scrollbar */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 admin-scrollbar bg-[#FBFBF9]/40">
            {children}
          </div>

          {/* Sticky Footer */}
          {footer && (
            <div className="p-4 sm:p-5 border-t border-neutral-200/90 bg-white/95 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-20">
              {footer}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminDrawer;
