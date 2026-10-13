import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageCircle,
  FileQuestion,
  X,
} from 'lucide-react';
import { useFaqs } from '../../features/trust/hooks';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/layout/PageHeader';
import Reveal from '../../components/ui/Reveal';

export const FaqPage = () => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [openFaqId, setOpenFaqId] = useState(null);

  const { data: faqs = [], isLoading } = useFaqs(selectedGroup);

  const groups = [
    'MOQ & Ordering',
    'Payment & Banking',
    'Shipping & Incoterms',
    'Quality & Testing',
    'Private Label OEM',
  ];

  const filteredFaqs = faqs.filter((f) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term);
  });

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+919876543210';

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions (B2B Procurement FAQ) — Export B2B</title>
        <meta
          name="description"
          content="Answers to international importer questions regarding Minimum Order Quantities (MOQ), commercial banking terms (TT/LC), Incoterms 2020, and lab testing COA."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        eyebrow="Buyer Procurement Knowledge Base"
        title="Frequently Asked Questions (B2B FAQ)"
        description="Transparent answers regarding container ordering policies, commercial LC banking, shipping documentation, and laboratory quality testing."
      />

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        {/* Search and Group Filter Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by keyword (e.g. MOQ, payment, LC, samples, inspection)..."
              className="w-full pl-11 pr-10 py-3.5 text-xs sm:text-sm rounded-xl border border-surface-border bg-white shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setSelectedGroup('')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${
                !selectedGroup
                  ? 'bg-primary-800 text-white shadow-subtle'
                  : 'bg-white border border-surface-border text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              All Topics
            </button>
            {groups.map((grp) => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${
                  selectedGroup === grp
                    ? 'bg-primary-800 text-white shadow-subtle'
                    : 'bg-white border border-surface-border text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-12 text-center border border-surface-border rounded-xl bg-surface-card">
            <FileQuestion className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-neutral-800">No matching questions found</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Have a unique procurement question? Contact our export desk directly.
            </p>
          </div>
        ) : (
          <Reveal direction="up" cascade stagger={0.04} className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq._id;
              return (
                <div
                  key={faq._id}
                  className="rounded-xl border border-surface-border bg-surface-card overflow-hidden shadow-subtle hover:border-accent-500/30 transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq._id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors min-h-[44px]"
                  >
                    <span className="font-serif text-base font-bold text-neutral-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary-800' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-surface-border/60 text-xs sm:text-sm text-neutral-600 leading-relaxed bg-surface-canvas/50">
                      <p>{faq.answer}</p>
                      <span className="inline-block mt-3 font-mono text-[10px] text-accent-600 uppercase tracking-wider font-semibold">
                        Topic: {faq.group}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </Reveal>
        )}

        {/* Still Have Questions Card */}
        <div className="p-8 rounded-2xl bg-surface-subtle border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-neutral-900">
              Have a specific procurement requirement?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Connect directly with our export director on WhatsApp or submit a formal specification request.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-semibold inline-flex items-center gap-2 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask via WhatsApp</span>
            </a>
            <Link to="/contact">
              <Button variant="cta" size="md">
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
