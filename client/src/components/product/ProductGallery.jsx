import React, { useState } from 'react';
import { Package, ShieldCheck } from 'lucide-react';

export const ProductGallery = ({ images = [], productName = 'Product' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const displayImages = images.length > 0 ? images : [{ url: '', alt: 'Placeholder', isPrimary: true }];
  const currentImage = displayImages[selectedIndex] || displayImages[0];

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const deltaX = touchStartX - touchEndX;
    const minSwipeDistance = 40;

    if (deltaX > minSwipeDistance) {
      // Swiped left -> next image
      setSelectedIndex((prev) => (prev + 1) % displayImages.length);
    } else if (deltaX < -minSwipeDistance) {
      // Swiped right -> prev image
      setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Primary Display Viewport with touch swipe listeners */}
      <div
        className="group relative aspect-[4/3] rounded-2xl bg-neutral-100 border border-surface-border overflow-hidden shadow-subtle flex items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentImage?.url ? (
          <picture className="w-full h-full">
            {currentImage.url.endsWith('.webp') && !currentImage.url.includes('-') && (
              <>
                <source
                  type="image/avif"
                  srcSet={`${currentImage.url.replace('.webp', '-480w.avif')} 480w, ${currentImage.url.replace('.webp', '-800w.avif')} 800w, ${currentImage.url.replace('.webp', '-1200w.avif')} 1200w`}
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
                <source
                  type="image/webp"
                  srcSet={`${currentImage.url.replace('.webp', '-480w.webp')} 480w, ${currentImage.url.replace('.webp', '-800w.webp')} 800w, ${currentImage.url.replace('.webp', '-1200w.webp')} 1200w`}
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </>
            )}
            <img
              key={selectedIndex}
              src={currentImage.url}
              alt={currentImage.alt || productName}
              width="800"
              height="600"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              className="w-full h-full object-cover transform-gpu animate-image-fade motion-reduce:animate-none group-hover:scale-[1.03] transition-transform duration-500 pointer-events-none"
              style={{ transitionTimingFunction: 'var(--ease-standard)' }}
              onError={(e) => {
                e.target.style.display = 'none';
                const ph = e.target.closest('.relative')?.querySelector('.fallback-placeholder');
                if (ph) ph.style.display = 'flex';
              }}
            />
          </picture>
        ) : null}

        {/* Illustrative raw material image disclaimer badge */}
        {currentImage?.url ? (
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-900/75 backdrop-blur-sm border border-white/10 text-white text-[10px] font-sans font-medium tracking-wide shadow-sm">
              Illustrative raw material image
            </span>
          </div>
        ) : null}

        {/* Placeholder fallback */}
        <div
          className={`fallback-placeholder w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-50 to-neutral-200 ${
            currentImage?.url ? 'hidden' : 'flex'
          }`}
        >
          <Package className="w-16 h-16 text-neutral-400 mb-3" />
          <span className="font-serif font-bold text-neutral-800 text-lg">{productName}</span>
          <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
            Verified Indian Origin Export Consignment
          </span>
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-accent-500" /> Inspected Prior to Container Loading
          </span>
        </div>
      </div>

      {/* Mobile Pagination Indicator Dots (<1024px) */}
      {displayImages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-0.5 lg:hidden" aria-label="Gallery slide indicators">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View image ${idx + 1} of ${displayImages.length}`}
              className={`h-2 rounded-full transition-all duration-200 ${
                selectedIndex === idx
                  ? 'w-5 bg-accent-500'
                  : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Bar */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Thumbnail ${idx + 1}`}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden shrink-0 transition-all duration-150 active:scale-95 transform-gpu ${
                selectedIndex === idx
                  ? 'border-primary-800 ring-2 ring-primary-800/30 shadow-xs'
                  : 'border-surface-border hover:border-neutral-400 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
