import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheck,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  ChevronRight,
  Anchor,
  Truck,
  Package,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  TrendingDown,
  Apple,
  Pill,
  Leaf,
  Store,
  Layers,
} from 'lucide-react';
import { gsap } from 'gsap';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import JsonLd, { createOrganizationSchema } from '../../components/seo/JsonLd';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import WorldTradeMap from '../../components/home/WorldTradeMap';
import CertificationMarquee from '../../components/home/CertificationMarquee';
import GovCertificationsSection from '../../components/home/GovCertificationsSection';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { isReducedMotion } from '../../styles/motion';

export const HomePage = () => {
  const navigate = useNavigate();
  const { setIsDrawerOpen } = useQuoteBasket();
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';
  const heroRef = useRef(null);

  // Signature Moment: The Port Gateway Unveil (Home Hero)
  useEffect(() => {
    if (isReducedMotion() || !heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. World Trade Map ascends with soft dimensional scale & fade
      tl.fromTo(
        '.hero-map',
        { opacity: 0, scale: 0.95, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.85, ease: 'power3.out' },
        0.05
      )
      // 2. Accreditation Pill settles in promptly
      .fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
        0.08
      )
      // 3. Line-masked headline ascending reveal (crisp, noble 0.75s, 20px travel)
      .fromTo(
        '.hero-line',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08,
        },
        0.18
      )
      // 4. Subtext description paragraph
      .fromTo(
        '.hero-subtext',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        0.42
      )
      // 5. Conversion CTAs glide into place
      .fromTo(
        '.hero-cta',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
        0.52
      )
      // 6. Micro trust points sequential entry
      .fromTo(
        '.hero-trust-item',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.04 },
        0.62
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const workflowSteps = [
    {
      num: '01',
      title: 'Formal RFQ & 48h Binding Quote',
      desc: 'Submit your commodity specifications, tonnage (MT/FCL), target month, and destination port.',
    },
    {
      num: '02',
      title: 'Sample Dispatch & Lab COA',
      desc: 'Air courier dispatch (DHL/FedEx) of 250g–500g lab-certified samples with complete HPLC/GC-MS testing reports.',
    },
    {
      num: '03',
      title: 'Contract & Banking (LC / TT)',
      desc: 'Proforma invoice issuance, international sales agreement, and secure banking under ICC Incoterms 2020.',
    },
    {
      num: '04',
      title: 'Processing, Sorting & Container Packing',
      desc: 'Optical Sortex cleaning, mechanical grading, vacuum or nitrogen-flush barrier packaging in clean-room facilities.',
    },
    {
      num: '05',
      title: 'Port Loading & Customs Discharge',
      desc: 'Pre-shipment phytosanitary inspection, container stuffing at Mundra/JNPT, and swift Bill of Lading documentation.',
    },
  ];

  const qaSteps = [
    {
      title: 'Direct Origin Sourcing',
      desc: 'Procurement directly from verified manufacturing facilities and certified chemical/extraction plants across India.',
    },
    {
      title: 'In-Process Assay Screening',
      desc: 'Multi-stage extraction verification, micronization sizing, and assay benchmarking for international purity standards.',
    },
    {
      title: 'NABL Accredited Lab Testing',
      desc: 'HPLC, GC-MS, and microbiological screening certifying active markers, absence of contaminants, and heavy metal compliance.',
    },
    {
      title: 'Container Stuffing Inspection',
      desc: 'Pre-dispatch third-party inspection (SGS/Bureau Veritas on buyer request) with moisture-barrier liners and container desiccants.',
    },
  ];

  const whyChoosePoints = [
    {
      title: 'Responsive & Experienced Team',
      desc: 'Direct, proactive trade coordination with experienced export executives who understand global buyer standards.',
      icon: Clock,
    },
    {
      title: 'Certified & Compliant',
      desc: 'Fully licensed under FSSAI Central Authority, APEDA, and DGFT IEC with zero statutory bottlenecks.',
      icon: ShieldCheck,
    },
    {
      title: 'Premium Quality',
      desc: 'Batch-standardized assays, microbiological screening, and lot-by-lot NABL accredited lab certificates of analysis.',
      icon: Award,
    },
    {
      title: 'Global Export Experience',
      desc: 'Routine container shipments to the Middle East, Europe, North America, and Southeast Asia with compliant cross-border documentation.',
      icon: Anchor,
    },
    {
      title: 'Competitive Pricing',
      desc: 'Direct-from-manufacturer sourcing eliminates intermediate trader markups, delivering transparent competitive CIF/FOB pricing.',
      icon: TrendingDown,
    },
    {
      title: 'Timely Delivery',
      desc: 'Strict shipment schedules with preferred liner contracts from Hazira, Mundra, and Pipavav ports to eliminate demurrage delays.',
      icon: Truck,
    },
    {
      title: 'Customized Packaging',
      desc: 'Tailored packaging from 25kg PP moisture-barrier bags and paper sacks to retail pouches and private label OEM branding.',
      icon: Package,
    },
    {
      title: 'Transparent Communication',
      desc: 'Real-time container stuffing photos, draft bill of lading previews, and prompt status updates at every stage of trade execution.',
      icon: MessageSquare,
    },
    {
      title: '48-Hour Quote Turnaround',
      desc: 'Guaranteed comprehensive proforma proposals, freight estimates, and technical specification dossiers within 48 business hours.',
      icon: Sparkles,
    },
    {
      title: 'Honesty and Integrity',
      desc: 'Built for buyers who cannot afford surprises: what is committed in the lab COA and contract is exactly what arrives in your container.',
      icon: HeartHandshake,
    },
  ];

  const applicationSectors = [
    {
      name: 'Personal Care & Cosmetic Formulators',
      desc: 'High-purity castor oleochemicals, SLES 70% surfactant base, salicylic acid, glycolic acid, pure Vitamin E acetate, and micronized kaolin clay for skincare, haircare, and toiletry manufacturers.',
      icon: Sparkles,
    },
    {
      name: 'Nutraceuticals & Dietary Supplements',
      desc: 'HPLC-standardized botanical extracts (Ashwagandha, Curcumin 95%, Boswellia, Bacopa, Moringa, Amla), non-GMO pea protein isolate, and functional xanthan gum for capsules and functional blends.',
      icon: Pill,
    },
    {
      name: 'Feed Mills & Commercial Animal Nutrition',
      desc: 'High-protein solvent-extracted soybean meal (DOC 46–48%), rapeseed/mustard meal, cottonseed meal, and custom feed-grade vitamin/mineral premixes for poultry, cattle, swine, and aquafeed.',
      icon: Layers,
    },
  ];

  return (
    <>
      <JsonLd data={createOrganizationSchema()} />
      <Helmet>
        <title>{brandName} — One Accountable Supplier for Diverse Category Sourcing</title>
        <meta
          name="description"
          content="Consolidate your Indian sourcing in a single shipment with unified documentation and one point of contact. Exporting personal care raw materials, botanical extracts, agro commodities, and animal feed worldwide."
        />
      </Helmet>

      {/* Hero Section (Signature Moment) */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white border-b border-primary-800/80 overflow-hidden min-h-[580px] lg:min-h-[640px] xl:min-h-[700px] flex items-center"
      >
        {/* Subtle Brand Pattern & Calm Ambient Glow */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />

        {/* Desktop: World Trade Map with Expanded Spatial Presence */}
        <div className="hero-map hidden lg:flex absolute right-0 top-0 bottom-0 w-1/2 h-full items-center justify-center p-1 sm:p-2 lg:p-2 xl:p-2.5 z-10 pointer-events-auto overflow-visible">
          <WorldTradeMap />
        </div>

        <div className="w-full relative z-20 py-16 lg:py-20 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-center">
            {/* Left Column: All Text, Eyebrow, CTAs & Trust Badges */}
            <div className="lg:col-span-6 xl:col-span-6 text-left max-w-xl xl:max-w-2xl">
              {/* Eyebrow Badge */}
              <div className="hero-eyebrow inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-primary-950/85 border border-accent-500/40 text-accent-400 text-[10px] sm:text-[11px] xl:text-xs font-semibold shadow-xs backdrop-blur-xs mb-3.5 sm:mb-4">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-400 shrink-0" />
                <span className="tracking-wide sm:tracking-wider whitespace-nowrap">GLOBAL B2B EXPORT HOUSE • PERSONAL CARE, NUTRACEUTICAL & FEED</span>
              </div>

              {/* Masked Line-by-Line Headline */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.2rem] xl:text-[2.7rem] 2xl:text-[3.1rem] font-bold tracking-tight text-white leading-[1.14] sm:leading-[1.1]">
                <span className="overflow-hidden block">
                  <span className="hero-line block">One Accountable Supplier</span>
                </span>
                <span className="overflow-hidden block mt-1 sm:mt-1.5">
                  <span className="hero-line block">for Diverse Category Sourcing</span>
                </span>
              </h1>

              {/* Supporting Value Proposition */}
              <p className="hero-subtext mt-4 sm:mt-5 text-xs sm:text-base xl:text-[1.05rem] text-neutral-200/90 leading-[1.7] font-sans font-normal">
                Every step of our supply chain is managed with precision and care. Whether it’s spices, agro commodities, botanical extracts, animal feed, or cosmetic raw materials — we consolidate your Indian sourcing in a single shipment with unified documentation and one point of contact.
              </p>

              {/* Action Buttons Aligned and Proportioned */}
              <div className="hero-cta mt-6 sm:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="cta"
                  size="lg"
                  onClick={() => setIsDrawerOpen(true)}
                  className="shadow-hover flex items-center justify-center gap-2 h-12 px-7 text-xs sm:text-sm font-bold whitespace-nowrap rounded-xl transition-all"
                >
                  <span>Request a Quote (RFQ)</span>
                  <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline-light"
                  size="lg"
                  onClick={() => navigate('/products')}
                  className="border border-white/20 hover:border-accent-400/80 bg-white/[0.06] hover:bg-white/[0.12] text-white hover:text-accent-300 h-12 px-7 text-xs sm:text-sm font-semibold whitespace-nowrap shadow-xs flex items-center justify-center transition-all duration-200 backdrop-blur-xs rounded-xl"
                >
                  Explore Products
                </Button>
              </div>

              {/* Micro Trust Points - Balanced Evenly Divided Strip */}
              <div className="mt-8 sm:mt-9 pt-6 sm:pt-7 border-t border-white/10">
                <div className="grid grid-cols-2 2xl:grid-cols-4 gap-y-3.5 gap-x-6 sm:gap-y-4 sm:gap-x-8 2xl:gap-0 2xl:divide-x 2xl:divide-white/15">
                  <div className="hero-trust-item flex items-center gap-2.5 2xl:px-3 first:2xl:pl-0">
                    <Clock className="w-4 h-4 text-accent-400 shrink-0" />
                    <span className="text-xs font-medium text-neutral-200 whitespace-nowrap">48h Quote Promise</span>
                  </div>
                  <div className="hero-trust-item flex items-center gap-2.5 2xl:px-3">
                    <Award className="w-4 h-4 text-accent-400 shrink-0" />
                    <span className="text-xs font-medium text-neutral-200 whitespace-nowrap">Lab COA per Lot</span>
                  </div>
                  <div className="hero-trust-item flex items-center gap-2.5 2xl:px-3">
                    <Anchor className="w-4 h-4 text-accent-400 shrink-0" />
                    <span className="text-xs font-medium text-neutral-200 whitespace-nowrap">Hazira & Mundra Ports</span>
                  </div>
                  <div className="hero-trust-item flex items-center gap-2.5 2xl:px-3 last:2xl:pr-0">
                    <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
                    <span className="text-xs font-medium text-neutral-200 whitespace-nowrap">3 Divisions / 20 Lines</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile / Tablet: Map displayed cleanly below the text */}
            <div className="hero-map lg:hidden w-full pt-6">
              <WorldTradeMap />
            </div>
          </div>
        </div>
      </section>

      {/* Global Scale Metrics Strip with Smooth Roll-Up Counters */}
      <section className="bg-white py-8 px-4 sm:px-6 lg:px-8 border-b border-neutral-200 shadow-2xs">
        <div className="max-w-7xl mx-auto">
          <Reveal direction="up" cascade stagger={0.06} className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1 sm:border-r border-neutral-200">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 block tracking-tight">
                <AnimatedCounter value="3" duration={1.5} delay={0.2} />
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-600 font-semibold uppercase tracking-wider block">
                Master Export Divisions
              </span>
            </div>
            <div className="space-y-1 md:border-r border-neutral-200">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 block tracking-tight">
                <AnimatedCounter value="20" duration={1.5} delay={0.25} />
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-600 font-semibold uppercase tracking-wider block">
                Specialized Raw Materials
              </span>
            </div>
            <div className="space-y-1 sm:border-r border-neutral-200">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 block tracking-tight">
                <AnimatedCounter value="100%" duration={1.5} delay={0.3} />
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-600 font-semibold uppercase tracking-wider block">
                Lot-by-Lot COA Testing
              </span>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 block tracking-tight">
                <AnimatedCounter value="48 Hours" duration={1.5} delay={0.35} />
              </span>
              <span className="text-[11px] sm:text-xs text-neutral-600 font-semibold uppercase tracking-wider block">
                Commercial RFQ Promise
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Certification Strip (Smooth Continuous Marquee with Hover Pause) */}
      <CertificationMarquee />

      {/* Origin & Maritime Infrastructure & The Sourcing Pledge */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-surface-canvas border-b border-surface-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center">
          {/* Left Column: Corridor Details & Port Badges */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal direction="up">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2 font-mono">
                ORIGIN & MARITIME INFRASTRUCTURE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-neutral-900 leading-[1.18] tracking-tight">
                Rooted in India’s Premier Maritime Export Corridor
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.1} className="space-y-4 text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
              <p>
                Headquartered in <strong className="text-neutral-900 font-semibold">Surat, Gujarat</strong> — historically recognized as one of India's most vibrant merchant trading gateways — <strong className="text-neutral-900 font-semibold">{brandName}</strong> was founded to bridge the gap between Indian agricultural harvest belts and discerning international buyers who require uncompromising quality, transparent pricing, and predictable sea transit.
              </p>
              <p>
                We eliminate the traditional multi-tier broker chain by managing direct linkages with Agricultural Produce Market Committees (APMC mandis), farmer producer organizations (FPOs), and certified processing mills across Gujarat, Rajasthan, Madhya Pradesh, and South India.
              </p>
              <p>
                Our strategic geographic position places us within <strong className="text-neutral-900 font-semibold">25 km of Hazira Deep-Water Port (Surat)</strong> and in direct rail-road connectivity with <strong className="text-neutral-900 font-semibold">Mundra Port</strong> and <strong className="text-neutral-900 font-semibold">JNPT (Nhava Sheva)</strong>, ensuring priority vessel berthing and rapid container dispatch to international destinations.
              </p>
            </Reveal>

            {/* 3 Strategic Port Outlets */}
            <Reveal direction="up" delay={0.15} className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <span className="font-mono text-xs text-accent-700 font-bold block mb-1">HAZIRA PORT</span>
                <span className="text-xs text-neutral-600 font-medium block leading-snug">
                  25 km transit distance from export dispatch yard
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <span className="font-mono text-xs text-accent-700 font-bold block mb-1">MUNDRA PORT</span>
                <span className="text-xs text-neutral-600 font-medium block leading-snug">
                  Premier deep-water container terminal for global lines
                </span>
              </div>
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <span className="font-mono text-xs text-accent-700 font-bold block mb-1">JNPT / NHAVA SHEVA</span>
                <span className="text-xs text-neutral-600 font-medium block leading-snug">
                  Direct access to regular Gulf & European sailings
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right Column: The Sourcing Pledge Dark Hero Card */}
          <div className="lg:col-span-5">
            <Reveal direction="up" delay={0.15}>
              <div className="p-8 sm:p-10 rounded-3xl bg-[#091b13] text-white shadow-xl border border-primary-800/80 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
                <div>
                  <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#c59b27] font-bold block mb-6">
                    THE SOURCING PLEDGE
                  </span>
                  <blockquote className="font-serif text-lg sm:text-xl xl:text-2xl text-neutral-100 font-normal italic leading-relaxed">
                    "Importing from a new partner is a risk calculation. Everything about how we work is designed to give you the confidence to source smarter, the consistency to grow stronger, and the reliability to build a business that lasts — because the right sourcing partner doesn't add uncertainty. They eliminate it."
                  </blockquote>
                </div>
                <div className="mt-8 pt-6 border-t border-primary-800/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">International Trade Desk</span>
                    <span className="text-[11px] text-neutral-400 block font-mono mt-0.5">{brandName} · Surat, Gujarat</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-primary-900 border border-[#c59b27]/30 flex items-center justify-center text-[#c59b27] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>

      {/* Why Choose JHS Global? (10 Key Pillars) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-50 border border-accent-200/80 text-accent-700 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-600" />
              <span>BUILT FOR BUYERS WHO CAN'T AFFORD SURPRISES</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
              Why Partner with JHS GLOBAL?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
              Direct manufacturer linkages, lot-by-lot NABL lab testing, and dedicated maritime container logistics designed to give institutional buyers uncompromising consistency and peace of mind.
            </p>
          </Reveal>

          <Reveal direction="up" cascade stagger={0.06} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {whyChoosePoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-surface-border bg-surface-card hover:bg-white hover:border-accent-500/50 hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center mb-3 group-hover:bg-primary-900 group-hover:text-accent-400 transition-colors duration-200">
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <span className="font-mono text-[10px] text-accent-600 font-bold uppercase tracking-widest block mb-1">
                      Pillar 0{index + 1}
                    </span>
                    <h3 className="font-serif text-sm font-bold text-neutral-900 mb-2 leading-snug group-hover:text-primary-800 transition-colors duration-150">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Target Industrial Applications (6 Key Sectors) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-b border-surface-border">
        <div className="max-w-7xl mx-auto">
          <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-1">
              Industrial Versatility
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
              Products Designed for Diverse Industrial Needs
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              Our export portfolio caters to high-compliance manufacturing sectors across global supply chains.
            </p>
          </Reveal>

          <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicationSectors.map((sector, idx) => {
              const SectorIcon = sector.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl border border-surface-border bg-white shadow-subtle hover:shadow-card hover:border-accent-500/40 transition-all duration-200 flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center shrink-0 group-hover:bg-primary-900 group-hover:text-accent-400 transition-colors duration-200">
                    <SectorIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-neutral-900 group-hover:text-primary-800 transition-colors duration-150">
                      {sector.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                      {sector.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </Reveal>

          <Reveal direction="up" delay={0.15} className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white font-bold text-xs sm:text-sm shadow-card hover:shadow-hover transition-all duration-150 group"
            >
              <span>Explore Complete Export Catalogue (20 Products)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 4-Step Quality Assurance Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-1">
            Quality Assurance Protocol
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            4-Step Purity & Container Due Diligence
          </h2>
          <p className="mt-3 text-sm text-neutral-600">
            Every export shipment is verified through multi-point inspections prior to customs seal application.
          </p>
        </Reveal>

        <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {qaSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-surface-border bg-surface-card shadow-subtle hover:shadow-card hover:border-accent-500/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <span className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 font-bold flex items-center justify-center text-sm mb-4 group-hover:bg-primary-800 group-hover:text-white transition-colors duration-200">
                  0{idx + 1}
                </span>
                <h3 className="font-serif text-lg font-bold text-neutral-900 group-hover:text-primary-800 transition-colors duration-150">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* 5-Step Order Workflow Timeline */}
      <section className="bg-primary-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-1">
              From Inquiry to Discharge
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              5-Step Export Workflow Process
            </h2>
            <p className="mt-3 text-sm text-neutral-300">
              Clear timelines, documented checkpoints, and transparent communications at every stage.
            </p>
          </Reveal>

          <Reveal direction="up" cascade stagger={0.07} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {workflowSteps.map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-xl bg-primary-800/80 border border-primary-700/80 hover:border-accent-400/60 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-accent-400 block mb-3 group-hover:scale-105 transition-transform origin-left duration-200">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </Reveal>

          <div className="mt-12 text-center">
            <Link
              to="/export-process"
              className="text-xs text-accent-400 hover:text-accent-300 font-semibold link-underline"
            >
              Learn more about our Incoterms 2020 and export logistics →
            </Link>
          </div>
        </div>
      </section>

      {/* Company Philosophy Banner */}
      <section className="bg-primary-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-primary-800">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal direction="up">
            <span className="font-mono text-xs uppercase tracking-widest text-accent-400 font-semibold block mb-3">
              Our Core Philosophy
            </span>
            <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl text-neutral-100 font-medium italic leading-relaxed">
              "At JHS GLOBAL, our commitment begins long before the shipment leaves India — and lasts long after it reaches you."
            </blockquote>
            <p className="mt-4 text-xs sm:text-sm text-neutral-400">
              Responsible, accountable Indian export procurement with unified documentation and single-point accountability.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Government Approved Certifications & Export Documents Showcase */}
      <GovCertificationsSection />

      {/* Conversion Banner: Start a Conversation */}
      <section className="bg-surface-canvas py-20 px-4 sm:px-6 lg:px-8">
        <Reveal
          direction="up"
          distance={20}
          duration={0.6}
          className="max-w-4xl mx-auto text-center p-10 sm:p-14 rounded-2xl border border-surface-border bg-white shadow-card hover:shadow-hover transition-shadow duration-300"
        >
          <span className="px-3 py-1 rounded-full bg-cta-100 text-cta-700 text-xs font-semibold inline-block mb-4">
            Guaranteed 48-Hour Response Turnaround
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900">
            Planning Your Next Sourcing from India?
          </h2>
          <p className="mt-2 font-serif text-lg text-primary-900 font-medium">
            We are just a few steps away.
          </p>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
            Assemble commodities in your Quote Basket or submit your custom specifications directly to our international trade desk.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="cta" size="lg" onClick={() => navigate('/contact')}>
              Request a Quote (Direct Link)
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/sample-request')}>
              Order Lab Samples
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default HomePage;
