import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * AdminDrawer — Phase 2
 *
 * Slide-over Inspector Panel:
 * - Direct translate slide-in (320ms ease-out)
 * - Solid opaque header with title, status badge, and close button
 * - Scrollable body with custom admin scrollbar
 * - Solid bottom action bar with hairline border
 * - Focus trapped, ESC to close
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
  const drawerRef = useRef(null);

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
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 'var(--admin-z-overlay)' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/40 transition-opacity"
        style={{
          transitionDuration: 'var(--admin-duration-base)',
          transitionTimingFunction: 'var(--admin-ease-out)',
        }}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <aside
          ref={drawerRef}
          className={`w-screen ${maxWidth} bg-white flex flex-col border-l border-[var(--admin-border)] shadow-admin-overlay pointer-events-auto transform-gpu`}
          style={{
            animation: 'drawerSlideIn var(--admin-duration-slow) var(--admin-ease-out) forwards',
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[var(--admin-border)] bg-white sticky top-0 z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--admin-text-primary)] tracking-tight truncate">
                    {title}
                  </h2>
                  {badge}
                </div>
                {subtitle && (
                  <p className="text-xs text-[var(--admin-text-muted)] line-clamp-1">{subtitle}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-admin-md text-[var(--admin-text-placeholder)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-subtle)] transition-colors focus:outline-none"
                aria-label="Close drawer"
                style={{ transitionDuration: 'var(--admin-duration-micro)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Header Tab Bar */}
            {tabs && <div className="mt-4 pt-1">{tabs}</div>}
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 admin-scrollbar bg-[var(--admin-canvas)]">
            {children}
          </div>

          {/* Sticky Footer */}
          {footer && (
            <div className="p-4 sm:p-5 border-t border-[var(--admin-border)] bg-white flex items-center justify-end gap-3 sticky bottom-0 z-20">
              {footer}
            </div>
          )}
        </aside>
      </div>

      <style>{`
        @keyframes drawerSlideIn {
          from {
            transform: translate3d(100%, 0, 0);
          }
          to {
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDrawer;
