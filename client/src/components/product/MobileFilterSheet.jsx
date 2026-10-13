import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Filter, Sparkles, Loader2, Check, RotateCcw } from 'lucide-react';
import { runSmartSearch } from '../../features/ai/api';

export const MobileFilterSheet = ({
  isOpen,
  onClose,
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedSort,
  onSortChange,
  onResetFilters,
  totalResults = 0,
}) => {
  const [smartQuery, setSmartQuery] = useState('');
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const [smartResult, setSmartResult] = useState(null);
  const [smartError, setSmartError] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
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

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    if (touchStartY === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY > 60) {
      onClose();
    }
    setTouchStartY(null);
  };

  const handleRunSmartSearch = async (e) => {
    if (e) e.preventDefault();
    const queryToRun = smartQuery.trim();
    if (!queryToRun) return;

    setIsSmartSearching(true);
    setSmartError(null);
    try {
      const data = await runSmartSearch(queryToRun);
      setSmartResult(data);
      if (data.keyword) {
        onSearchChange(data.keyword);
      }
      if (data.categorySlug) {
        const match = categories.find(
          (c) => c.slug === data.categorySlug || c.name.toLowerCase() === data.categorySlug.toLowerCase()
        );
        if (match) {
          onSelectCategory(match.slug);
        }
      }
    } catch (err) {
      setSmartError(err.message || 'AI search busy. Applied keyword directly.');
      onSearchChange(queryToRun);
    } finally {
      setIsSmartSearching(false);
    }
  };

  const handleReset = () => {
    setSmartResult(null);
    setSmartQuery('');
    setSmartError(null);
    onResetFilters();
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (selectedSort !== '-createdAt' ? 1 : 0);

  const content = (
    <div
      data-lenis-prevent
      className={`fixed inset-0 z-50 lg:hidden overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet Box */}
      <div className="fixed inset-x-0 bottom-0 max-w-full flex pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter and Sort Catalogue"
          className={`w-full bg-white shadow-2xl flex flex-col rounded-t-2xl max-h-[88dvh] pointer-events-auto transform-gpu transition-transform duration-300 ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-standard)' }}
        >
          {/* Drag Pill */}
          <div
            className="pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-hidden="true"
          >
            <div className="w-12 h-1.5 rounded-full bg-neutral-300" />
          </div>

          {/* Header */}
          <div
            className="px-4 py-3 border-b border-surface-border flex items-center justify-between bg-surface-canvas shrink-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-800" />
              <h2 className="font-serif text-base font-bold text-neutral-900">
                Filter & Sort Catalogue
              </h2>
              {activeFilterCount > 0 && (
                <span className="bg-primary-900 text-accent-400 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-800 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sheet Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Sort Options */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Sort Commodities
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: '-createdAt', label: 'Newest Listed' },
                  { value: 'name', label: 'Name (A–Z)' },
                  { value: '-name', label: 'Name (Z–A)' },
                  { value: 'views', label: 'Most Inquired' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSortChange(opt.value)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all min-h-[44px] flex items-center justify-between border ${
                      selectedSort === opt.value
                        ? 'bg-primary-900 text-white border-primary-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedSort === opt.value && <Check className="w-3.5 h-3.5 text-accent-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Export Category
              </span>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => onSelectCategory('')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all min-h-[44px] flex items-center justify-between border ${
                    !selectedCategory
                      ? 'bg-primary-900 text-white border-primary-900'
                      : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span>All Categories ({totalResults})</span>
                  {!selectedCategory && <Check className="w-3.5 h-3.5 text-accent-400 shrink-0" />}
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => onSelectCategory(cat.slug)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all min-h-[44px] flex items-center justify-between border ${
                        isSelected
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {cat.hsChapter && (
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-primary-800 text-accent-300' : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            Ch.{cat.hsChapter}
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Natural Smart Search */}
            <div className="p-3.5 rounded-xl bg-primary-50/70 border border-primary-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-primary-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-600" />
                  <span>AI Natural Specification Search</span>
                </span>
                <span className="text-[10px] font-mono text-primary-700 uppercase">Grounded</span>
              </div>
              <form onSubmit={handleRunSmartSearch} className="space-y-2">
                <input
                  type="text"
                  value={smartQuery}
                  onChange={(e) => setSmartQuery(e.target.value)}
                  placeholder="e.g. 10 MT Castor oil or Ashwagandha 5%"
                  className="w-full text-xs rounded-lg border border-primary-200 bg-white px-3 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-800 min-h-[44px]"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isSmartSearching || !smartQuery.trim()}
                  className="w-full text-xs font-bold py-2.5 px-3 rounded-lg bg-primary-900 hover:bg-primary-950 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  {isSmartSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing Natural Specs...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                      <span>Apply AI Specs</span>
                    </>
                  )}
                </button>
              </form>

              {smartError && (
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                  {smartError}
                </p>
              )}

              {smartResult && (
                <div className="pt-2 border-t border-primary-200 text-[11px] text-neutral-800 space-y-1 bg-white p-2.5 rounded-lg border border-neutral-200">
                  <span className="font-bold text-primary-900 block">Matched Parameters:</span>
                  {smartResult.keyword && <div>Keyword: <span className="font-semibold">{smartResult.keyword}</span></div>}
                  {smartResult.quantity && <div>Volume: <span className="font-semibold">{smartResult.quantity} {smartResult.unit || ''}</span></div>}
                  {smartResult.packing && <div>Packing: <span className="font-semibold">{smartResult.packing}</span></div>}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sheet Bottom Action Bar */}
          <div className="p-4 border-t border-surface-border bg-surface-canvas flex items-center gap-3 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-bold flex items-center justify-center gap-1.5 min-h-[48px] active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-cta-500 hover:bg-cta-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm min-h-[48px] active:scale-[0.98] transition-all"
            >
              <span>Apply Filters ({totalResults} Products)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
};

export default MobileFilterSheet;
