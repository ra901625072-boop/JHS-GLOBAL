import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  Anchor,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import QuoteForm from '../../components/rfq/QuoteForm';
import PageHeader from '../../components/layout/PageHeader';
import Reveal from '../../components/ui/Reveal';
import WhatsAppIcon from '../../components/common/WhatsAppIcon';
import UnlistedSourcingBanner from '../../components/common/UnlistedSourcingBanner';
import { useFeaturedFaqs } from '../../features/trust/hooks';

export const ContactPage = () => {
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const { data: dynamicFaqs } = useFeaturedFaqs();

  const tradeFaqs = [
    {
      q: 'What is your standard Minimum Order Quantity (MOQ)?',
      a: 'For bulk raw materials and animal feed, our standard MOQ is one 20ft Full Container Load (FCL, approx. 18–26 Metric Tonnes depending on density). For high-potency nutraceutical and botanical extracts, we accommodate LCL trial orders starting from 250 kg to 1,000 kg.',
    },
    {
      q: 'What payment and commercial terms do you accept?',
      a: 'We work primarily with Irrevocable Letter of Credit at Sight (LC at Sight) through prime international banks, or standard Telegraphic Transfer terms (30% Advance deposit, balance 70% against transmission of clean Bill of Lading scan).',
    },
    {
      q: 'How fast can you dispatch pre-shipment lot samples?',
      a: 'Pre-shipment analytical samples (250g–500g) are dispatched within 24 to 48 hours via express DHL/FedEx courier accompanied by the manufacturer Certificate of Analysis (COA) and MSDS.',
    },
    {
      q: 'Which ports of loading are utilized for container stuffing?',
      a: 'Our primary maritime export gate is Hazira Deep-Water Port (Surat, 25km from our logistics yard) and Mundra Port (Gujarat), providing direct container liner services to GCC, Europe, and the Americas.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Request a Formal Quote (RFQ) & Contact Trade Desk — {brandName}</title>
        <meta
          name="description"
          content="Submit formal B2B request for quotation for Personal Care Raw Materials, Nutraceutical Ingredients, and Animal Feed. Binding proforma quotation issued within 48 business hours by JHS GLOBAL."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        badge={
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>GUARANTEED 48-HOUR PROFORMA QUOTATION TURNAROUND</span>
          </div>
        }
        title="Request a Binding Commercial Quotation"
        description="Provide your target commodity tonnage (MT / FCL), packaging specifications, and destination discharge port. Our international trade desk prepares your customized proforma offer and laboratory COA pack."
      />

      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Export Desk & Due Diligence Checklist (Sticky Sidebar) */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <div className="lg:sticky lg:top-28 xl:top-32 space-y-4 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto no-scrollbar">
              {/* Direct Desk Card */}
              <div className="p-5 sm:p-6 rounded-2xl border border-surface-border bg-white space-y-4 shadow-card hover:shadow-hover transition-shadow duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold block">
                      Direct Export Desk
                    </span>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 leading-tight mt-0.5">
                      International Trade Desk
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-neutral-600">
                  {/* Export Registered Office */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-center shrink-0 text-accent-600 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                        Export Registered Office
                      </span>
                      <p className="text-xs text-neutral-700 leading-snug font-medium mt-0.5">
                        401, Shyam-A, Vatsalya Villa Residency, Amroli, Surat, Gujarat - 394107, India
                      </p>
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-neutral-600 font-mono bg-neutral-100/80 px-2 py-0.5 rounded border border-neutral-200/60">
                        <Anchor className="w-3 h-3 text-accent-600 shrink-0" />
                        <span>Hazira (25km) & Mundra Ports</span>
                      </div>
                    </div>
                  </div>

                  {/* Export Desk Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-center shrink-0 text-accent-600 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                        Export Desk Email
                      </span>
                      <a
                        href="mailto:info.jhsglobal@gmail.com"
                        className="text-xs sm:text-sm font-semibold text-primary-900 hover:text-accent-600 hover:underline transition-colors block mt-0.5 truncate"
                      >
                        info.jhsglobal@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Direct Telephone */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-center shrink-0 text-accent-600 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                        Direct Telephone / Trade Desk
                      </span>
                      <div className="flex flex-col gap-0.5 mt-0.5 text-xs">
                        <a href="tel:+917202907720" className="font-semibold text-neutral-900 hover:text-accent-600 transition-colors flex items-center justify-between">
                          <span>+91 72029 07720</span>
                          <span className="text-[10px] text-neutral-500 font-normal">Trade & RFQ</span>
                        </a>
                        <a href="tel:+919724640101" className="font-medium text-neutral-700 hover:text-accent-600 transition-colors flex items-center justify-between">
                          <span>+91 97246 40101</span>
                          <span className="text-[10px] text-neutral-500 font-normal">Logistics</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-border">
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello JHS GLOBAL team, I would like to inquire about container export pricing for commodities.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all min-h-[42px] shadow-sm"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Instant WhatsApp Trade Desk</span>
                  </a>
                </div>
              </div>

              {/* Statutory Credentials Card (2x2 Evenly Divided Matrix) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#071B10] to-[#0A2619] text-white space-y-3 shadow-card border border-primary-800/80">
                <div className="flex items-center justify-between pb-2.5 border-b border-primary-800/60">
                  <div className="flex items-center gap-2 text-accent-400 text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Statutory Credentials</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-medium">
                    Govt. Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">DGFT IEC</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs tracking-tight mt-1">EZHPP3437C</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">GSTIN</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs tracking-tight mt-1" title="24EZHPP3437C1ZH">24EZHPP3437C1ZH</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">FSSAI Central</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs tracking-tight mt-1">10725997001058</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">MSME Udyam</span>
                    <span className="font-mono font-bold text-white text-[10px] sm:text-[11px] tracking-tighter mt-1" title="UDYAM-GJ-22-0460260">UDYAM-GJ-22-0460260</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Functional RFQ Form (First on Mobile) */}
          <div id="rfq-form-card" className="order-1 lg:order-2 lg:col-span-8 p-6 sm:p-10 rounded-2xl border border-surface-border bg-white shadow-card scroll-mt-24">
            <QuoteForm />
          </div>
        </Reveal>

        {/* Quick Trade FAQs Accordion */}
        <section className="bg-surface-subtle p-8 sm:p-12 rounded-2xl border border-surface-border">
          <Reveal direction="up" className="max-w-3xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-1">
              Procurement Guidance
            </span>
            <h3 className="font-serif text-2xl font-bold text-neutral-900">
              Frequently Asked Sourcing Questions
            </h3>
          </Reveal>

          <div className="space-y-3 max-w-4xl">
            {(Array.isArray(dynamicFaqs) && dynamicFaqs.length > 0
              ? dynamicFaqs.slice(0, 4).map((f) => ({ q: f.question, a: f.answer }))
              : tradeFaqs
            ).map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-surface-border bg-white overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif text-sm sm:text-base font-bold text-neutral-900 hover:text-primary-800 transition-colors"
                  aria-expanded={openFaqIndex === idx}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180 text-primary-800' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans border-t border-neutral-100 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sourcing Guarantee & Turnaround Promise */}
        <UnlistedSourcingBanner />
      </div>
    </>
  );
};

export default ContactPage;
