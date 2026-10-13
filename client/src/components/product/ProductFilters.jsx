import React, { useState } from 'react';
import { Search, X, Filter, Sparkles, Loader2 } from 'lucide-react';
import { runSmartSearch } from '../../features/ai/api';

export const ProductFilters = ({
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

  const handleRunSmartSearch = async (e) => {
    if (e) e.preventDefault();
    const queryToRun = smartQuery.trim() || searchQuery.trim();
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
        // Find best match in categories
        const match = categories.find(
          (c) => c.slug === data.categorySlug || c.name.toLowerCase() === data.categorySlug.toLowerCase()
        );
        if (match) {
          onSelectCategory(match.slug);
        }
      }
    } catch (err) {
      console.warn('Smart search fallback:', err);
      setSmartError(err.message || 'AI search busy. Applied standard keyword query.');
      // Fallback: standard query search
      onSearchChange(queryToRun);
    } finally {
      setIsSmartSearching(false);
    }
  };

  const handleClearSmartSearch = () => {
    setSmartResult(null);
    setSmartQuery('');
    setSmartError(null);
    onResetFilters();
  };

  return (
    <div className="bg-surface-card p-6 rounded-xl border border-surface-border shadow-subtle space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div className="flex items-center gap-2 text-neutral-900 font-semibold text-sm">
          <Filter className="w-4 h-4 text-primary-800" />
          <span>Filter Catalogue ({totalResults})</span>
        </div>
        {(selectedCategory || searchQuery || smartResult || selectedSort !== '-createdAt') && (
          <button
            type="button"
            onClick={() => {
              setSmartResult(null);
              setSmartQuery('');
              onResetFilters();
            }}
            className="text-xs text-cta-600 hover:text-cta-700 font-medium flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* AI Smart Search Box */}
      <div className="p-3.5 rounded-lg bg-primary-50/60 border border-primary-200/70 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-primary-900">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-600" />
            <span>Smart Natural Search</span>
          </span>
          <span className="text-[10px] text-primary-700/80 font-normal">AI Filter</span>
        </div>
        <form onSubmit={handleRunSmartSearch} className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={smartQuery}
              onChange={(e) => setSmartQuery(e.target.value)}
              placeholder="e.g. 10 MT Castor oil or Ashwagandha 5%"
              className="w-full text-xs rounded-md border border-primary-200 bg-white px-3 py-2 pr-8 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-800"
              maxLength={500}
            />
            {smartQuery && (
              <button
                type="button"
                onClick={() => setSmartQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSmartSearching || !smartQuery.trim()}
            className="w-full text-xs font-medium py-1.5 px-3 rounded-md bg-primary-800 hover:bg-primary-900 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isSmartSearching ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Extracting Specs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-accent-300" />
                <span>Apply Smart Filters</span>
              </>
            )}
          </button>
        </form>

        {smartError && (
          <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
            {smartError}
          </p>
        )}

        {/* Parsed Result Summary Badges */}
        {smartResult && (
          <div className="mt-2 pt-2 border-t border-primary-200/60 text-[11px] text-neutral-700 space-y-1 bg-white/70 p-2 rounded">
            <div className="flex items-center justify-between font-semibold text-primary-900">
              <span>Parsed Intent:</span>
              <button
                type="button"
                onClick={handleClearSmartSearch}
                className="text-neutral-400 hover:text-neutral-700"
                title="Clear AI Filters"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            {smartResult.keyword && (
              <div className="flex items-center gap-1">
                <span className="text-neutral-500">Keyword:</span>
                <span className="font-medium text-neutral-900">{smartResult.keyword}</span>
              </div>
            )}
            {smartResult.origin && (
              <div className="flex items-center gap-1">
                <span className="text-neutral-500">Origin:</span>
                <span className="font-medium text-neutral-900">{smartResult.origin}</span>
              </div>
            )}
            {smartResult.quantity && (
              <div className="flex items-center gap-1">
                <span className="text-neutral-500">Volume:</span>
                <span className="font-medium text-neutral-900">
                  {smartResult.quantity} {smartResult.unit || ''}
                </span>
              </div>
            )}
            {smartResult.packing && (
              <div className="flex items-center gap-1">
                <span className="text-neutral-500">Packing:</span>
                <span className="font-medium text-neutral-900">{smartResult.packing}</span>
              </div>
            )}
            {smartResult.summary && (
              <p className="text-[10px] text-neutral-500 italic mt-1">{smartResult.summary}</p>
            )}
          </div>
        )}
      </div>

      {/* Standard Search Input */}
      <div>
        <label htmlFor="search-commodities" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Raw Material or HS Code
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-commodities"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Ashwagandha, 2918, SLES..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Export Division
        </span>
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${
              !selectedCategory
                ? 'bg-primary-800 text-white'
                : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug || selectedCategory === cat.name
                  ? 'bg-primary-800 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span className="truncate pr-2">{cat.name}</span>
              {cat.hsChapter && (
                <span className="font-mono text-[10px] opacity-75 shrink-0">
                  Ch.{cat.hsChapter}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div>
        <label htmlFor="sort-order" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Sort Order
        </label>
        <select
          id="sort-order"
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-surface-border bg-surface-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
        >
          <option value="-createdAt">Newest Listed</option>
          <option value="name">Product Name (A–Z)</option>
          <option value="-name">Product Name (Z–A)</option>
          <option value="views">Most Inquired</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;
