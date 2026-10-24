import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
  FileCheck2,
  FileText,
  ArrowRight,
  Award,
  Layers,
} from 'lucide-react';
import Reveal from '../ui/Reveal';

export const GOV_DOCUMENTS = [
  {
    id: 'gst',
    code: 'GST',
    title: 'Goods & Services Tax registration',
    authority: 'Central Board of Indirect Taxes and Customs, Government of India',
    regNumber: '24EZHPP3437C1ZH',
    form: 'Form GST REG-06 [Rule 10(1)]',
    image: '/images/certifications/gst-certificate.png',
    avifSrcSet: '/images/certifications/gst-certificate-480w.avif 480w, /images/certifications/gst-certificate-768w.avif 768w, /images/certifications/gst-certificate-1024w.avif 1024w',
    webpSrcSet: '/images/certifications/gst-certificate-480w.webp 480w, /images/certifications/gst-certificate-768w.webp 768w, /images/certifications/gst-certificate-1024w.webp 1024w',
    pdf: '/documents/gst-certificate.pdf',
    scope: 'Federal tax compliance, legal commercial export establishment in Surat, Gujarat.',
    isPrimary: true,
  },
  {
    id: 'iec',
    code: 'IEC',
    title: 'Import Export Code — DGFT',
    authority: 'Directorate General of Foreign Trade, Ministry of Commerce and Industry',
    regNumber: 'EZHPP3437C',
    form: 'DGFT Importer-Exporter Code',
    image: '/images/certifications/iec-certificate.png',
    avifSrcSet: '/images/certifications/iec-certificate-480w.avif 480w, /images/certifications/iec-certificate-768w.avif 768w, /images/certifications/iec-certificate-1024w.avif 1024w',
    webpSrcSet: '/images/certifications/iec-certificate-480w.webp 480w, /images/certifications/iec-certificate-768w.webp 768w, /images/certifications/iec-certificate-1024w.webp 1024w',
    pdf: '/documents/iec-certificate.pdf',
    scope: 'Statutory federal export authorization for customs clearance at all Indian ports.',
    isPrimary: true,
  },
  {
    id: 'apeda',
    code: 'APEDA RCMC',
    title: 'APEDA Registration-Cum-Membership Certificate',
    authority: 'Agricultural & Processed Food Products Export Development Authority',
    regNumber: 'IEC: EZHPP3437C',
    form: 'RCMC under Foreign Trade Policy',
    image: '/images/certifications/apeda-rcmc.png',
    avifSrcSet: '/images/certifications/apeda-rcmc-480w.avif 480w, /images/certifications/apeda-rcmc-768w.avif 768w, /images/certifications/apeda-rcmc-1024w.avif 1024w',
    webpSrcSet: '/images/certifications/apeda-rcmc-480w.webp 480w, /images/certifications/apeda-rcmc-768w.webp 768w, /images/certifications/apeda-rcmc-1024w.webp 1024w',
    pdf: '/documents/apeda-rcmc.pdf',
    scope: 'Official statutory registration for exporting Indian agricultural commodities, seeds, and foods.',
    isPrimary: true,
  },
  {
    id: 'fssai',
    code: 'FSSAI',
    title: 'Food Safety & Standards Authority',
    authority: 'Food Safety and Standards Authority of India (Central Authority)',
    regNumber: '10725997001058',
    form: 'Form C License under FSS Act, 2006',
    image: '/images/certifications/fssai-license.png',
    avifSrcSet: '/images/certifications/fssai-license-480w.avif 480w, /images/certifications/fssai-license-768w.avif 768w, /images/certifications/fssai-license-1024w.avif 1024w',
    webpSrcSet: '/images/certifications/fssai-license-480w.webp 480w, /images/certifications/fssai-license-768w.webp 768w, /images/certifications/fssai-license-1024w.webp 1024w',
    pdf: '/documents/fssai-license.pdf',
    scope: 'Central food licensing compliance for international food storage, handling, and export.',
    isPrimary: true,
  },
  {
    id: 'spices-board',
    code: 'SPICES BOARD',
    title: 'Certificate of Registration as Exporter of Spices (CRES)',
    authority: 'Spices Board of India, Ministry of Commerce & Industry, Govt. of India',
    regNumber: 'IEC: EZHPP3437C',
    form: 'CRES under Spices Board Act 1986',
    image: '/images/certifications/spices-board-cres.png',
    avifSrcSet: '/images/certifications/spices-board-cres-480w.avif 480w, /images/certifications/spices-board-cres-768w.avif 768w, /images/certifications/spices-board-cres-1024w.avif 1024w',
    webpSrcSet: '/images/certifications/spices-board-cres-480w.webp 480w, /images/certifications/spices-board-cres-768w.webp 768w, /images/certifications/spices-board-cres-1024w.webp 1024w',
    pdf: '/documents/spices-board-cres.pdf',
    scope: 'Statutory registration for bulk and retail export of Indian whole spices and spice powders.',
    isPrimary: false,
  },
  {
    id: 'msme',
    code: 'MSME UDYAM',
    title: 'Ministry of Micro, Small & Medium Enterprises',
    authority: 'Ministry of Micro, Small and Medium Enterprises, Government of India',
    regNumber: 'UDYAM-GJ-22-0460260',
    form: 'Udyam Registration Certificate',
    image: '/images/certifications/msme-udyam.png',
    avifSrcSet: '/images/certifications/msme-udyam-480w.avif 480w, /images/certifications/msme-udyam-768w.avif 768w, /images/certifications/msme-udyam-1024w.avif 1024w',
    webpSrcSet: '/images/certifications/msme-udyam-480w.webp 480w, /images/certifications/msme-udyam-768w.webp 768w, /images/certifications/msme-udyam-1024w.webp 1024w',
    pdf: '/documents/msme-udyam.pdf',
    scope: 'Government enterprise accreditation for trading and export operations.',
    isPrimary: false,
  },
  {
    id: 'fieo',
    code: 'FIEO',
    title: 'Federation of Indian Export Organisations',
    authority: 'Set up by Ministry of Commerce, Government of India',
    regNumber: 'Verified on Request',
    form: 'FIEO Recognized Exporter',
    image: '',
    avifSrcSet: '',
    webpSrcSet: '',
    pdf: '',
    scope: 'Apex trade facilitation organisation set up by Ministry of Commerce, Govt. of India, representing Indian multi-commodity exporters globally.',
    isPrimary: false,
    isTextBadge: true,
  },
];

