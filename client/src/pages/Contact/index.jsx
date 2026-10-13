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

export const ContactPage = () => {
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const tradeFaqs = [
    {
      q: 'What is your standard Minimum Order Quantity (MOQ)?',
      a: 'For bulk agricultural commodities, grains, and animal feed, our standard MOQ is one 20ft Full Container Load (FCL, approx. 18–26 Metric Tonnes depending on density). For high-value spices, essential oils, and botanical extracts, we accommodate LCL trial orders starting from 250 kg to 1,000 kg.',
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
          content="Submit formal B2B request for quotation for Indian agro commodities, spices, and ingredients. Binding proforma quotation issued within 48 business hours by JHS GLOBAL."
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
          {/* Left Column: Direct Export Desk & Due Diligence Checklist */}
          <div className="order-2 lg:order-1 lg:col-span-4 space-y-6">
            {/* Direct Desk Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-surface-border bg-white space-y-5 shadow-card hover:shadow-hover transition-shadow duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  International Trade Desk
                </h3>
                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Online
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-neutral-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-neutral-900">Export Registered Office:</span>
                    <span className="leading-relaxed text-neutral-700">
                      401, Shyam-A, Vatsalya Villa Residency, Amroli, Surat, Gujarat - 394107, India
                    </span>
                    <span className="block text-[11px] text-neutral-500 mt-1 font-mono">
                      Loading Ports: Hazira (Surat, 25km) & Mundra, Gujarat
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-neutral-900">Export Desk Email:</span>
                    <a href="mailto:info.jhsglobal@gmail.com" className="text-primary-900 font-semibold hover:underline">
                      info.jhsglobal@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-semibold text-neutral-900">Direct Telephone / Trade Desk:</span>
                    <div className="flex flex-col gap-1 mt-0.5 font-medium">
                      <a href="tel:+917202907720" className="text-primary-900 hover:underline">
                        +91 72029 07720 (General Trade & RFQ)
                      </a>
                      <a href="tel:+919724640101" className="text-primary-900 hover:underline">
                        +91 97246 40101 (Logistics & Accounts)
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-border">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello JHS GLOBAL team, I would like to inquire about container export pricing for commodities.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-all min-h-[44px] shadow-sm"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Instant WhatsApp Trade Desk</span>
                </a>
              </div>
            </div>

            {/* "Verify Before You Commit" Checklist */}
            <div className="p-6 sm:p-8 rounded-2xl bg-primary-950 text-white space-y-4 shadow-card border border-primary-800">
              <div className="flex items-center gap-2 text-accent-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Credentials</span>
              </div>
              <h4 className="font-serif text-base font-bold text-white">
                Government Verified Registration
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-300 font-sans">
                <li className="flex items-start justify-between gap-2 pb-1.5 border-b border-primary-800/80">
                  <span className="text-neutral-400">DGFT IEC:</span>
                  <span className="font-mono font-bold text-white">EZHPP3437C</span>
                </li>
                <li className="flex items-start justify-between gap-2 pb-1.5 border-b border-primary-800/80">
                  <span className="text-neutral-400">GSTIN:</span>
                  <span className="font-mono font-bold text-white">24EZHPP3437C1ZH</span>
                </li>
                <li className="flex items-start justify-between gap-2 pb-1.5 border-b border-primary-800/80">
                  <span className="text-neutral-400">FSSAI Central:</span>
                  <span className="font-mono font-bold text-white">10725997001058</span>
                </li>
                <li className="flex items-start justify-between gap-2">
                  <span className="text-neutral-400">MSME Udyam:</span>
                  <span className="font-mono font-bold text-white">UDYAM-GJ-22-0460260</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Full Functional RFQ Form (First on Mobile) */}
          <div className="order-1 lg:order-2 lg:col-span-8 p-6 sm:p-10 rounded-2xl border border-surface-border bg-white shadow-card">
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
            {tradeFaqs.map((faq, idx) => (
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
