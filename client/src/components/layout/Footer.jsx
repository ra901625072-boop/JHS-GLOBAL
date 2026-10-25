import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, FileText, ArrowUpRight, LockOpen, ArrowRight, Instagram } from 'lucide-react';
import { useCategories } from '../../features/products/hooks';

export const Footer = () => {
  const navigate = useNavigate();
  const brandName = import.meta.env.VITE_BRAND_NAME || 'JHS GLOBAL';

  const [firstClickFeedback, setFirstClickFeedback] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const { data: categoriesData } = useCategories();

  const triggerAdminLogin = useCallback(() => {
    setIsUnlocking(true);
    setTimeout(() => {
      navigate('/admin/login');
    }, 450);
  }, [navigate]);

  const handleLogoClick = (e) => {
    e.preventDefault();
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      setFirstClickFeedback(true);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        setFirstClickFeedback(false);
      }, 500);
    } else if (clickCountRef.current >= 2) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
      setFirstClickFeedback(false);
      triggerAdminLogin();
    }
  };

  const handleLogoDoubleClick = (e) => {
    e.preventDefault();
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickCountRef.current = 0;
    setFirstClickFeedback(false);
    triggerAdminLogin();
  };

  const divisions = [
    {
      name: 'Personal Care Raw Materials',
      slug: 'personal-care-raw-materials',
      chapter: 'Ch. 33',
    },
    {
      name: 'Nutraceutical Raw Materials',
      slug: 'nutraceutical-raw-materials',
      chapter: 'Ch. 13',
    },
    {
      name: 'Animal Feed',
      slug: 'animal-feed',
      chapter: 'Ch. 23',
    },
    {
      name: 'Food & Food Ingredients',
      slug: 'food-food-ingredients',
      chapter: 'Ch. 09',
    },
  ];

  const displayedDivisions = useMemo(() => {
    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      const topLevel = categoriesData.filter((c) => !c.parentId || c.level === 0 || c.level === 1);
      if (topLevel.length > 0) {
        return topLevel.slice(0, 4).map((c) => {
          let chapter = '';
          if (c.slug.includes('personal')) chapter = 'Ch. 33';
          else if (c.slug.includes('nutra')) chapter = 'Ch. 13';
          else if (c.slug.includes('feed')) chapter = 'Ch. 23';
          else if (c.slug.includes('food')) chapter = 'Ch. 09';
          return {
            name: c.name,
            slug: c.slug,
            chapter,
          };
        });
      }
    }
    return divisions;
  }, [categoriesData]);

  const keyProducts = [
    { name: 'Castor Oil & Derivatives', slug: 'castor-oil-and-derivatives' },
    { name: 'Sodium Lauryl Ether Sulfate (SLES)', slug: 'sodium-lauryl-ether-sulfate-sles' },
    { name: 'Ashwagandha Extract', slug: 'ashwagandha-extract' },
    { name: 'Turmeric / Curcumin Extract', slug: 'turmeric-curcumin-extract' },
    { name: 'Soybean Meal (DOC)', slug: 'soybean-meal' },
    { name: 'Feed-Grade Premixes', slug: 'feed-grade-vitamins-and-minerals' },
  ];

  return (
    <footer className="bg-primary-900 text-neutral-300 border-t border-primary-800">
      {/* Upper Pre-footer Banner */}
      <div className="border-b border-primary-800/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-2xl text-white font-semibold">
              Ready to procure in commercial FCL / MT volumes?
            </h3>
            <p className="text-neutral-400 text-sm mt-1">
              "Built for buyers who can't afford surprises." Binding proforma quote and compliance pack in 48 hours.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 rounded-md bg-cta-500 hover:bg-cta-600 text-white font-semibold text-sm transition-all shadow-card inline-flex items-center gap-2"
            >
              <span>Submit Detailed RFQ</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/sample-request"
              className="px-5 py-3 rounded-md border border-neutral-600 hover:border-accent-400 text-neutral-200 hover:text-accent-300 text-sm font-medium transition-all"
            >
              Request Product Samples
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Credentials */}
        <div className="lg:col-span-2">
          {/* Brand Logo with Secret Double-Click Admin Entrance */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleLogoClick}
            onDoubleClick={handleLogoDoubleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLogoClick(e);
              }
            }}
            title="Double-click to access Trade Desk Admin Portal"
            className="inline-flex items-center gap-3 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 rounded-lg p-1 -m-1 transition-all duration-200"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-sm tracking-tight shrink-0 transition-all duration-300 transform-gpu overflow-hidden ${
                isUnlocking
                  ? 'bg-accent-500 text-primary-950 scale-110 shadow-[0_0_24px_rgba(210,182,132,0.95)] ring-2 ring-accent-300'
                  : firstClickFeedback
                  ? 'bg-primary-800 text-accent-300 scale-105 ring-2 ring-accent-400/60 shadow-md p-1'
                  : 'bg-white border border-white/20 shadow-xs group-hover:scale-[1.03] p-1'
              }`}
            >
              {isUnlocking ? (
                <LockOpen className="w-5 h-5 text-primary-950 animate-bounce" />
              ) : (
                <img
                  src="/images/logo/logo-mark.png"
                  alt="JHS GLOBAL Logo"
                  className="w-full h-full object-contain"
                  width="40"
                  height="40"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl text-white tracking-tight group-hover:text-neutral-100 transition-colors">
                {brandName}
              </span>
              {isUnlocking ? (
                <span className="text-[10px] font-mono font-semibold text-accent-400 tracking-wider flex items-center gap-1 animate-pulse">
                  <span>Opening Admin Console</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              ) : firstClickFeedback ? (
                <span className="text-[10px] font-mono text-accent-300/80 tracking-wider">
                  Click once more...
                </span>
              ) : null}
            </div>
          </div>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed max-w-sm">
            At JHS GLOBAL, our commitment begins long before the shipment leaves India — and lasts long after it reaches you. Supplying export-grade food ingredients, personal care raw materials, botanical extracts, and animal feed directly to international manufacturers and commercial importers worldwide.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0" />
              <span>DGFT IEC Registered • APEDA, FIEO & Spices Board of India Member</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-400 shrink-0" />
              <span>FSSAI Central License (10725997001058) • GST & MSME Registered</span>
            </div>
          </div>

          {/* Social Follow Link (Client brief) */}
          <div className="mt-4 flex items-center gap-2">
            <a
              href="https://instagram.com/TODO_client"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent-400 hover:text-white transition-colors"
              aria-label="Follow JHS GLOBAL on Instagram"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow on Instagram</span>
            </a>
          </div>
        </div>

        {/* 3 Export Product Divisions */}
        <div>
          <h4 className="font-sans text-xs uppercase tracking-wider text-accent-400 font-semibold mb-4">
            Commercial Divisions
          </h4>
          <ul className="space-y-2 text-xs">
            {displayedDivisions.map((div) => (
              <li key={div.slug}>
                <Link
                  to={`/products?category=${div.slug}`}
                  className="hover:text-white transition-colors block py-0.5 font-medium flex items-center justify-between group"
                >
                  <span>{div.name}</span>
                  <span className="font-mono text-[10px] text-accent-400/80 group-hover:text-accent-300">
                    {div.chapter}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <h5 className="font-sans text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mt-5 mb-2.5">
            Key Export Lines
          </h5>
          <ul className="space-y-1.5 text-xs text-neutral-400">
            {keyProducts.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/products/${p.slug}`}
                  className="hover:text-neutral-200 transition-colors block truncate"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Trade & Export Information */}
        <div>
          <h4 className="font-sans text-xs uppercase tracking-wider text-accent-400 font-semibold mb-4">
            Company & Trade
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/about-us" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/quality" className="hover:text-white transition-colors">
                Our Certifications
              </Link>
            </li>
            <li>
              <Link to="/export-process" className="hover:text-white transition-colors">
                Export Process & Incoterms
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Request a Quote
              </Link>
            </li>
            <li>
              <Link to="/sample-request" className="hover:text-white transition-colors">
                Commercial Sample Policy
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-white transition-colors">
                Procurement FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Export Desk Contact */}
        <div>
          <h4 className="font-sans text-xs uppercase tracking-wider text-accent-400 font-semibold mb-4">
            Registered Office
          </h4>
          <div className="space-y-3 text-xs text-neutral-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                401, Shyam-A, Vatsalya Villa Residency, Chhaprabhatha Road, Amroli, Surat, Gujarat – 394107, India
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-accent-400 shrink-0" />
              <a href="mailto:info.jhsglobal@gmail.com" className="hover:text-white">
                info.jhsglobal@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-accent-400 shrink-0" />
              <a href="tel:+917202907720" className="hover:text-white">
                +91 7202907720 / +91 9724640101
              </a>
            </div>
            <div className="pt-2 border-t border-primary-800/80">
              <span className="block text-[11px] text-neutral-400">Supply Chain Control:</span>
              <span className="text-white font-medium">End-to-end multi-commodity consolidation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="border-t border-primary-800/80 py-6 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved. International B2B Trade Only.</p>
          <p className="text-neutral-400">
            Commercial terms: Prices strictly on formal request • Standard Incoterms 2020 (FOB / CIF / CFR)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
