import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  Globe2,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Anchor,
  Copy,
  Check,
  Clock,
  MapPin,
  FileCheck2,
  PackageCheck,
  Truck,
  Scale,
  FileText,
  BadgeCheck,
  ChevronRight,
  Sparkles,
  Pill,
  Layers,
  Send,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import PageHeader from '../../components/layout/PageHeader';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import UnlistedSourcingBanner from '../../components/common/UnlistedSourcingBanner';
import { FOUNDERS } from '../../data/founders';

export const AboutPage = () => {
  const navigate = useNavigate();
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';

  const [copiedKey, setCopiedKey] = useState(null);
  const [activeBelt, setActiveBelt] = useState('gujarat');

  const copyToClipboard = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const stats = [
    { value: '30+', label: 'Global Destination Ports', detail: 'Regular container discharge across GCC, Europe, Americas & SE Asia' },
    { value: '18,000+', label: 'Annual Metric Tonnes (MT)', detail: 'Direct farm-to-container export capacity across key commodity belts' },
    { value: '99.5%', label: 'Purity Sortex Standard', detail: 'Triple optical color-sorted commodity precision per export lot' },
    { value: '48 Hours', label: 'Proforma Response Promise', detail: 'Guaranteed commercial turnaround for verified international buyers' },
  ];

  // 3 Core Export Categories
  const coreCategories = [
    {
      id: 'personal-care',
      title: 'Personal Care Raw Materials & Oleochemicals',
      desc: 'Manufacturer-grade cosmetic ingredients including Refined Castor Oil derivatives, SLES 70% surfactant base, salicylic acid, glycolic acid, and pure Vitamin E acetate for skincare and personal care formulators.',
      icon: Sparkles,
      link: '/products?category=Personal%20Care%20Raw%20Materials',
      badge: 'COSMETIC GRADE',
    },
    {
      id: 'nutraceuticals',
      title: 'Standardized Nutraceutical Extracts',
      desc: 'HPLC-standardized botanical extracts (Ashwagandha withanolides, Curcumin 95%, Boswellia, Bacopa, Moringa, and Amla) tested for heavy metal limits and microbiological compliance for supplement blenders.',
      icon: Pill,
      link: '/products?category=Nutraceutical%20Raw%20Materials',
      badge: 'STANDARDIZED HPLC',
    },
    {
      id: 'animal-feed',
      title: 'Animal Feed Ingredients & Protein Meals',
      desc: 'High-protein Non-GMO Soybean Meal (DOC 46–48%), Rapeseed Meal, and Mustard Meal for commercial poultry, dairy, and aquafeed millers with complete phytosanitary and fumigation documentation.',
      icon: Layers,
      link: '/products?category=Animal%20Feed',
      badge: 'FEED MILL GRADE',
    },
  ];

  // Sourcing Belts across India
  const sourcingBelts = [
    {
      id: 'gujarat',
      region: 'Gujarat & Saurashtra Agro Belt',
      ports: 'Hazira Port (Surat, 25km) & Mundra Port (420km)',
      commodities: ['Sesame Seeds (Natural & Hulled)', 'Cumin Seeds (Jeera)', 'First Special Grade Castor Oil', 'Guar Gum Powder & Splits', 'Psyllium Husk (Isabgol)'],
      description: 'Our primary operational backyard. Direct tie-ups with APMC mandis in Unjha, Gondal, Rajkot, and Mehsana ensure immediate harvest access, zero middlemen markups, and rapid port transit.',
    },
    {
      id: 'rajasthan',
      region: 'Rajasthan & Northern Grain Corridor',
      ports: 'Mundra & Kandla Dry Ports (ICD Connectivity)',
      commodities: ['Green Millet / Bajra (Bird & Animal Feed)', 'Sortex Yellow Corn / Maize', 'Mustard Seeds (Black & Yellow)', 'Fenugreek Seeds (Methi)', 'Coriander Seeds (Eagle / Scooter)'],
      description: 'High-volume dry agricultural commodities sourced directly from farmer producer groups across Jaipur, Kota, and Jodhpur mandis, precision-cleaned at origin.',
    },
    {
      id: 'central',
      region: 'Central India (Madhya Pradesh & Maharashtra)',
      ports: 'JNPT Port (Mumbai) & Hazira Port',
      commodities: ['Soybean Meal (De-Oiled Cake / DOC 46–48%)', 'Turmeric Rhizomes & Powder (Salem & Rajapore)', 'Dry Ginger Flakes', 'Standardized Ashwagandha Roots', 'Boswellia Serrata'],
      description: 'Rich fertile plains delivering non-GMO protein meals for feed millers and active biomarker-dense medicinal herbs for global nutraceutical blenders.',
    },
    {
      id: 'south',
      region: 'Southern Spice & Coastal Botanical Belt',
      ports: 'Cochin Port & Chennai Port / JNPT',
      commodities: ['Tellicherry Black Pepper (TGSEB Grade)', 'Alleppey Green Cardamom', 'Pure Lemongrass & Peppermint Essential Oils', 'Dry Red Chillies (Teja & Sannam)', 'Organic Spirulina Powder'],
      description: 'Centuries-old spice trading terroirs providing high-volatile oil seed spices, laboratory-standardized botanical extracts, and steam-distilled pure essential oils.',
    },
  ];

  // Confirmed Export Markets
  const exportMarkets = [
    {
      region: 'Middle East & GCC',
      ports: 'Jebel Ali (Dubai), Dammam, Jeddah, Shuwaikh, Sohar',
      transit: '4–7 Days',
      flag: '🇦🇪 🇸🇦 🇴🇲',
    },
    {
      region: 'European Union & UK',
      ports: 'Hamburg, Rotterdam, Antwerp, Felixstowe, Genoa',
      transit: '18–24 Days',
      flag: '🇩🇪 🇳🇱 🇬🇧 🇮🇹',
    },
    {
      region: 'Americas & Canada',
      ports: 'New York / New Jersey, Houston, Savannah, Santos',
      transit: '28–35 Days',
      flag: '🇺🇸 🇨🇦 🇧🇷',
    },
    {
      region: 'Southeast Asia & East Asia',
      ports: 'Singapore, Port Klang, Laem Chabang, Busan',
      transit: '8–14 Days',
      flag: '🇸🇬 🇲🇾 🇹🇭 🇰🇷',
    },
  ];

  // 10 Pillars from Client Notes
  const pillars = [
    {
      num: '01',
      title: 'Responsive & Experienced Trade Desk',
      desc: 'Our multilingual export professionals understand international trade mechanics, Incoterms 2020 rules, container slotting, and time-sensitive customs clearance.',
    },
    {
      num: '02',
      title: 'Certified & Compliant Governance',
      desc: 'Statutory registrations with FSSAI Central Authority, APEDA, Spices Board of India, DGFT, and GST. Every consignment is 100% legal, auditable, and traceable.',
    },
    {
      num: '03',
      title: 'Premium Sortex Quality',
      desc: 'Triple-pass optical color sorting, pneumatic destoning, metal detection, and NABL-accredited laboratory COAs accompany every dispatched container.',
    },
    {
      num: '04',
      title: 'Global Export Footprint',
      desc: 'Proven maritime delivery track record across 30+ destination discharge ports in the Middle East, European Union, North America, and Southeast Asia.',
    },
    {
      num: '05',
      title: 'Competitive Direct-Origin Pricing',
      desc: 'By sourcing directly from primary mandis and contract farmer collectives, we eliminate broker layers and offer institutional buyers volume-backed pricing.',
    },
    {
      num: '06',
      title: 'On-Time Delivery & Vessel Slotting',
      desc: 'Strategic Gujarat proximity to Hazira and Mundra ports gives us guaranteed ocean vessel space allocations and predictable transit timelines.',
    },
    {
      num: '07',
      title: 'Customized & OEM Packaging',
      desc: 'From 25kg multi-wall kraft paper bags and 50kg PP bags to retail standing zip pouches, spice jars, and nitrogen-flushed bulk containers.',
    },
    {
      num: '08',
      title: 'Transparent Communication',
      desc: 'Proactive milestone updates from harvest procurement and laboratory analysis to container stuffing photos and vessel sailing telemetry.',
    },
    {
      num: '09',
      title: '48-Hour Quote Turnaround',
      desc: 'Binding commercial quotations, current ocean freight rates, and product specification packs delivered to your inbox within 48 business hours.',
    },
    {
      num: '10',
      title: 'Honesty, Integrity & Single Accountability',
      desc: 'We stand behind our commitments long before the vessel departs India and remain accountable until the container safely clears your discharge port.',
    },
  ];

  // Official Legal Verification Details
  const legalDetails = [
    {
      label: 'Brand & Commercial Name',
      value: brandName,
      code: 'JHS GLOBAL',
      verified: true,
      copyable: false,
    },
    {
      label: 'DGFT Importer-Exporter Code (IEC)',
      value: 'EZHPP3437C',
      code: 'EZHPP3437C',
      verified: true,
      copyable: true,
      link: '/documents/iec-certificate.pdf',
    },
    {
      label: 'GST Identification Number (GSTIN)',
      value: '24EZHPP3437C1ZH',
      code: '24EZHPP3437C1ZH',
      verified: true,
      copyable: true,
      link: '/documents/gst-certificate.pdf',
    },
    {
      label: 'FSSAI Central Food Safety License',
      value: '10725997001058',
      code: '10725997001058',
      verified: true,
      copyable: true,
      link: '/documents/fssai-license.pdf',
    },
    {
      label: 'APEDA Registration-Cum-Membership (RCMC)',
      value: 'Registered Exporter (Agro & Food Products)',
      code: 'EZHPP3437C',
      verified: true,
      copyable: false,
      link: '/documents/apeda-rcmc.pdf',
    },
    {
      label: 'Spices Board of India Exporter CRES',
      value: 'CRES Certified Exporter of Indian Spices',
      code: 'EZHPP3437C',
      verified: true,
      copyable: false,
      link: '/documents/spices-board-cres.pdf',
    },
    {
      label: 'MSME Udyam Enterprise Registration',
      value: 'UDYAM-GJ-22-0460260',
      code: 'UDYAM-GJ-22-0460260',
      verified: true,
      copyable: true,
      link: '/documents/msme-udyam.pdf',
    },
    {
      label: 'Primary Export Loading Ports',
      value: 'Hazira Port (Surat), Mundra Port (Kutch), JNPT (Navi Mumbai)',
      code: 'Gujarat Maritime Gateways',
      verified: true,
      copyable: false,
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Us — JHS Global | Manufacturer-Grade Indian Raw Materials & Active Ingredients</title>
        <meta
          name="description"
          content="About Us: Direct manufacturer sourcing of personal care raw materials, HPLC-standardized nutraceutical botanical extracts, and high-protein animal feed meals exported worldwide from Gujarat, India."
        />
        <link rel="canonical" href={`${import.meta.env.VITE_CLIENT_URL || 'https://jhsglobal.com'}/about-us`} />
      </Helmet>

      {/* Signature Slow Masked Page Header */}
      <PageHeader
        badge={
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ESTABLISHED IN SURAT, GUJARAT · REGISTERED INDIAN EXPORT HOUSE</span>
          </div>
        }
        eyebrow="Company Profile & Heritage"
        title="About Us — Manufacturer-Grade Indian Raw Materials & Active Ingredients, Exported Worldwide."
        description="Direct manufacturer sourcing of personal care raw materials, HPLC-standardized nutraceutical botanical extracts, and high-protein animal feed meals. Verified HS codes, lot-by-lot lab COAs, and containerized ocean freight to 30+ countries. Binding proforma quotations provided within 48 business hours."
      />

      {/* Stats Matrix with Smooth Roll-Up Counters */}
      <section className="py-12 bg-white border-b border-surface-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal
            direction="up"
            cascade
            stagger={0.06}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="border-l-2 border-accent-500 pl-4 sm:pl-5 space-y-1.5 transition-transform duration-200 hover:translate-x-1"
              >
                <span className="font-serif text-3xl sm:text-4xl font-bold text-primary-900 block tracking-tight">
                  <AnimatedCounter value={s.value} duration={1.8} delay={0.15 + idx * 0.05} />
                </span>
                <span className="font-semibold text-neutral-900 text-sm block">
                  {s.label}
                </span>
                <span className="text-xs text-neutral-500 block leading-relaxed">
                  {s.detail}
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Company Heritage, Maritime Infrastructure & Sourcing Pledge */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heritage & Maritime Infrastructure (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal direction="up">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
                Origin & Maritime Infrastructure
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
                Rooted in India’s Premier Maritime Export Corridor
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.1} className="space-y-4 text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
              <p>
                Headquartered in <strong className="text-neutral-900">Surat, Gujarat</strong> — historically recognized as one of India's most vibrant merchant trading gateways — <strong className="text-primary-900 font-semibold">{brandName}</strong> was founded to bridge the gap between Indian agricultural harvest belts and discerning international buyers who require uncompromising quality, transparent pricing, and predictable sea transit.
              </p>
              <p>
                We eliminate the traditional multi-tier broker chain by managing direct linkages with Agricultural Produce Market Committees (APMC mandis), farmer producer organizations (FPOs), and certified processing mills across Gujarat, Rajasthan, Madhya Pradesh, and South India.
              </p>
              <p>
                Our strategic geographic position places us within <strong className="text-neutral-900">25 km of Hazira Deep-Water Port (Surat)</strong> and in direct rail-road connectivity with <strong className="text-neutral-900">Mundra Port</strong> and <strong className="text-neutral-900">JNPT (Nhava Sheva)</strong>, ensuring priority vessel berthing and rapid container dispatch to international destinations.
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.15} className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <span className="font-mono text-xs text-accent-700 font-bold block mb-1">HAZIRA PORT</span>
                <span className="text-xs text-neutral-700 font-medium block">25 km transit distance from export dispatch yard</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <span className="font-mono text-xs text-accent-700 font-bold block mb-1">MUNDRA PORT</span>
                <span className="text-xs text-neutral-700 font-medium block">Premier deep-water container terminal for global lines</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-subtle border border-surface-border">
                <span className="font-mono text-xs text-accent-700 font-bold block mb-1">JNPT / NHAVA SHEVA</span>
                <span className="text-xs text-neutral-700 font-medium block">Direct access to regular Gulf & European sailings</span>
              </div>
            </Reveal>
          </div>

          {/* Right Column: The Sourcing Pledge Card (5 Cols) */}
          <div className="lg:col-span-5">
            <Reveal direction="up" delay={0.2}>
              <div className="p-7 sm:p-9 rounded-2xl bg-primary-950 text-white shadow-xl border border-primary-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
                <span className="font-mono text-xs uppercase tracking-widest text-accent-400 font-semibold block mb-3">
                  The Sourcing Pledge
                </span>
                <blockquote className="font-serif text-lg sm:text-xl text-neutral-100 font-medium italic leading-relaxed">
                  "Importing from a new partner is a risk calculation. Everything about how we work is designed to give you the confidence to source smarter, the consistency to grow stronger, and the reliability to build a business that lasts — because the right sourcing partner doesn’t add uncertainty. They eliminate it."
                </blockquote>
                <div className="mt-6 pt-5 border-t border-primary-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">International Trade Desk</span>
                    <span className="text-[11px] text-neutral-400 block font-mono">{brandName} · Surat, Gujarat</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary-900 border border-accent-500/30 flex items-center justify-center text-accent-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Dedicated Executive Leadership & Founders Section */}
      <section
        id="leadership-founders"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-y border-surface-border"
        aria-labelledby="founders-heading"
        data-testid="founders-section"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block">
              Leadership & Governance
            </span>
            <h2 id="founders-heading" className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight">
              The Founders Behind {brandName}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
              Direct founder accountability from processing floor to seaport container terminal. A leadership team dedicated to eliminating surprises in international raw material sourcing.
            </p>
          </Reveal>

          {/* 3 Equal Founder Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {FOUNDERS.map((founder, idx) => (
              <Reveal key={founder.id} direction="up" delay={0.08 * (idx + 1)}>
                <div
                  className="rounded-2xl bg-white border border-surface-border shadow-card overflow-hidden group flex flex-col h-full hover:border-accent-500/50 hover:shadow-lg transition-all duration-300"
                  data-testid={`founder-card-${founder.id}`}
                >
                  {/* 3:4 Aspect Ratio Responsive Image Frame with Zero Layout Shift */}
                  <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
                    <picture>
                      <source
                        type="image/avif"
                        srcSet={founder.images.srcSetAvif}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
                      />
                      <source
                        type="image/webp"
                        srcSet={founder.images.srcSetWebp}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
                      />
                      <img
                        src={founder.images.jpg}
                        alt={founder.alt}
                        width="768"
                        height="1024"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto aspect-[3/4] object-cover transform-gpu group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                        style={{
                          backgroundImage: `url(${founder.images.blur})`,
                          backgroundSize: 'cover',
                        }}
                      />
                    </picture>
                    <div className="absolute top-3.5 left-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/95 backdrop-blur-xs text-primary-950 shadow-xs border border-neutral-200/60">
                        {founder.displayTitle}
                      </span>
                    </div>
                  </div>

                  {/* Founder Details Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-accent-700">
                          {founder.eyebrow}
                        </span>
                        {founder.isStatutoryProprietor && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Statutory Proprietor
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
                        {founder.name}
                      </h3>
                      <p className="text-xs font-semibold text-primary-900 font-sans">
                        {founder.focus}
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans pt-1">
                        {founder.bio}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-surface-border">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                        Core Directives
                      </span>
                      <ul className="space-y-1.5 text-xs text-neutral-600 font-sans">
                        {founder.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-accent-600 font-bold mt-0.5">▪</span>
                            <span className="leading-snug">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What We Supply: The 3 Core Export Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-y border-surface-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
              Our Core Export Portfolio
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Three Specialized Raw Material Categories
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Focused on manufacturer-grade consistency, standardized active biomarkers, and complete lot-by-lot lab certificates of analysis (COA).
            </p>
          </Reveal>

          <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreCategories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="p-8 rounded-2xl border border-surface-border bg-white shadow-subtle hover:shadow-card hover:border-accent-500/40 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="w-12 h-12 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center group-hover:bg-primary-900 group-hover:text-accent-400 transition-colors">
                        <IconComp className="w-6 h-6" />
                      </span>
                      <span className="font-mono text-[10px] font-bold text-accent-700 bg-accent-50 px-2.5 py-1 rounded-md border border-accent-200/50">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-neutral-900 group-hover:text-primary-900 transition-colors">
                      {cat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-neutral-100">
                    <Link
                      to={cat.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-900 hover:text-accent-600 transition-colors group-hover:translate-x-1 duration-150"
                    >
                      <span>Explore Category Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Interactive Sourcing Belts Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-12">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
              Pan-India Agricultural Procurement Map
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Direct-Origin Harvest Networks Across India
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
              We operate dedicated procurement touchpoints across India's most renowned commodity terroirs, ensuring primary grade quality and authentic geographic indications.
            </p>

            {/* Region Tabs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-neutral-200/60 border border-neutral-300/60 max-w-3xl mx-auto">
              {sourcingBelts.map((belt) => (
                <button
                  key={belt.id}
                  type="button"
                  onClick={() => setActiveBelt(belt.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap min-h-[44px] ${
                    activeBelt === belt.id
                      ? 'bg-primary-900 text-white shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  {belt.region.split(' (')[0]}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Active Sourcing Belt Detailed Display */}
          {(() => {
            const currentBelt = sourcingBelts.find((b) => b.id === activeBelt) || sourcingBelts[0];
            return (
              <Reveal key={currentBelt.id} direction="up" duration={0.4}>
                <div className="bg-surface-subtle rounded-2xl border border-surface-border p-8 sm:p-10 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 border border-accent-200 text-accent-800 text-xs font-semibold">
                      <Anchor className="w-3.5 h-3.5 text-accent-600" />
                      <span>{currentBelt.ports}</span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                      {currentBelt.region}
                    </h3>

                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {currentBelt.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                        Primary Export Commodities Sourced:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {currentBelt.commodities.map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-800"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-700 shrink-0" />
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 rounded-xl bg-white border border-primary-200/80 space-y-4 shadow-subtle">
                    <h4 className="font-serif text-base font-bold text-primary-950 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-primary-800" />
                      <span>Quality & Dispatch Guarantees</span>
                    </h4>
                    <ul className="space-y-2.5 text-xs text-neutral-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Pre-shipment batch testing for moisture, purity, and active biomarkers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Sortex optical color-cleaned to 99.0% – 99.5% minimum export purity.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Standard packaging in 25kg multi-wall paper, 50kg PP, or 1MT jumbo bags.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Direct container stuffing under supervised fumigation and moisture control.</span>
                      </li>
                    </ul>

                    <div className="pt-2">
                      <Link
                        to="/products"
                        className="text-xs font-bold text-primary-900 hover:text-accent-600 inline-flex items-center gap-1 group transition-colors"
                      >
                        <span>Explore Commodities From This Belt</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })()}
        </div>
      </section>

      {/* Confirmed Global Export Markets Served */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-y border-surface-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
              International Trade Destinations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Export Gateways & Global Markets Served
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Weekly containerized FCL shipments dispatched directly from Hazira Port, Mundra Port, and JNPT (Nhava Sheva) to major world discharge terminals.
            </p>
          </Reveal>

          <Reveal direction="up" cascade stagger={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exportMarkets.map((m, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-surface-border bg-white shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl" aria-hidden="true">{m.flag}</span>
                  <span className="font-mono text-[10px] font-bold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200/50">
                    {m.transit}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-neutral-900">
                  {m.region}
                </h3>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  <strong className="text-neutral-700">Discharge Hubs:</strong> {m.ports}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Official Legal & Regulatory Details Card */}
      <section id="legal-credentials" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
            <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>STATUTORY AUDITED ENTERPRISE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Our Legal & Regulatory Credentials
          </h2>

          <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Complete transparency before you commit. All statutory registration numbers are verified with Indian federal authorities and can be authenticated directly with customs and banking partners.
          </p>
        </Reveal>

        <Reveal direction="up" cascade stagger={0.05} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {legalDetails.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-surface-border bg-white shadow-subtle hover:shadow-card hover:border-primary-700/30 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center font-bold text-xs group-hover:bg-primary-900 group-hover:text-accent-400 transition-colors">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    <Check className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  {item.label}
                </span>

                <h3 className="font-serif text-base font-bold text-neutral-900 leading-snug break-words">
                  {item.value}
                </h3>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                {item.copyable ? (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.label, item.code)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-800 hover:text-accent-600 transition-colors min-h-[44px]"
                  >
                    {copiedKey === item.label ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Registration No.</span>
                      </>
                    )}
                  </button>
                ) : item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-800 hover:text-accent-600 transition-colors min-h-[44px]"
                  >
                    <span>View Official PDF</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-neutral-400 font-mono">Government Authenticated</span>
                )}
              </div>
            </div>
          ))}
        </Reveal>

        {/* Action link to Quality Page for Full Inspection */}
        <Reveal direction="up" className="mt-12 text-center">
          <Link
            to="/quality"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary-900 hover:text-accent-600 uppercase tracking-widest transition-colors duration-150 group"
          >
            <span>INSPECT ALL 6 GOVERNMENT CERTIFICATES WITH FULL RESOLUTION LIGHTBOX</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>
      </section>

      {/* The 10 Core Operational Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-y border-surface-border">
        <div className="max-w-7xl mx-auto">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-600 block mb-2">
              Our 10 Core Pillars
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
              Why Global Buyers Partner with JHS GLOBAL
            </h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Built on transparency, laboratory diligence, and single-point accountability across the entire export lifecycle.
            </p>
          </Reveal>

          <Reveal
            direction="up"
            cascade
            stagger={0.06}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-surface-border bg-white shadow-subtle hover:shadow-card hover:border-accent-500/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-accent-600 block mb-2">
                    PILLAR {p.num}
                  </span>
                  <h3 className="font-serif text-base font-bold text-neutral-900 mb-2 leading-snug group-hover:text-primary-800 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Sourcing Guarantee & Turnaround Promise */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-28 lg:pb-16">
        <UnlistedSourcingBanner />
      </section>
    </>
  );
};

export default AboutPage;
