import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, ShieldCheck, Send } from 'lucide-react';
import { useQuoteBasket } from '../../features/quoteBasket/context';

export const StickyMobileQuoteBar = () => {
  const { totalItemCount, setIsDrawerOpen } = useQuoteBasket();
  const location = useLocation();
  const navigate = useNavigate();

  // If on admin routes, do not render public quote bar
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const isContactPage = location.pathname === '/contact';

  const handlePrimaryAction = () => {
    if (isContactPage) {
      // Smoothly focus or scroll to the RFQ form on contact page
      const rfqForm = document.querySelector('form');
      if (rfqForm) {
        rfqForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const nameInput = rfqForm.querySelector('input[name="name"]');
        if (nameInput) nameInput.focus();
      }
    } else {
      navigate('/contact');
    }
  };

  return (
    <aside
      aria-label="Mobile Sticky Quote Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transform-gpu transition-transform duration-200"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="px-3.5 py-2 flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Left: Quick Quote Basket Trigger Pill */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 active:scale-[0.97] transition-all min-h-[44px] shrink-0 border border-neutral-200/80 focus:outline-none focus:ring-2 focus:ring-primary-800"
          aria-label={`View Quote Basket (${totalItemCount} commodities)`}
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-primary-900 shrink-0" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-cta-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">
                {totalItemCount}
              </span>
            )}
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] font-bold text-neutral-900">
              {totalItemCount === 0 ? 'Basket' : `${totalItemCount} ${totalItemCount === 1 ? 'Item' : 'Items'}`}
            </span>
            <span className="text-[9px] text-neutral-500 font-mono mt-0.5">FCL / MT</span>
          </div>
        </button>

        {/* Right: High-Contrast "Request a Quote" Action Button */}
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cta-500 hover:bg-cta-600 active:scale-[0.98] text-white text-xs font-bold shadow-sm transition-all duration-150 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-cta-500"
        >
          {isContactPage ? (
            <>
              <Send className="w-4 h-4 shrink-0" />
              <span className="truncate">Submit Detailed RFQ</span>
            </>
          ) : (
            <>
              <span className="truncate">Request a Quote (RFQ)</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default StickyMobileQuoteBar;
