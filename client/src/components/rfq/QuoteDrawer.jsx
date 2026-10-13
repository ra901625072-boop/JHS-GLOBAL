import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, PackageOpen } from 'lucide-react';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import Button from '../ui/Button';

export const QuoteDrawer = () => {
  const { items, isDrawerOpen, setIsDrawerOpen, removeItem, updateItemQuantity, clearBasket } = useQuoteBasket();
  const navigate = useNavigate();
  const [touchStartY, setTouchStartY] = useState(null);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Lock body scroll and Lenis smoothly when drawer is active
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      if (window.__lenis) {
        window.__lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      if (window.__lenis) {
        window.__lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [isDrawerOpen]);

  // Swipe-down dismiss handlers for mobile pull handle / header
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY > 60) {
      setIsDrawerOpen(false);
    }
    setTouchStartY(null);
  };

  return (
    <div
      data-lenis-prevent
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isDrawerOpen
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden={!isDrawerOpen}
    >
      {/* Backdrop with smooth blur and opacity transition */}
      <div
        className={`absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Sheet Container: Bottom Sheet on mobile (<1024px), Right Drawer on desktop (lg:) */}
      <div className="fixed inset-x-0 bottom-0 lg:inset-y-0 lg:left-auto lg:right-0 max-w-full flex lg:pl-10 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Your Quote Basket"
          data-lenis-prevent
          className={`w-full lg:w-screen lg:max-w-md bg-white shadow-2xl flex flex-col rounded-t-2xl lg:rounded-none max-h-[88dvh] lg:max-h-full h-auto lg:h-full pointer-events-auto transform-gpu transition-transform duration-300 ${
            isDrawerOpen
              ? 'translate-y-0 lg:translate-x-0'
              : 'translate-y-full lg:translate-x-full lg:translate-y-0'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-standard)' }}
        >
          {/* Mobile Drag Indicator Bar */}
          <div
            className="lg:hidden pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-hidden="true"
          >
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Drawer Header */}
          <div
            className="p-4 sm:p-6 border-b border-surface-border flex items-center justify-between bg-surface-canvas shrink-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">Your Quote Basket</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {items.length} {items.length === 1 ? 'commodity' : 'commodities'} selected for bulk RFQ
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100 active:scale-95 transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close quote basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 sm:py-16 animate-in fade-in duration-200">
                <PackageOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="font-serif text-lg text-neutral-800 font-medium">Your basket is empty</p>
                <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
                  Browse our product catalogue and click "Add to Quote" to assemble your container inquiry.
                </p>
                <Button
                  variant="outline"
                  size="md"
                  className="mt-6 min-h-[44px]"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/products');
                  }}
                >
                  Explore Products
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 sm:p-4 rounded-xl border border-surface-border bg-surface-card flex gap-3 sm:gap-4 items-start shadow-subtle hover:border-neutral-300 transition-colors duration-150"
                  >
                    <div className="w-16 h-16 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center text-xs text-neutral-400">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <span>Photo</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-900 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">HS: {item.hsCode || 'Export Grade'}</p>

                      {/* Touch-Friendly Stepper and Unit Selector */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-surface-canvas shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.productId, Math.max(1, (item.quantity || 1) - 1), item.unit)}
                            aria-label={`Decrease quantity of ${item.productName}`}
                            className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200 active:bg-neutral-300 text-sm font-bold transition-colors select-none"
                          >
                            −
                          </button>
                          <input
                            id={`qty-${item.productId}`}
                            type="number"
                            min="1"
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.productId, Math.max(1, parseInt(e.target.value, 10) || 1), item.unit)}
                            aria-label={`Quantity for ${item.productName}`}
                            className="w-12 h-8 text-center text-xs font-semibold border-x border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-800"
                          />
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.productId, (item.quantity || 1) + 1, item.unit)}
                            aria-label={`Increase quantity of ${item.productName}`}
                            className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200 active:bg-neutral-300 text-sm font-bold transition-colors select-none"
                          >
                            +
                          </button>
                        </div>

                        <select
                          value={item.unit}
                          onChange={(e) => updateItemQuantity(item.productId, item.quantity, e.target.value)}
                          aria-label={`Unit of measure for ${item.productName}`}
                          className="h-8 px-2 text-xs font-medium border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-800 transition-colors shadow-xs"
                        >
                          <option value="MT">MT</option>
                          <option value="kg">kg</option>
                          <option value="20ft FCL">20ft FCL</option>
                          <option value="40ft FCL">40ft FCL</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-neutral-400 hover:text-status-error p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors duration-150 active:scale-90"
                      aria-label={`Remove ${item.productName} from quote basket`}
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer with Safe-Area Padding */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-6 border-t border-surface-border bg-surface-canvas space-y-3 shrink-0">
              <div className="flex justify-between items-center text-xs text-neutral-500">
                <span className="font-medium">Indicative Terms: CIF / FOB / CFR</span>
                <button
                  type="button"
                  onClick={clearBasket}
                  className="text-neutral-500 hover:text-status-error underline transition-colors min-h-[44px] flex items-center"
                >
                  Clear all items
                </button>
              </div>
              <Button
                variant="cta"
                size="lg"
                className="w-full flex items-center justify-center gap-2 shadow-card min-h-[48px] text-sm font-bold"
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/contact');
                }}
              >
                <span>Proceed to RFQ Form</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDrawer;
