import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Anchor,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send,
  Boxes,
  Truck,
  Ship,
  Sparkles,
  Award,
  Layers,
  FileCheck2,
  Download,
  Check,
  CheckCircle,
  HelpCircle,
  Package,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import PageHeader from '../../components/layout/PageHeader';
import UnlistedSourcingBanner from '../../components/common/UnlistedSourcingBanner';

export const ExportProcessPage = () => {
  const navigate = useNavigate();
  const [selectedIncoterm, setSelectedIncoterm] = useState('FOB');

  // Complete 8-Step Export Journey from 10X Exports Reference
  const workflowSteps = [
    {
      step: '01',
      title: 'Quotation Issued & 48h Turnaround',
      headline: 'Commercial Inquiry & Technical Assessment',
      detail:
        'Submit commodity specifications, tonnage (MT / FCL), target shipment schedule, and discharge port. Our international trade desk issues a binding proforma quotation and current ocean freight breakdown within 48 business hours.',
      turnaround: 'Within 48 Hours',
      documents: ['Binding Commercial Offer', 'Product Technical Specification (TDS)', 'Ocean Freight Schedule'],
    },
    {
      step: '02',
      title: 'Official Documents Shared',
      headline: 'Proforma Invoice & Full Corporate Offer',
      detail:
        'Following initial alignment, we transmit our formal Proforma Invoice (PI) and Full Corporate Offer (FCO), establishing clear price validity, origin mandate, packaging specifications, and banking swift coordinates.',
      turnaround: 'Immediate',
      documents: ['Formal Proforma Invoice (PI)', 'Full Corporate Offer (FCO)', 'Export Compliance Dossier'],
    },
    {
      step: '03',
      title: 'Free Sample Dispatch with COA',
      headline: 'Lot-Specific Laboratory Verification',
      detail:
        'We dispatch 250g–500g lot-specific pre-shipment samples via express international courier (DHL / FedEx) accompanied by a comprehensive NABL-accredited Certificate of Analysis (COA) for sensory and chemical laboratory approval.',
      turnaround: '2–4 Days Transit',
      documents: ['DHL/FedEx Air Waybill (AWB)', 'Batch Certificate of Analysis (COA)', 'Safety Data Sheet (MSDS)'],
    },
    {
      step: '04',
      title: 'Buyer Confirms & Pays Advance',
      headline: 'Contract Execution & Bank Security',
      detail:
        'Upon sample approval, the bilateral International Sales Contract is signed under ICC Incoterms 2020. Payment security is established via Irrevocable Letter of Credit (LC at Sight) or standard TT commercial terms (advance + balance against BL copy).',
      turnaround: 'Milestone Governed',
      documents: ['Bilateral Sales Contract', 'Bank Swift MT103 / MT700 Draft', 'Production Work Order'],
    },
    {
      step: '05',
      title: 'Production, Sortex Cleaning & Branding',
      headline: 'Precision Milling, Destoning & Packaging',
      detail:
        'Harvest raw materials undergo triple-stage optical Sortex color sorting, pneumatic destoning, gravity separation, and metal detection. Packaging is executed in 25kg multi-wall paper bags, 50kg PP sacks, or private-label retail packaging with buyer branding.',
      turnaround: '5–10 Days',
      documents: ['Internal Batch Quality Log', 'Packaging & Palletizing Inspection', 'Label Artwork Compliance Sheet'],
    },
    {
      step: '06',
      title: 'Pre-Shipment Inspection & Approval',
      headline: 'Third-Party Audits & Visual Stuffing Log',
      detail:
        'Prior to container sealing, we provide high-resolution photos and video documentation of goods and palletization. Independent inspection agencies (SGS, Bureau Veritas, Intertek) are accommodated for sampling and weight verification.',
      turnaround: 'Pre-Seal Inspection',
      documents: ['SGS / Bureau Veritas Certificate (Optional)', 'Container Stuffing Photographic Audit', 'Seal Verification Log'],
    },
    {
      step: '07',
      title: 'Port Clearance & Vessel Sailing',
      headline: 'Customs Gating at Hazira or Mundra',
      detail:
        'Containers are trucked to Hazira Deep-Water Port (Surat, 25km) or Mundra Port. Export customs filing is completed via ICEGATE, container is loaded on scheduled ocean liner, and Clean on Board Ocean Bill of Lading is generated.',
      turnaround: 'Scheduled Liner',
      documents: ['Ocean Bill of Lading (Clean on Board)', 'Export Shipping Bill (ICEGATE)', 'Phytosanitary Certificate', 'Fumigation Certificate'],
    },
    {
      step: '08',
      title: 'Delivery & Quality Guarantee',
      headline: 'Destination Discharge & Complete Dossier',
      detail:
        'Full set of original shipping documents (BL, Invoice, Packing List, Certificate of Origin, Phytosanitary, COA) is dispatched via bank courier. Cargo arrives at destination port for smooth customs clearance, backed by our after-sales guarantee.',
      turnaround: 'Port Discharge',
      documents: ['Original Certificate of Origin (COO)', 'Commercial Invoice & Packing List', 'Marine Cargo Insurance Policy', 'Post-Discharge Quality Warranty'],
    },
  ];

  // Incoterms 2020 Comparative Matrix
  const incotermsData = [
    {
      code: 'EXW',
      name: 'Ex Works',
      location: 'Manufacturing Mill (Gujarat)',
      summary: 'Buyer arranges all transport, customs, and ocean freight from our processing facility in Gujarat.',
      responsibilities: {
        packaging: 'JHS GLOBAL',
        inlandTransport: 'Buyer',
        exportCustoms: 'Buyer',
        oceanFreight: 'Buyer',
        marineInsurance: 'Buyer',
        destinationCustoms: 'Buyer',
      },
    },
    {
      code: 'FCA',
      name: 'Free Carrier',
      location: 'Inland Container Depot (ICD / Hazira)',
      summary: 'JHS GLOBAL handles export packaging and customs clearance; buyer manages international freight.',
      responsibilities: {
        packaging: 'JHS GLOBAL',
        inlandTransport: 'JHS GLOBAL',
        exportCustoms: 'JHS GLOBAL',
        oceanFreight: 'Buyer',
        marineInsurance: 'Buyer',
        destinationCustoms: 'Buyer',
      },
    },
    {
      code: 'FOB',
      name: 'Free on Board',
      location: 'Hazira Port (Surat) / Mundra Port',
      summary: 'Most popular for container buyers. We handle all Indian trucking, terminal THC, customs, and loading on board.',
      popular: true,
      responsibilities: {
        packaging: 'JHS GLOBAL',
        inlandTransport: 'JHS GLOBAL',
        exportCustoms: 'JHS GLOBAL',
        oceanFreight: 'Buyer',
        marineInsurance: 'Buyer',
        destinationCustoms: 'Buyer',
      },
    },
    {
      code: 'CFR',
      name: 'Cost and Freight',
      location: 'Destination Discharge Port',
      summary: 'JHS GLOBAL covers export customs and ocean shipping freight to your discharge port; buyer covers cargo insurance.',
      responsibilities: {
        packaging: 'JHS GLOBAL',
        inlandTransport: 'JHS GLOBAL',
        exportCustoms: 'JHS GLOBAL',
        oceanFreight: 'JHS GLOBAL',
        marineInsurance: 'Buyer',
        destinationCustoms: 'Buyer',
      },
    },
    {
      code: 'CIF',
      name: 'Cost, Insurance and Freight',
      location: 'Destination Discharge Port',
      summary: 'Complete peace of mind. JHS GLOBAL covers ocean freight and comprehensive Institute Cargo Clauses (A) marine insurance.',
      popular: true,
      responsibilities: {
        packaging: 'JHS GLOBAL',
        inlandTransport: 'JHS GLOBAL',
        exportCustoms: 'JHS GLOBAL',
        oceanFreight: 'JHS GLOBAL',
        marineInsurance: 'JHS GLOBAL',
        destinationCustoms: 'Buyer',
      },
    },
  ];

  // Key Export Documents Checklist
  const shippingDocs = [
    {
      name: 'Ocean Bill of Lading (B/L)',
      issuer: 'Shipping Line (Maersk / MSC / Hapag)',
      purpose: 'Document of title, receipt of cargo loaded clean on board ocean vessel.',
      mandatory: true,
    },
    {
      name: 'Commercial Invoice & Packing List',
      issuer: 'JHS GLOBAL (Surat Office)',
      purpose: 'Itemized commodity value, HS codes, gross/net weight, and container packaging marks.',
      mandatory: true,
    },
    {
      name: 'Certificate of Origin (COO)',
      issuer: 'Chamber of Commerce / APEDA',
      purpose: 'Statutory proof of 100% Indian origin for preferential tariff & customs clearance.',
      mandatory: true,
    },
    {
      name: 'Phytosanitary Certificate',
      issuer: 'Plant Protection Dept, Ministry of Agriculture',
      purpose: 'Certifies plant cargo is free from quarantine pests, weeds, and pathogens.',
      mandatory: true,
    },
    {
      name: 'Fumigation Certificate',
      issuer: 'Authorized Federal Fumigator',
      purpose: 'Phosphine (ALP) or Methyl Bromide container treatment certificate.',
      mandatory: true,
    },
    {
      name: 'Certificate of Analysis (COA)',
      issuer: 'NABL Accredited Quality Laboratory',
      purpose: 'Lot-specific chemical purity, moisture %, pesticide residues, and active biomarkers.',
      mandatory: true,
    },
    {
      name: 'Non-GMO / Health Certificate',
      issuer: 'Export Inspection Council / Government Agency',
      purpose: 'Guarantees cargo is natural non-genetically modified agriculture.',
      mandatory: false,
    },
    {
      name: 'Marine Cargo Insurance Policy',
      issuer: 'Class-A Underwriter (Institute Cargo Clauses A)',
      purpose: 'All-risk coverage from warehouse dispatch to destination port discharge.',
      mandatory: false,
    },
  ];

  const selectedTermData = incotermsData.find((t) => t.code === selectedIncoterm) || incotermsData[2];

  return (
    <>
      <Helmet>
        <title>8-Step Export Process & Incoterms 2020 Guide — JHS GLOBAL</title>
        <meta
          name="description"
          content="Explore the 8-step international export workflow of JHS GLOBAL, shipping documentation checklist, and Incoterms 2020 rules for containerized cargo from Hazira & Mundra ports."
        />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        badge={
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ICC INCOTERMS 2020 · TRANSPARENT MILESTONE LOGISTICS</span>
          </div>
        }
        title="8-Step International Export Journey & Trade Terms"
        description="Clear milestones, audited checkpoints, and verified documentation at every stage — from initial quotation to customs discharge at your port. Structured for institutional buyers who cannot afford surprises."
      />

      {/* 8-Step Timeline Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal direction="up" className="max-w-3xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
            End-to-End Workflow Milestones
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            How Your Consignment Moves from Sourcing to Discharge
          </h2>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans">
            Every step is documented with photographic proof and digital telemetry so your supply chain remains transparent.
          </p>
        </Reveal>

        {/* 8-Card Grid with Timeline Numbering */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws, idx) => (
            <Reveal
              key={ws.step}
              direction="up"
              delay={idx * 0.05}
              className="h-full"
            >
              <div className="h-full bg-white rounded-2xl border border-surface-border p-6 shadow-subtle hover:shadow-card hover:border-primary-700/40 transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-primary-900 bg-primary-50 w-11 h-11 rounded-xl flex items-center justify-center border border-primary-100 group-hover:bg-primary-900 group-hover:text-accent-400 transition-colors">
                      {ws.step}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200/60">
                      {ws.turnaround}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    {ws.headline}
                  </span>

                  <h3 className="font-serif text-lg font-bold text-neutral-900 mb-2 leading-snug group-hover:text-primary-800 transition-colors">
                    {ws.title}
                  </h3>

                  <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                    {ws.detail}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 space-y-1.5">
                  <span className="text-[10px] font-mono text-neutral-400 font-semibold uppercase tracking-wider block">
                    Key Documentation:
                  </span>
                  {ws.documents.map((doc, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-1.5 text-[11px] text-neutral-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Incoterms 2020 Interactive Matrix */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-y border-surface-border">
        <div className="max-w-7xl mx-auto">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
              International Commercial Terms
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Accepted Incoterms 2020 Matrix
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
              We offer transparent, contractually governed trade terms tailored to your organization’s shipping preferences, freight contracts, and risk appetite.
            </p>

            {/* Incoterm Selectors */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-neutral-200/60 border border-neutral-300/60 max-w-xl mx-auto">
              {incotermsData.map((term) => (
                <button
                  key={term.code}
                  type="button"
                  onClick={() => setSelectedIncoterm(term.code)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    selectedIncoterm === term.code
                      ? 'bg-primary-900 text-white shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  {term.code}
                  {term.popular && <span className="ml-1 text-[10px] text-accent-400">★</span>}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Selected Incoterm Display */}
          <Reveal key={selectedTermData.code} direction="up" duration={0.35}>
            <div className="bg-white rounded-2xl border border-surface-border p-8 sm:p-10 shadow-card max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-extrabold text-primary-900">
                      {selectedTermData.code}
                    </span>
                    <span className="text-lg font-serif font-bold text-neutral-800">
                      — {selectedTermData.name}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono mt-1 block">
                    Transfer Point: {selectedTermData.location}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-900">
                  <Ship className="w-4 h-4 text-primary-800" />
                  <span>Hazira / Mundra Sea Port Gateway</span>
                </div>
              </div>

              <p className="text-sm text-neutral-700 leading-relaxed">
                {selectedTermData.summary}
              </p>

              {/* Responsibility Split Table */}
              <div className="pt-2">
                <h4 className="font-serif text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">
                  Scope & Responsibility Division:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {Object.entries(selectedTermData.responsibilities).map(([key, party]) => {
                    const isUs = party === 'JHS GLOBAL';
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isUs
                            ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                        }`}
                      >
                        <span className="font-medium">{label}</span>
                        <span
                          className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                            isUs ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-800'
                          }`}
                        >
                          {party}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Complete Export Documentation Vault */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
            Statutory & Commercial Compliance
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Shipping Documentation Dossier
          </h2>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Clean documents ensure seamless bank negotiation and zero customs clearance delays at your destination port.
          </p>
        </Reveal>

        <Reveal direction="up" cascade stagger={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shippingDocs.map((doc, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-surface-border bg-white shadow-subtle hover:shadow-card hover:border-primary-700/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center font-bold text-xs group-hover:bg-primary-900 group-hover:text-accent-400 transition-colors">
                    <FileCheck2 className="w-4 h-4" />
                  </span>
                  {doc.mandatory ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      Mandatory
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      Buyer Request
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-primary-800 transition-colors mb-1.5 leading-snug">
                  {doc.name}
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed font-sans mb-3">
                  {doc.purpose}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Issuing Authority:
                </span>
                <span className="text-[11px] font-semibold text-neutral-700 block mt-0.5">
                  {doc.issuer}
                </span>
              </div>
            </div>
          ))}
        </Reveal>

        {/* CTA to Quality Page */}
        <Reveal direction="up" className="mt-12 text-center">
          <Link
            to="/quality"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-900 hover:text-accent-600 uppercase tracking-widest transition-colors duration-150 group"
          >
            <span>REVIEW OUR QUALITY AUDITING STANDARDS & NABL LAB TESTING</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>

      {/* Sourcing Guarantee & Turnaround Promise */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <UnlistedSourcingBanner />
      </section>
    </>
  );
};

export default ExportProcessPage;
