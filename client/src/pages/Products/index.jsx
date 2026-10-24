import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PackageOpen, ChevronLeft, ChevronRight, AlertCircle, Filter, Search, X } from 'lucide-react';
import { useProducts, useCategories } from '../../features/products/hooks';
import ProductCard from '../../components/product/ProductCard';
import ProductFilters from '../../components/product/ProductFilters';
import MobileFilterSheet from '../../components/product/MobileFilterSheet';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import PageHeader from '../../components/layout/PageHeader';
import UnlistedSourcingBanner from '../../components/common/UnlistedSourcingBanner';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || '';
  const initialQ = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || '-createdAt';
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync state with URL
  const updateQueryParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1');
    setCurrentPage(1);
    setSearchParams(nextParams);
  };

  const handleCategorySelect = (catSlug) => {
    updateQueryParam('category', catSlug);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const nextParams = new URLSearchParams(searchParams);
    if (query && query.trim()) {
      nextParams.set('q', query.trim());
    } else {
      nextParams.delete('q');
    }
    nextParams.set('page', '1');
    setCurrentPage(1);
    setSearchParams(nextParams);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    updateQueryParam('sort', sort);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSort('-createdAt');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', page.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { data: categories = [] } = useCategories();
  const { data, isLoading, isError, error, refetch } = useProducts({
    category: selectedCategory,
    q: searchQuery,
    sort: selectedSort,
    page: currentPage,
    limit: 24,
  });

  const products = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1, hasNext: false, hasPrev: false };

  return (
    <>
      <Helmet>
        <title>Export Catalogue — Food Ingredients, Personal Care, Botanicals & Feed | JHS GLOBAL</title>
        <meta
          name="description"
          content="Browse JHS GLOBAL's export catalogue: Indian spices, pulses, superfoods, dehydrated ingredients, botanical extracts, cosmetic raw materials, and animal feed in bulk container shipments."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        eyebrow="International Digital Catalogue"
        title="Export Raw Materials, Active Ingredients & Animal Feed"
        description="Explore manufacturer-grade export lines across 3 divisions with full HS classification, container loading parameters, and lot-by-lot batch analysis specs. All quotes issued on formal proforma terms."
      />

      {/* Main Content Area */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar (Desktop Sticky until footer) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 xl:top-32 max-h-[calc(100vh-8.5rem)] overflow-y-auto no-scrollbar">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedSort={selectedSort}
                onSortChange={handleSortChange}
                onResetFilters={handleResetFilters}
                totalResults={meta.total}
              />
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            {/* Mobile Filter & Search Toolbar (<1024px) */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search Ashwagandha, SLES, Soybean meal, HS..."
                    className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 min-h-[44px]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Clear search input"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(true)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 min-h-[44px] shrink-0 transition-colors ${
                    selectedCategory || selectedSort !== '-createdAt'
                      ? 'bg-primary-900 text-white border-primary-900 shadow-sm'
                      : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50'
                  }`}
                  aria-label="Open catalogue filters and sort"
                >
                  <Filter className="w-4 h-4 shrink-0" />
                  <span>Filters</span>
                  {(selectedCategory || selectedSort !== '-createdAt') && (
                    <span className="w-2 h-2 rounded-full bg-accent-400" />
                  )}
                </button>
              </div>

              {(selectedCategory || searchQuery || selectedSort !== '-createdAt') && (
                <div className="flex items-center justify-between text-xs text-neutral-600 bg-neutral-100 px-3 py-2 rounded-lg">
                  <span className="truncate">
                    {meta.total} {meta.total === 1 ? 'product' : 'products'} found
                    {selectedCategory ? ` in ${selectedCategory}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-cta-600 font-semibold hover:underline shrink-0 ml-2 min-h-[36px] flex items-center"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 rounded-xl bg-neutral-200 animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-8 rounded-xl border border-status-error/30 bg-red-50 text-center">
                <AlertCircle className="w-10 h-10 text-status-error mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-neutral-900">Catalogue Query Failed</h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                  {error?.message || 'Unable to connect with the export catalogue database.'}
                </p>
                <Button variant="primary" size="sm" onClick={() => refetch()} className="mt-4">
                  Retry Query
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="p-16 rounded-xl border border-surface-border bg-surface-card text-center">
                <PackageOpen className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-neutral-900">
                  No Export Products Match Your Criteria
                </h3>
                <p className="text-sm text-neutral-600 mt-2 max-w-md mx-auto">
                  We supply custom raw material grades and specialized formulations on direct request. Submit your target specification to our trade desk.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Clear Filter Criteria
                  </Button>
                  <Link to="/contact">
                    <Button variant="cta" size="sm">
                      Submit Custom RFQ
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Reveal
                  key={`${selectedCategory}-${searchQuery}-${selectedSort}-${currentPage}`}
                  direction="up"
                  cascade
                  stagger={0.06}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </Reveal>

                {/* Pagination Controls */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-surface-border pt-6">
                    <span className="text-xs text-neutral-500">
                      Page {meta.page} of {meta.totalPages} ({meta.total} products)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!meta.hasPrev}
                        onClick={() => handlePageChange(meta.page - 1)}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!meta.hasNext}
                        onClick={() => handlePageChange(meta.page + 1)}
                        className="flex items-center gap-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 48-Hour Unlisted Sourcing Guarantee (REQ-03) */}
        <div className="mt-14">
          <UnlistedSourcingBanner />
        </div>
      </section>

      {/* Mobile Filter & Sort Bottom Sheet (<1024px) */}
      <MobileFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        totalResults={meta.total}
      />
    </>
  );
};

export default ProductsPage;
