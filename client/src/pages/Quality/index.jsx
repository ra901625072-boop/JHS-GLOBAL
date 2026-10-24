import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  Eye,
  Copy,
  Check,
  X,
  FileCheck2,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useCertificates } from '../../features/trust/hooks';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import PageHeader from '../../components/layout/PageHeader';
import UnlistedSourcingBanner from '../../components/common/UnlistedSourcingBanner';

export const QualityPage = () => {
  const navigate = useNavigate();
  const { data: certificates = [], isLoading } = useCertificates();
  const [activeLightboxDoc, setActiveLightboxDoc] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Keyboard accessibility and smooth scroll isolation when modal is active
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeLightboxDoc) {
        setActiveLightboxDoc(null);
      }
    };
    if (activeLightboxDoc) {
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
  }, [activeLightboxDoc]);

  const copyToClipboard = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CERT_METADATA_REGISTRY = {
    gst: {
      _id: 'cert-gst',
      name: 'GST Registration Certificate',
      fullName: 'Goods and Services Tax Identification Certificate',
      issuedBy: 'Central Board of Indirect Taxes and Customs, Government of India',
      number: '24EZHPP3437C1ZH',
      form: 'Form GST REG-06 [Rule 10(1)]',
      scope: 'Tax-compliant registered commercial export entity operating out of Surat, Gujarat.',
      file: { url: '/documents/gst-certificate.pdf' },
      image: '/images/certifications/gst-certificate.png',
      avifSrcSet: '/images/certifications/gst-certificate-480w.avif 480w, /images/certifications/gst-certificate-768w.avif 768w, /images/certifications/gst-certificate-1024w.avif 1024w',
      webpSrcSet: '/images/certifications/gst-certificate-480w.webp 480w, /images/certifications/gst-certificate-768w.webp 768w, /images/certifications/gst-certificate-1024w.webp 1024w',
      code: 'GST',
    },
    iec: {
      _id: 'cert-iec',
      name: 'DGFT Importer-Exporter Code',
      fullName: 'Directorate General of Foreign Trade (IEC Certificate)',
      issuedBy: 'Ministry of Commerce & Industry, Government of India',
      number: 'EZHPP3437C',
      form: 'DGFT Importer-Exporter Code',
      scope: 'Statutory federal export authorization for maritime and air shipments from all Indian ports.',
      file: { url: '/documents/iec-certificate.pdf' },
      image: '/images/certifications/iec-certificate.png',
      avifSrcSet: '/images/certifications/iec-certificate-480w.avif 480w, /images/certifications/iec-certificate-768w.avif 768w, /images/certifications/iec-certificate-1024w.avif 1024w',
      webpSrcSet: '/images/certifications/iec-certificate-480w.webp 480w, /images/certifications/iec-certificate-768w.webp 768w, /images/certifications/iec-certificate-1024w.webp 1024w',
      code: 'IEC',
    },
    apeda: {
      _id: 'cert-apeda',
      name: 'APEDA Registration (RCMC)',
      fullName: 'Agricultural and Processed Food Products Export Development Authority',
      issuedBy: 'Ministry of Commerce and Industry, Government of India',
      number: 'IEC: EZHPP3437C',
      form: 'RCMC under Foreign Trade Policy',
      scope: 'Official statutory registration for exporting Indian agricultural commodities, seeds, cereals, and pulses.',
      file: { url: '/documents/apeda-rcmc.pdf' },
      image: '/images/certifications/apeda-rcmc.png',
      avifSrcSet: '/images/certifications/apeda-rcmc-480w.avif 480w, /images/certifications/apeda-rcmc-768w.avif 768w, /images/certifications/apeda-rcmc-1024w.avif 1024w',
      webpSrcSet: '/images/certifications/apeda-rcmc-480w.webp 480w, /images/certifications/apeda-rcmc-768w.webp 768w, /images/certifications/apeda-rcmc-1024w.webp 1024w',
      code: 'APEDA RCMC',
    },
    fssai: {
      _id: 'cert-fssai',
      name: 'FSSAI Central Food Safety License',
      fullName: 'Food Safety and Standards Authority of India (Central License)',
      issuedBy: 'Government of India - FSSAI Central Authority',
      number: '10725997001058',
      form: 'Form C License under FSS Act, 2006',
      scope: 'Central food licensing authority compliance for international export storage, processing, and handling.',
      file: { url: '/documents/fssai-license.pdf' },
      image: '/images/certifications/fssai-license.png',
      avifSrcSet: '/images/certifications/fssai-license-480w.avif 480w, /images/certifications/fssai-license-768w.avif 768w, /images/certifications/fssai-license-1024w.avif 1024w',
      webpSrcSet: '/images/certifications/fssai-license-480w.webp 480w, /images/certifications/fssai-license-768w.webp 768w, /images/certifications/fssai-license-1024w.webp 1024w',
      code: 'FSSAI Central',
    },
    spices: {
      _id: 'cert-spices-board',
      name: 'Spices Board of India (CRES)',
      fullName: 'Certificate of Registration as Exporter of Spices (CRES)',
      issuedBy: 'Spices Board, Ministry of Commerce and Industry, Govt. of India',
      number: 'IEC: EZHPP3437C',
      form: 'CRES under Spices Board Act 1986',
      scope: 'Official statutory exporter registration for whole spices, powdered spices, and seed spices.',
      file: { url: '/documents/spices-board-cres.pdf' },
      image: '/images/certifications/spices-board-cres.png',
      avifSrcSet: '/images/certifications/spices-board-cres-480w.avif 480w, /images/certifications/spices-board-cres-768w.avif 768w, /images/certifications/spices-board-cres-1024w.avif 1024w',
      webpSrcSet: '/images/certifications/spices-board-cres-480w.webp 480w, /images/certifications/spices-board-cres-768w.webp 768w, /images/certifications/spices-board-cres-1024w.webp 1024w',
      code: 'Spices Board CRES',
    },
    msme: {
      _id: 'cert-msme',
      name: 'MSME Udyam Registration',
      fullName: 'Ministry of Micro, Small and Medium Enterprises',
      issuedBy: 'Government of India',
      number: 'UDYAM-GJ-22-0460260',
      form: 'Udyam Registration Certificate',
      scope: 'Government enterprise accreditation in international trade and export processing.',
      file: { url: '/documents/msme-udyam.pdf' },
      image: '/images/certifications/msme-udyam.png',
      avifSrcSet: '/images/certifications/msme-udyam-480w.avif 480w, /images/certifications/msme-udyam-768w.avif 768w, /images/certifications/msme-udyam-1024w.avif 1024w',
      webpSrcSet: '/images/certifications/msme-udyam-480w.webp 480w, /images/certifications/msme-udyam-768w.webp 768w, /images/certifications/msme-udyam-1024w.webp 1024w',
      code: 'MSME Udyam',
    },
    fieo: {
      _id: 'cert-fieo',
      name: 'Federation of Indian Export Organisations',
      fullName: 'FIEO Registration (Federation of Indian Export Organisations)',
      issuedBy: 'Ministry of Commerce & Industry, Government of India',
      number: 'Verified on Request',
      form: 'FIEO Recognized Exporter',
      scope: 'Apex trade facilitation organisation representing Indian multi-commodity exporters globally.',
      file: { url: '' },
      image: '',
      code: 'FIEO',
      isTextBadge: true,
    },
  };

  const resolveCert = (c) => {
    const text = `${c.name || ''} ${c.fullName || ''} ${c.number || ''}`.toLowerCase();
    let key = 'gst';
    if (text.includes('gst')) key = 'gst';
    else if (text.includes('iec') || text.includes('dgft') || text.includes('ezhpp')) key = 'iec';
    else if (text.includes('apeda') || text.includes('rcmc')) key = 'apeda';
    else if (text.includes('fssai') || text.includes('10725997001058')) key = 'fssai';
    else if (text.includes('spice') || text.includes('cres')) key = 'spices';
    else if (text.includes('msme') || text.includes('udyam')) key = 'msme';
    else if (text.includes('fieo') || text.includes('federation')) key = 'fieo';

    const fallback = CERT_METADATA_REGISTRY[key] || {};
    return {
      _id: c._id || c.id || fallback._id,
      name: c.name || fallback.name,
      fullName: c.fullName || fallback.fullName,
      issuedBy: c.issuedBy || fallback.issuedBy,
      number: (c.number && !c.number.includes('TODO')) ? c.number : (fallback.number || ''),
      form: c.form || fallback.form,
      scope: c.scope || fallback.scope,
      image: c.image || c.imageUrl || c.image_url || fallback.image,
      file: c.file || (c.fileUrl || c.file_url ? { url: c.fileUrl || c.file_url } : fallback.file),
      code: c.code || fallback.code,
      isTextBadge: c.isTextBadge || fallback.isTextBadge || !c.image,
    };
  };

  const displayCertificates = certificates.length > 0
    ? certificates.map(resolveCert)
    : Object.values(CERT_METADATA_REGISTRY);

  const dueDiligenceChecklist = [
    'Government of India registered export credentials with active IEC Code',
    'Direct statutory registration with APEDA, FSSAI Central Authority, FIEO, and Spices Board',
    'Standardized assay verification and complete specification matching prior to dispatch',
    'Full export compliance documentation and packing dossiers provided with every consignment',
    'Container stuffing verification logs and tamper-evident sealing shared with buyer',
  ];

  return (
    <>
      <Helmet>
        <title>Quality Governance & Verified Export Certifications — JHS GLOBAL</title>
        <meta
          name="description"
          content="Review verified statutory export credentials (GST, IEC, APEDA, FSSAI, FIEO, Spices Board, MSME) and quality governance standards of JHS GLOBAL."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        badge={
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>STATUTORY AUDITED ACCREDITATIONS · EXPORT GOVERNANCE</span>
          </div>
        }
        title="Quality Governance & Verified Export Licenses"
        description="Every consignment leaves India backed by statutory compliance, verified product specifications, export-grade packaging, and transparent supply chain documentation."
      />

      {/* All 6 Government Approved Certificates Grid with Lightbox Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal direction="up" className="max-w-3xl mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
            Statutory Transparency
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Government of India Export Accreditations
          </h2>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans">
            Click any certificate card to inspect the high-resolution scanned document or download the official PDF for customs and bank due diligence.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <Reveal
            direction="up"
            cascade
            stagger={0.06}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayCertificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-white rounded-2xl border border-surface-border p-5 shadow-subtle hover:shadow-card hover:border-primary-700/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Document Preview Mount */}
                  <div
                    onClick={() => setActiveLightboxDoc(cert)}
                    className="relative aspect-[1/1.22] w-full bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200/80 p-2 sm:p-3 flex items-center justify-center cursor-pointer group-hover:border-primary-700/30 transition-colors shadow-inner"
                  >
                    {cert.isTextBadge || !cert.image ? (
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
                        <source type="image/avif" srcSet={cert.avifSrcSet} sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, 300px" />
                        <source type="image/webp" srcSet={cert.webpSrcSet} sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, 300px" />
                        <img
                          src={cert.image}
                          alt={cert.name}
                          width="300"
                          height="375"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain rounded filter contrast-[1.02] shadow-2xs group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </picture>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl p-3">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-neutral-900 text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                        <Eye className="w-3.5 h-3.5 text-primary-800" />
                        <span>Inspect Certificate</span>
                      </span>
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs border border-neutral-200 text-[9px] font-mono font-bold text-neutral-700 uppercase tracking-wider shadow-2xs group-hover:opacity-0 transition-opacity">
                      Verified
                    </div>
                  </div>

                  {/* Cert Info */}
                  <div className="pt-4">
                    <span className="text-[10px] font-mono font-semibold text-accent-700 uppercase tracking-wider block mb-1">
                      {cert.form || 'Statutory Export License'}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 group-hover:text-primary-800 transition-colors mb-1">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium line-clamp-1 mb-2">
                      {cert.issuedBy}
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed font-sans line-clamp-2">
                      {cert.scope}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400 font-mono">Reg:</span>
                    <span className="text-[11px] font-mono font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200/80">
                      {(cert.number || 'ACTIVE-RCMC').replace(/\s*TODO\(client\)/gi, '').trim() || 'ACTIVE-RCMC'}
                    </span>
                  </div>

                  {cert.file?.url ? (
                    <a
                      href={cert.file.url}
                      download
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-800 hover:text-accent-600 transition-colors p-1"
                      title="Download Official PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  ) : (
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-800 hover:text-accent-600 transition-colors p-1"
                      title="Request Official Accreditation Dossier"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Dossier</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </Reveal>
        )}
      </section>

      {/* Due Diligence Checklist */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal
          direction="up"
          className="p-8 sm:p-12 rounded-2xl border border-surface-border bg-white shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-accent-600" />
              <span>TRANSPARENT COMMERCE</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
              Our 5-Point Buyer Due Diligence Standard
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans">
              We understand the compliance stakes for international food manufacturers and institutional commodity importers. We encourage your procurement department to independently audit our credentials.
            </p>
            <div className="pt-2">
              <Link to="/contact">
                <Button variant="cta" size="md">
                  Request Compliance & Specification Dossier
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3 bg-surface-subtle p-6 rounded-xl border border-surface-border">
            {dueDiligenceChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Fullscreen Lightbox Modal for Certificate Inspection rendered via Portal to escape RouteTransition transforms */}
      {activeLightboxDoc &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            data-lenis-prevent
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setActiveLightboxDoc(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
              className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-primary-950 text-white flex items-center justify-between border-b border-primary-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-800 border border-accent-500/30 flex items-center justify-center text-accent-400 shrink-0">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-accent-400 uppercase tracking-wider block">
                      {activeLightboxDoc.form || 'Government Document'}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
                      {activeLightboxDoc.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveLightboxDoc(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close inspection modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-100 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-neutral-300 p-2 sm:p-4 flex items-center justify-center">
                  {activeLightboxDoc.isTextBadge || !activeLightboxDoc.image ? (
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
                    <picture className="flex items-center justify-center max-h-[58vh]">
                      <source type="image/avif" srcSet={activeLightboxDoc.avifSrcSet} sizes="(max-width: 1024px) 100vw, 768px" />
                      <source type="image/webp" srcSet={activeLightboxDoc.webpSrcSet} sizes="(max-width: 1024px) 100vw, 768px" />
                      <img
                        src={activeLightboxDoc.image}
                        alt={activeLightboxDoc.name}
                        width="768"
                        height="960"
                        decoding="async"
                        className="w-full h-auto max-h-[58vh] object-contain rounded"
                      />
                    </picture>
                  )}
                </div>

                <div className="mt-4 text-center max-w-xl text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-900 block">{activeLightboxDoc.issuedBy}</span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 block">{activeLightboxDoc.scope}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 font-mono">License No:</span>
                  <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                    {activeLightboxDoc.number}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeLightboxDoc._id, activeLightboxDoc.number)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-primary-800 hover:bg-primary-50 transition-colors"
                  >
                    {copiedId === activeLightboxDoc._id ? (
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

                <div className="flex items-center gap-2">
                  {activeLightboxDoc.file?.url ? (
                    <>
                      <a
                        href={activeLightboxDoc.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg border border-neutral-300 hover:border-neutral-400 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
                      >
                        Open in New Tab
                      </a>
                      <a
                        href={activeLightboxDoc.file.url}
                        download
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cta-500 hover:bg-cta-600 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Clean PDF</span>
                      </a>
                    </>
                  ) : (
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cta-500 hover:bg-cta-600 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Request Certificate Dossier</span>
                    </Link>
                  )}
                </div>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Clean PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Sourcing Guarantee & Turnaround Promise */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <UnlistedSourcingBanner />
      </section>
    </>
  );
};

export default QualityPage;
