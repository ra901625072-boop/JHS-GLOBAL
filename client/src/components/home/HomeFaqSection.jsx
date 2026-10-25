import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  ArrowRight,
  MessageCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useFeaturedFaqs } from '../../features/trust/hooks';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import Skeleton from '../ui/skeleton/Skeleton';

export const HomeFaqSection = () => {
  const { data: faqs = [], isLoading, isError, refetch } = useFeaturedFaqs();
  // Open the first question by default for instant affordance
  const [openSlug, setOpenSlug] = useState(null);

  const toggleAccordion = (slug) => {
    setOpenSlug((current) => (current === slug ? null : slug));
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';

  return (
    <section
      id="home-faq"
      aria-label="Frequently Asked Questions"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-surface-border relative select-none scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Heading, Context & Navigation CTAs (5 Columns on Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-5">
            <Reveal direction="up">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 border border-accent-200/60 text-accent-800 text-xs font-semibold mb-3">
                <HelpCircle className="w-3.5 h-3.5 text-accent-600 shrink-0" aria-hidden="true" />
                <span>PROCUREMENT CLARITY</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight leading-tight">
                Clear Answers Before You Order
              </h2>

              <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
                Direct operational facts on container minimums, commercial LC banking, product specifications, and export documentation turnaround.
              </p>

              {/* Action Buttons */}
              <div className="pt-3 space-y-3">
                <div>
                  <Link to="/faq">
                    <Button variant="cta" size="md" className="group">
                      <span>View All FAQs</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Have a custom question? Ask via WhatsApp</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: 5 Featured Accordion Cards (7 Columns on Desktop) */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <div className="space-y-3.5" aria-busy="true" aria-label="Loading featured FAQs">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-surface-border bg-surface-canvas/50 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Skeleton className="h-5 w-4/5 rounded-md" />
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="p-6 text-center border border-red-200 rounded-xl bg-red-50/50 space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" aria-hidden="true" />
                <p className="text-xs sm:text-sm text-neutral-600">
                  Unable to load frequently asked questions at this moment.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-800 text-white text-xs font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            ) : (
              <Reveal direction="up" cascade stagger={0.04} className="space-y-3.5">
                {faqs.map((faq, index) => {
                  // If none explicitly selected, first question (index 0) is open by default
                  const isOpen = openSlug === null ? index === 0 : openSlug === faq.slug;

                  return (
                    <article
                      key={faq.id || faq.slug}
                      className={`rounded-xl border transition-all duration-200 bg-surface-canvas/40 overflow-hidden ${
                        isOpen
                          ? 'border-primary-800/40 bg-white shadow-card ring-1 ring-primary-800/20'
                          : 'border-surface-border hover:border-neutral-300 shadow-subtle'
                      }`}
                    >
                      {/* Accordion Trigger Header */}
                      <button
                        type="button"
                        id={`home-faq-btn-${faq.slug}`}
                        aria-expanded={isOpen}
                        aria-controls={`home-faq-panel-${faq.slug}`}
                        onClick={() => toggleAccordion(faq.slug)}
                        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-neutral-50/60 transition-colors min-h-[50px] group cursor-pointer"
                      >
                        <div className="space-y-1 pr-2">
                          <span className="font-serif text-sm sm:text-base font-bold text-neutral-900 group-hover:text-primary-900 transition-colors block leading-snug">
                            {faq.question}
                          </span>
                          <span className="inline-block font-mono text-[10px] text-accent-700 bg-accent-50/80 px-2 py-0.5 rounded uppercase tracking-wider font-semibold border border-accent-200/50">
                            {faq.group}
                          </span>
                        </div>

                        <ChevronDown
                          className={`w-5 h-5 text-neutral-400 group-hover:text-primary-800 transition-transform duration-300 transform-gpu shrink-0 mt-0.5 ${
                            isOpen ? 'rotate-180 text-primary-800' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {/* Accordion Body with smooth CSS Grid Animation */}
                      <div
                        id={`home-faq-panel-${faq.slug}`}
                        role="region"
                        aria-labelledby={`home-faq-btn-${faq.slug}`}
                        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 pb-5 pt-1 border-t border-surface-border/60 text-xs sm:text-sm text-neutral-600 leading-relaxed bg-white space-y-2.5">
                            <p>{faq.answer.replace(/TODO\(client[^)]*\)/g, '[Pending client confirmation]')}</p>
                            <div>
                              <Link
                                to={`/faq#${faq.slug}`}
                                className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary-800 hover:text-primary-900 link-underline"
                              >
                                <span>Deep-link to this question in full FAQ</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeFaqSection;
