import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  X,
  ChevronDown,
  Link as LinkIcon,
  Check,
  FileQuestion,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  ChevronsUpDown,
} from 'lucide-react';
import { useFaqs } from '../../features/trust/hooks';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import Reveal from '../../components/ui/Reveal';
import Skeleton from '../../components/ui/skeleton/Skeleton';
import { JsonLd, createFaqSchema } from '../../components/seo/JsonLd';

const FAQ_GROUPS = [
  { id: 'all', label: 'All Categories', groupKey: '' },
  { id: 'ordering', label: 'Ordering & MOQ', groupKey: 'Ordering & Minimum Quantities (MOQ)' },
  { id: 'quality', label: 'Products & Quality', groupKey: 'Products & Quality Assurance' },
  { id: 'packaging', label: 'Packaging & OEM', groupKey: 'Packaging, Labelling & Private Label' },
  { id: 'shipping', label: 'Shipping & Incoterms', groupKey: 'Shipping, Logistics & Incoterms 2020' },
  { id: 'payments', label: 'Payments & Banking', groupKey: 'Payments, Banking & Commercial Terms' },
  { id: 'regulatory', label: 'Compliance & COA', groupKey: 'Regulatory, COA & Compliance' },
];

export const FaqPage = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [openSlugs, setOpenSlugs] = useState(new Set());
  const [copiedSlug, setCopiedSlug] = useState(null);
  const location = useLocation();
  const searchInputRef = useRef(null);

  // Fetch all active FAQs
  const { data: faqs = [], isLoading, isError, refetch } = useFaqs();

  // Search & category filtering
  const filteredFaqs = useMemo(() => {
    const term = searchFilter.trim().toLowerCase();
    return faqs.filter((faq) => {
      // Category match
      if (selectedGroup && faq.group !== selectedGroup) {
        return false;
      }
      // Keyword match across question, answer, and group
      if (term) {
        const matchesQuestion = faq.question.toLowerCase().includes(term);
        const matchesAnswer = faq.answer.toLowerCase().includes(term);
        const matchesGroup = (faq.group || '').toLowerCase().includes(term);
        return matchesQuestion || matchesAnswer || matchesGroup;
      }
      return true;
    });
  }, [faqs, selectedGroup, searchFilter]);

  // Compute category item counts based on current search filter
  const categoryCounts = useMemo(() => {
    const term = searchFilter.trim().toLowerCase();
    const counts = { '': 0 };
    FAQ_GROUPS.forEach((g) => {
      if (g.groupKey) counts[g.groupKey] = 0;
    });

    faqs.forEach((faq) => {
      const matchesSearch = !term ||
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        (faq.group || '').toLowerCase().includes(term);

      if (matchesSearch) {
        counts[''] = (counts[''] || 0) + 1;
        if (faq.group && counts[faq.group] !== undefined) {
          counts[faq.group] = (counts[faq.group] || 0) + 1;
        }
      }
    });

    return counts;
  }, [faqs, searchFilter]);

  // Handle URL hash deep-linking (e.g. #standard-minimum-order-quantity-moq)
  useEffect(() => {
    if (!faqs.length) return;

    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;

    const targetFaq = faqs.find((f) => f.slug === hash);
    if (targetFaq) {
      // If the target FAQ belongs to a different active group filter, reset to all
      if (selectedGroup && selectedGroup !== targetFaq.group) {
        setSelectedGroup('');
      }

      // Automatically open the targeted FAQ
      setOpenSlugs((prev) => new Set([...prev, targetFaq.slug]));

      // Calm scroll to element
      const timer = setTimeout(() => {
        const element = document.getElementById(`faq-item-${targetFaq.slug}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [faqs, location.hash]);

  // Toggle individual question accordion
  const toggleFaq = (slug) => {
    setOpenSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  // Expand / collapse all visible questions
  const allVisibleAreOpen = useMemo(() => {
    if (filteredFaqs.length === 0) return false;
    return filteredFaqs.every((f) => openSlugs.has(f.slug));
  }, [filteredFaqs, openSlugs]);

  const toggleExpandAll = () => {
    if (allVisibleAreOpen) {
      // Collapse visible
      setOpenSlugs((prev) => {
        const next = new Set(prev);
        filteredFaqs.forEach((f) => next.delete(f.slug));
        return next;
      });
    } else {
      // Expand all visible
      setOpenSlugs((prev) => {
        const next = new Set(prev);
        filteredFaqs.forEach((f) => next.add(f.slug));
        return next;
      });
    }
  };

  // Copy deep-link URL to clipboard
  const copyDeepLink = (e, slug) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${slug}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedSlug(slug);
    window.history.replaceState(null, null, `#${slug}`);
    setTimeout(() => {
      setCopiedSlug((current) => (current === slug ? null : current));
    }, 2000);
  };

  // Render formatted answer with safe TODO(client) styling
  const renderFormattedAnswer = (text) => {
    if (!text.includes('TODO(client')) {
      return <p>{text}</p>;
    }

    // Replace TODO(client...) with professional disclaimer pill
    const parts = text.split(/(TODO\(client[^)]*\))/gi);
    return (
      <p>
        {parts.map((part, index) => {
          if (part.startsWith('TODO(client')) {
            const innerNote = part.replace(/^TODO\(client:?\s*/i, '').replace(/\)$/, '');
            return (
              <span
                key={index}
                title={innerNote}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200/80 mx-1"
              >
                [Subject to destination confirmation]
              </span>
            );
          }
          return part;
        })}
      </p>
    );
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';
  const siteUrl = import.meta.env.VITE_CLIENT_URL || 'https://jhsglobal.com';

  // Dynamic FAQPage schema generated strictly from currently visible questions
  const faqSchema = useMemo(() => {
    return createFaqSchema(filteredFaqs);
  }, [filteredFaqs]);

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions (B2B Procurement FAQ) — JHS Global</title>
        <meta
          name="description"
          content="Answers to international importer questions regarding Minimum Order Quantities (MOQ), commercial banking terms (TT/LC), Incoterms 2020, lab testing COA, and custom OEM packaging."
        />
        <link rel="canonical" href={`${siteUrl}/faq`} />
      </Helmet>

      {/* Dynamic FAQPage JSON-LD strictly reflecting visible questions */}
      <JsonLd data={faqSchema} />

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        eyebrow="Buyer Procurement Knowledge Base"
        title="Frequently Asked Questions (B2B FAQ)"
        description="Transparent operational answers regarding container ordering policies, commercial LC banking, shipping documentation, and laboratory quality testing."
      />

      {/* Main Content Area */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 pb-28 lg:pb-16">
        {/* Search Input Bar */}
        <div className="relative">
          <label htmlFor="faq-search-input" className="sr-only">
            Search procurement questions
          </label>
          <Search
            className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="faq-search-input"
            ref={searchInputRef}
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchFilter('');
            }}
            placeholder="Search by keyword (e.g. MOQ, payment, LC, samples, COA, FOB)..."
            className="w-full pl-11 pr-10 py-3.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-white shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary-800 transition-all"
          />
          {searchFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchFilter('');
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Group Filter Chips with horizontal smooth swipe */}
        <div
          role="tablist"
          aria-label="FAQ Category Filters"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {FAQ_GROUPS.map((grp) => {
            const isSelected = selectedGroup === grp.groupKey;
            const count = categoryCounts[grp.groupKey] ?? 0;
            return (
              <button
                key={grp.id}
                role="tab"
                id={`tab-${grp.id}`}
                aria-selected={isSelected}
                aria-controls="faq-accordion-list"
                type="button"
                onClick={() => setSelectedGroup(grp.groupKey)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 min-h-[44px] flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-primary-900 border-primary-900 text-white shadow-subtle'
                    : 'bg-white border-surface-border text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <span>{grp.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Toolbar: Match Count & Expand/Collapse All */}
        <div className="flex items-center justify-between gap-4 pt-1 text-xs text-neutral-500 border-b border-surface-border/60 pb-3">
          <div className="font-mono">
            {searchFilter ? (
              <span>
                Found <strong className="text-neutral-900">{filteredFaqs.length}</strong> matching{' '}
                {filteredFaqs.length === 1 ? 'question' : 'questions'}
              </span>
            ) : (
              <span>
                Showing <strong className="text-neutral-900">{filteredFaqs.length}</strong> questions
                {selectedGroup ? ` in ${selectedGroup}` : ' across all categories'}
              </span>
            )}
          </div>

          {filteredFaqs.length > 0 && (
            <button
              type="button"
              onClick={toggleExpandAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-800 hover:text-primary-900 focus:outline-none focus:underline"
              aria-label={allVisibleAreOpen ? 'Collapse all visible questions' : 'Expand all visible questions'}
            >
              <ChevronsUpDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{allVisibleAreOpen ? 'Collapse All' : 'Expand All'}</span>
            </button>
          )}
        </div>

        {/* State 1: Skeleton Loading State */}
        {isLoading && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading questions">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-surface-border bg-surface-card space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State 2: Error State with Retry */}
        {!isLoading && isError && (
          <div className="p-8 sm:p-12 text-center border border-red-200 rounded-2xl bg-red-50/40 space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Unable to load FAQ knowledge base
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
                A network or connection interruption occurred while fetching commercial procurement answers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-xs font-semibold shadow-subtle min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading FAQs</span>
            </button>
          </div>
        )}

        {/* State 3: Empty Search Result State */}
        {!isLoading && !isError && filteredFaqs.length === 0 && (
          <div className="p-10 sm:p-14 text-center border border-surface-border rounded-2xl bg-surface-card shadow-subtle space-y-4">
            <FileQuestion className="w-12 h-12 text-neutral-300 mx-auto" aria-hidden="true" />
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-800">
                No matching questions found
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                {searchFilter
                  ? `We could not find any questions matching "${searchFilter}". Try adjusting your keywords or browse all categories.`
                  : 'There are no active questions available in this category at this time.'}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {(searchFilter || selectedGroup) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilter('');
                    setSelectedGroup('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold min-h-[44px]"
                >
                  Reset All Filters
                </button>
              )}
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  Contact Export Desk
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* State 4: FAQ Accordion List */}
        {!isLoading && !isError && filteredFaqs.length > 0 && (
          <Reveal
            direction="up"
            cascade
            stagger={0.03}
            id="faq-accordion-list"
            className="space-y-3.5"
          >
            {filteredFaqs.map((faq) => {
              const isOpen = openSlugs.has(faq.slug);
              const isCopied = copiedSlug === faq.slug;

              return (
                <article
                  key={faq.id || faq.slug}
                  id={`faq-item-${faq.slug}`}
                  className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden ${
                    isOpen
                      ? 'border-primary-800/40 shadow-card ring-1 ring-primary-800/20'
                      : 'border-surface-border hover:border-neutral-300 shadow-subtle'
                  }`}
                >
                  {/* Accordion Trigger Header */}
                  <div className="flex items-start justify-between gap-3 p-4 sm:p-5 hover:bg-neutral-50/60 transition-colors">
                    <button
                      type="button"
                      id={`faq-btn-${faq.slug}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${faq.slug}`}
                      onClick={() => toggleFaq(faq.slug)}
                      className="flex-1 text-left flex items-start justify-between gap-4 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-800 rounded-lg min-h-[44px]"
                    >
                      <div className="space-y-1 pr-2">
                        <span className="font-serif text-sm sm:text-base font-bold text-neutral-900 group-hover:text-primary-900 transition-colors block leading-snug">
                          {faq.question}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="inline-block font-mono text-[10px] text-accent-700 bg-accent-50/80 px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold border border-accent-200/50">
                            {faq.group}
                          </span>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-5 h-5 text-neutral-400 group-hover:text-primary-800 transition-transform duration-300 transform-gpu shrink-0 mt-0.5 ${
                          isOpen ? 'rotate-180 text-primary-800' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Sibling Copy Deep Link Button */}
                    <button
                      type="button"
                      onClick={(e) => copyDeepLink(e, faq.slug)}
                      aria-label={`Copy link for FAQ: ${faq.slug}`}
                      title="Copy direct link to this question"
                      className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  {/* Accordion Body with smooth CSS Grid Animation */}
                  <div
                    id={`faq-panel-${faq.slug}`}
                    role="region"
                    aria-labelledby={`faq-btn-${faq.slug}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-1 border-t border-surface-border/60 text-xs sm:text-sm text-neutral-600 leading-relaxed bg-surface-canvas/40 space-y-3">
                        {renderFormattedAnswer(faq.answer)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </Reveal>
        )}

        {/* Bottom Conversion CTA Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-subtle via-white to-surface-subtle border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-subtle">
          <div className="space-y-1.5 max-w-xl">
            <span className="font-mono text-[10px] font-bold text-accent-700 uppercase tracking-wider">
              Direct Commercial Support
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900">
              Have a specific procurement requirement?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Connect directly with our export director on WhatsApp or submit a formal specification request for container availability and commercial pricing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 min-h-[44px] shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Ask via WhatsApp</span>
            </a>
            <Link to="/contact" className="flex-1 md:flex-initial">
              <Button variant="cta" size="md" className="w-full">
                Submit RFQ Form
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqPage;
