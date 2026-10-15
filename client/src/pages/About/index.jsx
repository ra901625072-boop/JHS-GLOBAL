import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Check,
  HeartHandshake,
  Compass,
  Eye,
  AlertCircle,
  RefreshCw,
  Quote,
  Scale,
  FileCheck2,
  Sparkles,
  Anchor,
  Award,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Reveal from '../../components/ui/Reveal';
import WhatsAppIcon from '../../components/common/WhatsAppIcon';
import FounderCard from '../../components/about/FounderCard';
import AboutSkeleton from '../../components/about/AboutSkeleton';
import UnlistedSourcingBanner from '../../components/common/UnlistedSourcingBanner';
import { JsonLd, createOrganizationSchema } from '../../components/seo/JsonLd';
import { ABOUT_CONTENT } from '../../data/aboutContent';
import { FOUNDERS } from '../../data/founders';

export const AboutPage = ({ isLoading = false, isError = false, onRetry }) => {
  const brandName = 'JHS GLOBAL';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720';
  const { hero, foundation, missionVisionValues, commitments, closing } = ABOUT_CONTENT;

  if (isLoading) {
    return <AboutSkeleton />;
  }

  if (isError) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-24 bg-surface-canvas">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-surface-border shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900">
            Unable to Load About Us
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed font-sans">
            We encountered a temporary network issue loading company details. Please try refreshing.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={onRetry || (() => window.location.reload())}
              className="w-full justify-center min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Retry Loading</span>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Helmet>
        <title>About Us — JHS GLOBAL | Indian Export House Built on Trust & Transparency</title>
        <meta
          name="description"
          content="An export house built on trust, transparency and Indian abundance. Meet our founders: Jay Prajapati (Founder & CEO), Suraj Prajapati (Co-Founder, Sourcing & Operations), and Henil Prajapati (Co-Founder, Commercial Development & Marketing)."
        />
        <link rel="canonical" href={`${import.meta.env.VITE_CLIENT_URL || 'https://jhsglobal.com'}/about-us`} />
      </Helmet>
      <JsonLd data={createOrganizationSchema()} />

      {/* 1. HERO / OPENING SECTION (Matches PageHeader signature design) */}
      <section
        className="relative bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-primary-800/80 overflow-hidden"
        aria-labelledby="about-hero-heading"
      >
        {/* Subtle Brand Pattern & Soft Ambient Drift Glow */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Eyebrow, H1, Subheadline, Lead Paragraph */}
            <div className="lg:col-span-7 space-y-6">
              <Reveal direction="up">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-sans font-semibold tracking-wide shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{hero.badge}</span>
                </div>
              </Reveal>

              <Reveal direction="up" delay={0.08}>
                <h1
                  id="about-hero-heading"
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]"
                >
                  {hero.headline}
                </h1>
              </Reveal>

              <Reveal direction="up" delay={0.14}>
                <p className="font-serif text-xl sm:text-2xl text-accent-300 italic font-medium leading-snug">
                  {hero.subheadline}
                </p>
              </Reveal>

              <Reveal direction="up" delay={0.2}>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans max-w-2xl">
                  {hero.leadParagraph}
                </p>
              </Reveal>
            </div>

            {/* Right Column: Signature Punchline Quote Box (Placed in the right side box area) */}
            <div className="lg:col-span-5">
              <Reveal direction="up" delay={0.25}>
                <div className="p-7 sm:p-9 rounded-3xl bg-white/[0.05] text-white shadow-2xl border border-accent-400/30 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-accent-400/50 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-accent-500/15 border border-accent-400/30 flex items-center justify-center text-accent-400 shadow-inner">
                      <Quote className="w-6 h-6 text-accent-400" />
                    </div>
                    <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl text-neutral-100 font-semibold leading-relaxed">
                      "{hero.punchline}"
                    </blockquote>
                  </div>
                  <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-sans relative z-10">
                    <span className="text-accent-300 font-semibold uppercase tracking-wider text-[11px]">
                      Export Quality Pledge
                    </span>
                    <span className="text-neutral-400 text-[11px] font-sans">
                      {brandName}
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR FOUNDATION SECTION */}
      <section
        id="foundation"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-labelledby="foundation-heading"
      >
        <div className="space-y-16">
          <Reveal direction="up" className="max-w-3xl">
            <span className="text-xs font-sans font-semibold uppercase tracking-widest text-accent-800 block mb-2">
              Core Tenets
            </span>
            <h2
              id="foundation-heading"
              className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
            >
              {foundation.sectionHeading}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed font-sans max-w-2xl">
              The operational principles and commercial ethics that govern every export commitment.
            </p>
          </Reveal>

          {/* 3 Pillars Grid */}
          <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {foundation.pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="p-8 rounded-2xl bg-white border border-surface-border shadow-subtle hover:border-primary-700/40 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-primary-900 bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center border border-primary-200 group-hover:bg-primary-900 group-hover:text-accent-400 group-hover:border-primary-900 transition-all duration-300 shadow-xs">
                      {pillar.num}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-sans font-semibold text-accent-800 bg-accent-50 px-2.5 py-1 rounded-md border border-accent-200/60 uppercase tracking-wider">
                        CORE PILLAR
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-surface-subtle text-accent-700 flex items-center justify-center border border-surface-border">
                        {pillar.num === '01' ? (
                          <Scale className="w-4 h-4 text-accent-700" />
                        ) : pillar.num === '02' ? (
                          <Award className="w-4 h-4 text-accent-700" />
                        ) : (
                          <Anchor className="w-4 h-4 text-accent-700" />
                        )}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 group-hover:text-primary-900 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
                    {pillar.text}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>

          <hr className="border-t border-surface-border my-12" />

          {/* Merchants of the Everyday Extraordinary Story */}
          <div className="space-y-12">
            <Reveal direction="up">
              <div className="rounded-2xl bg-white border border-surface-border p-8 sm:p-10 shadow-subtle space-y-6 relative overflow-hidden">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-800 text-xs font-sans font-semibold border border-accent-200/60">
                    <Sparkles className="w-3.5 h-3.5 text-accent-600" />
                    <span>EXPORT OPERATIONS PHILOSOPHY</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 leading-snug">
                    {foundation.story.subheadline}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base text-neutral-700 leading-relaxed font-sans pt-4 border-t border-surface-border">
                  <p>{foundation.story.paragraph1}</p>
                  <p>{foundation.story.paragraph2}</p>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-surface-border text-xs font-sans font-medium text-neutral-600">
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent-600" /> Direct Origin Sourcing</span>
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent-600" /> Zero Intermediate Markups</span>
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent-600" /> Guaranteed Batch Specification</span>
                </div>
              </div>
            </Reveal>

            {/* Operating Principles: Supply What Was Agreed & Be Clear and Accountable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
              {foundation.principles.map((pr, idx) => (
                <Reveal key={pr.id} direction="up" delay={0.1 * (idx + 1)}>
                  <div className="p-8 rounded-2xl bg-white border border-surface-border shadow-subtle hover:border-primary-700/40 hover:shadow-card hover:-translate-y-1 transition-all duration-300 space-y-4 h-full flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-900 flex items-center justify-center border border-primary-200 group-hover:bg-primary-900 group-hover:text-accent-400 group-hover:border-primary-900 transition-all duration-300 shadow-xs">
                        {idx === 0 ? (
                          <Scale className="w-5 h-5 text-primary-800 group-hover:text-accent-400 transition-colors" />
                        ) : (
                          <FileCheck2 className="w-5 h-5 text-primary-800 group-hover:text-accent-400 transition-colors" />
                        )}
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-primary-900 transition-colors">
                        {pr.title}
                      </h4>
                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
                        {pr.text}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-neutral-100 flex items-center gap-2 text-xs font-sans text-accent-800 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                      <span>{idx === 0 ? 'Strict Origin Contract Term' : 'Verifiable Audit Protocol'}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Anchor Goal Statement */}
            <Reveal direction="up" delay={0.2}>
              <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white shadow-xl border border-accent-500/30 flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-2 text-center sm:text-left relative z-10 max-w-2xl">
                  <span className="font-sans text-xs uppercase tracking-wider text-accent-300 font-semibold block">
                    Our Anchor Goal
                  </span>
                  <p className="font-serif text-base sm:text-lg md:text-xl font-medium text-neutral-100 italic leading-relaxed">
                    "{foundation.goal}"
                  </p>
                </div>
                <Link to="/contact" className="shrink-0 relative z-10 w-full sm:w-auto">
                  <Button
                    size="md"
                    className="w-full sm:w-auto whitespace-nowrap font-bold text-neutral-950 bg-cta-400 hover:bg-cta-300 shadow-md"
                  >
                    <span>Discuss Your Requirements</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. MISSION, VISION AND VALUES SECTION */}
      <section
        id="mission-vision-values"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-y border-surface-border"
        aria-labelledby="mission-vision-heading"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-sans font-semibold uppercase tracking-widest text-accent-800 block mb-2">
              Strategic Orientation
            </span>
            <h2
              id="mission-vision-heading"
              className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
            >
              {missionVisionValues.sectionHeading}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans max-w-2xl mx-auto">
              Clear institutional direction, long-range international ambition, and uncompromising commercial ethics.
            </p>
          </Reveal>

          {/* Mission and Vision Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Mission Card (7 cols) */}
            <Reveal direction="up" delay={0.08} className="lg:col-span-7 flex flex-col">
              <div className="p-8 sm:p-10 rounded-2xl bg-white border border-surface-border border-l-4 border-l-primary-800 shadow-subtle hover:shadow-card transition-all duration-300 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-800 text-xs font-sans font-semibold border border-accent-200/60">
                    <Compass className="w-3.5 h-3.5 text-accent-600" />
                    <span>OUR MISSION</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug">
                    {missionVisionValues.mission.title}
                  </h3>
                  <div className="space-y-4 pt-2">
                    {missionVisionValues.mission.statements.map((stmt, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-3.5">
                        <span className="w-7 h-7 rounded-lg bg-primary-50 text-primary-900 border border-primary-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-sans">
                          {stmt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Vision Card (5 cols) */}
            <Reveal direction="up" delay={0.14} className="lg:col-span-5 flex flex-col">
              <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white shadow-xl border border-accent-500/30 flex-1 flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-sans font-semibold border border-white/20">
                    <Eye className="w-3.5 h-3.5 text-accent-300" />
                    <span>OUR VISION</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-100 leading-snug">
                    {missionVisionValues.vision.title}
                  </h3>
                  <blockquote className="font-serif text-lg sm:text-xl text-neutral-200 italic leading-relaxed pt-2">
                    "{missionVisionValues.vision.statement}"
                  </blockquote>
                </div>
                <div className="pt-6 border-t border-primary-800/80 text-xs text-neutral-300 font-sans flex items-center gap-2 flex-wrap relative z-10">
                  <span className="text-neutral-400">Target Sectors:</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-accent-300 border border-white/15">Food</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-accent-300 border border-white/15">Wellness</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-accent-300 border border-white/15">Beauty</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Values Row / Chips */}
          <Reveal direction="up" delay={0.2} className="space-y-4">
            <div className="p-8 sm:p-10 rounded-2xl bg-white border border-surface-border shadow-subtle space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-surface-border pb-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-accent-600" />
                  <span>{missionVisionValues.values.title}</span>
                </h3>
                <span className="font-sans text-xs text-neutral-500">
                  Ethical Commercial Conduct
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {missionVisionValues.values.items.map((val, vIdx) => (
                  <div
                    key={vIdx}
                    className="p-4 rounded-xl bg-surface-subtle border border-surface-border/90 flex flex-col justify-between space-y-2 hover:border-primary-700/40 hover:shadow-subtle hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className="font-mono text-xs font-bold text-primary-900 bg-primary-50 px-2 py-0.5 rounded border border-primary-200 inline-block w-fit">
                      VALUE 0{vIdx + 1}
                    </span>
                    <p className="font-sans text-sm font-semibold text-neutral-900 leading-snug">
                      {val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. THREE GUIDING COMMITMENTS */}
      <section
        id="commitments"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-labelledby="commitments-heading"
      >
        <div className="space-y-16">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-sans font-semibold uppercase tracking-widest text-accent-800 block mb-2">
              {commitments.sectionEyebrow}
            </span>
            <h2
              id="commitments-heading"
              className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
            >
              {commitments.sectionHeading}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
              Concrete operational promises that transform buyer risk into predictable supply continuity.
            </p>
          </Reveal>

          <Reveal direction="up" cascade stagger={0.08} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {commitments.items.map((cm) => (
              <div
                key={cm.id}
                className="p-8 sm:p-9 rounded-2xl bg-white border border-surface-border shadow-subtle hover:border-primary-700/40 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-primary-900 bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center border border-primary-200 group-hover:bg-primary-900 group-hover:text-accent-400 group-hover:border-primary-900 transition-all duration-300 shadow-xs">
                      {cm.num}
                    </span>
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 group-hover:text-primary-900 transition-colors">
                    {cm.title}
                  </h3>

                  <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                    {cm.text}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center gap-2 text-xs font-sans text-accent-800 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                  <span>Guaranteed Commercial Term</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5. MEET OUR TEAM / FOUNDERS SECTION (Integrated with Option A inline expanders) */}
      <section
        id="leadership-founders"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-surface-subtle border-y border-surface-border"
        aria-labelledby="founders-heading"
        data-testid="founders-section"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          <Reveal direction="up" className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-sans font-semibold uppercase tracking-widest text-accent-800 block mb-2">
              Leadership & Governance
            </span>
            <h2
              id="founders-heading"
              className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight"
            >
              Meet our team
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
              Three minds united by trust, accountable execution, and direct involvement across every stage of the export lifecycle.
            </p>
          </Reveal>

          {/* 3 Equal Founder Dossier Cards (Jay -> Suraj -> Henil) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {FOUNDERS.map((founder, idx) => (
              <Reveal key={founder.id} direction="up" delay={0.08 * (idx + 1)}>
                <FounderCard founder={founder} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CLOSING DECLARATION & GLOBAL CONVERSION CTA */}
      <section
        id="closing-statement"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#06180E] via-[#0A2619] to-[#04120A] text-white relative overflow-hidden border-t border-primary-800/80"
        aria-labelledby="closing-heading"
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none animate-ambient-drift" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <Reveal direction="up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-xs font-sans font-semibold tracking-widest uppercase mb-2 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-400" />
              <span>JHS GLOBAL LEADERSHIP PLEDGE</span>
            </div>
            <h2
              id="closing-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight"
            >
              {closing.heading}
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <p className="font-serif text-lg sm:text-xl md:text-2xl text-neutral-200 italic font-medium leading-relaxed max-w-2xl mx-auto">
              "{closing.statement}"
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.18} className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={closing.ctaLink} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-h-[48px] px-8 text-sm font-bold tracking-wide shadow-md text-neutral-950 bg-cta-400 hover:bg-cta-300"
              >
                <span>{closing.ctaText}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                'Hello JHS GLOBAL Export Desk, I would like to inquire about container export pricing for commodities.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[48px] px-8 inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-150 active:scale-[0.98]"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>{closing.secondaryCtaText}</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* 7. UNLISTED SOURCING GUARANTEE BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-28 lg:pb-16">
        <UnlistedSourcingBanner />
      </section>
    </>
  );
};

export default AboutPage;