export const GovCertificationsSection = () => {
  const [activeModalDoc, setActiveModalDoc] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showAllDocs, setShowAllDocs] = useState(false);

  // Keyboard accessibility for modal: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModalDoc) {
        setActiveModalDoc(null);
      }
    };
    if (activeModalDoc) {
      document.body.style.overflow = 'hidden';
      if (window.__lenis) {
        window.__lenis.stop();
      }
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      if (window.__lenis) {
        window.__lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (window.__lenis) {
        window.__lenis.start();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModalDoc]);

  const handleCopyNumber = (doc) => {
    navigator.clipboard.writeText(doc.regNumber);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedDocs = showAllDocs
    ? GOV_DOCUMENTS
    : GOV_DOCUMENTS.filter((d) => d.isPrimary);

  return (
    <section
      id="certifications-documents"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F9FAF9] border-y border-surface-border relative select-none scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>STATUTORY AUDITED CREDENTIALS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-neutral-900 tracking-tight leading-tight">
            Our certifications & export documents
          </h2>

          <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Fully registered and audited. Certificate copies are shared with every
            quotation and travel with every shipment — so your customs clearance is
            never held up.
          </p>

          {/* Toggle pill: Core 4 vs All 6 */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-neutral-200/60 border border-neutral-300/60">
            <button
              type="button"
              onClick={() => setShowAllDocs(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                !showAllDocs
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Primary Export Documents (4)
            </button>
            <button
              type="button"
              onClick={() => setShowAllDocs(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                showAllDocs
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Statutory Accreditations ({GOV_DOCUMENTS.length})
            </button>
          </div>
        </Reveal>

        {/* 4-Card Document Grid matching user screenshot */}
        <div
          className={`grid gap-6 ${
            showAllDocs
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {displayedDocs.map((doc, index) => (
            <Reveal
              key={doc.id}
              direction="up"
              delay={index * 0.08}
              className="h-full"
            >
              <div
                onClick={() => setActiveModalDoc(doc)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveModalDoc(doc);
                  }
                }}
                aria-label={`Inspect ${doc.code} certificate`}
                className="group relative h-full bg-white rounded-2xl border border-neutral-200/90 p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-800"
              >
                {/* Document Thumbnail Paper Mount */}
                <div className="relative aspect-[1/1.25] sm:aspect-[1/1.22] w-full bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200/70 p-2 sm:p-2.5 flex items-center justify-center shadow-inner group-hover:border-primary-700/30 transition-colors">
                  {doc.isTextBadge || !doc.image ? (
                    <div className="w-full h-full bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/70 rounded-lg border border-amber-200/70 p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-inner group-hover:border-primary-700/40 transition-colors">
                      <div className="w-11 h-11 rounded-full bg-amber-100/90 border border-amber-300 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                        <Award className="w-5 h-5 text-amber-800" />
                      </div>
                      <span className="font-serif font-bold text-xs sm:text-sm text-neutral-900 tracking-tight leading-snug">
                        Federation of Indian Export Organisations
                      </span>
                      <span className="text-[10px] text-amber-800 font-medium uppercase tracking-wider mt-1.5">
                        Ministry of Commerce · Govt. of India
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono mt-2 bg-white px-2 py-0.5 rounded border border-neutral-200 shadow-2xs">
                        Official Text Badge
                      </span>
                    </div>
                  ) : (
                    <picture className="w-full h-full flex items-center justify-center">
                      <source type="image/avif" srcSet={doc.avifSrcSet} sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, 300px" />
                      <source type="image/webp" srcSet={doc.webpSrcSet} sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, 300px" />
                      <img
                        src={doc.image}
                        alt={`${doc.code} Government Document`}
                        width="300"
                        height="375"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain rounded filter contrast-[1.02] shadow-2xs group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </picture>
                  )}

                  {/* Interactive Hover Overlay with Inspect Pill */}
                  <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl p-3">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-neutral-900 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                      <Eye className="w-3.5 h-3.5 text-primary-800" />
                      <span>Inspect Document</span>
                    </span>
                  </div>

                  {/* Subtle top-right statutory badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs border border-neutral-200 text-[9px] font-mono font-bold text-neutral-700 uppercase tracking-wider shadow-2xs group-hover:opacity-0 transition-opacity">
                    Verified
                  </div>
                </div>

                {/* Document Info / Typography (strictly matching screenshot) */}
                <div className="pt-4 text-center flex-1 flex flex-col justify-end">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-primary-800 transition-colors duration-150 tracking-tight">
                    {doc.code}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600 font-medium leading-snug">
                    {doc.title}
                  </p>

                  <div className="mt-2.5 pt-2.5 border-t border-neutral-100 flex items-center justify-center gap-1.5">
                    <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                      Reg:
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/80">
                      {doc.regNumber}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Standards Link matching screenshot strictly */}
        <Reveal direction="up" className="mt-12 text-center">
          <Link
            to="/quality"
            className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-bold text-neutral-700 hover:text-primary-900 uppercase tracking-widest transition-colors duration-150 group"
          >
            <span>MORE CERTIFICATIONS ADDED AS OUR CAPABILITIES GROW</span>
            <span className="text-neutral-400">·</span>
            <span className="text-primary-800 group-hover:text-accent-600 inline-flex items-center gap-1 link-underline">
              SEE ALL STANDARDS
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </Reveal>
      </div>

      {/* Fullscreen Inspection Lightbox Modal rendered via Portal to escape RouteTransition transforms */}
      {activeModalDoc &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-doc-title"
            data-lenis-prevent
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-sm"
            onClick={() => setActiveModalDoc(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
              className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-popover-enter"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-primary-950 text-white flex items-center justify-between border-b border-primary-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-800 border border-accent-500/30 flex items-center justify-center text-accent-400 shrink-0">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent-400 uppercase tracking-wider">
                        {activeModalDoc.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                        Government Authenticated
                      </span>
                    </div>
                    <h3
                      id="modal-doc-title"
                      className="font-serif text-base sm:text-lg font-bold text-white tracking-tight"
                    >
                      {activeModalDoc.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalDoc(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close document inspection"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Two-column on desktop (Left: Scrollable high-res preview, Right: Inspection Dossier) */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 bg-neutral-50/70">
                {/* Document Preview Pane */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 p-3 sm:p-4 shadow-inner flex items-center justify-center overflow-hidden min-h-[300px]">
                  {activeModalDoc.isTextBadge || !activeModalDoc.image ? (
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/70 rounded-xl border border-amber-200/80 p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-inner">
                      <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mb-3 shadow-xs">
                        <Award className="w-8 h-8 text-amber-800" />
                      </div>
                      <span className="font-serif font-bold text-lg sm:text-xl text-neutral-900 tracking-tight">
                        Federation of Indian Export Organisations (FIEO)
                      </span>
                      <span className="text-xs text-amber-900 font-semibold uppercase tracking-wider mt-1.5">
                        Apex Trade Facilitation Organisation · Ministry of Commerce, Govt. of India
                      </span>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-3 max-w-md leading-relaxed font-sans">
                        Apex trade facilitation body set up by the Ministry of Commerce, Government of India, representing Indian multi-commodity exporters in global commerce. Official statutory registration certificate dossier is provided with commercial quotations and customs documentation.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Official Trade Organisation Registration</span>
                      </div>
                    </div>
                  ) : (
                    <picture className="flex items-center justify-center max-h-[62vh]">
                      <source type="image/avif" srcSet={activeModalDoc.avifSrcSet} sizes="(max-width: 1024px) 100vw, 768px" />
                      <source type="image/webp" srcSet={activeModalDoc.webpSrcSet} sizes="(max-width: 1024px) 100vw, 768px" />
                      <img
                        src={activeModalDoc.image}
                        alt={activeModalDoc.title}
                        width="768"
                        height="960"
                        decoding="async"
                        className="max-h-[62vh] w-auto object-contain rounded shadow-md"
                      />
                    </picture>
                  )}
                </div>

                {/* Legal & Regulatory Breakdown Pane */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                      <span className="text-[11px] uppercase font-bold text-neutral-500 tracking-wider block">
                        Issuing Statutory Authority
                      </span>
                      <p className="font-medium text-xs sm:text-sm text-neutral-900 mt-1">
                        {activeModalDoc.authority}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                      <span className="text-[11px] uppercase font-bold text-neutral-500 tracking-wider block">
                        Registration / License Number
                      </span>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-primary-900 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                          {activeModalDoc.regNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(activeModalDoc)}
                          className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Copy Registration Number"
                        >
                          {copiedId === activeModalDoc.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-2xs">
                      <span className="text-[11px] uppercase font-bold text-neutral-500 tracking-wider block">
                        Statutory Scope
                      </span>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {activeModalDoc.scope}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Original physical and digitally signed copies travel with every commercial
                        invoice, packing list, and bill of lading.
                      </span>
                    </div>
                  </div>

                  {/* Actions: View PDF / Download */}
                  <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row gap-3">
                    {activeModalDoc.pdf ? (
                      <>
                        <a
                          href={activeModalDoc.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Official PDF</span>
                        </a>
                        <a
                          href={activeModalDoc.pdf}
                          download
                          className="py-2.5 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </>
                    ) : (
                      <Link
                        to="/contact"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-primary-900 hover:bg-primary-950 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Request Official Accreditation Dossier</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default GovCertificationsSection;
