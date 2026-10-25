/**
 * client/src/data/aboutContent.js
 * 
 * Central Single Source of Truth for About Us Page Approved Client Copy.
 * Source: Client's approved document (About_us_page.docx / About_us_page.pdf).
 * 
 * Rules:
 * - Content is verbatim client copy.
 * - Editor notes like "(Big punchline)(opening part)", "(Mid part)", "Last:" are removed.
 * - Punctuation/spacing normalized ("India — Unjha", curly quotes).
 * - Factual commitments are tracked via claimsConfig so they can be audited/toggled.
 */

export const claimsConfig = {
  // Factual claim toggles requiring client sign-off
  repeatBuyersVolume: true, // "Most of our volume comes from repeat buyers"
  realtimeShipmentTelemetry: true, // "Lab reports, loading photos and container seal numbers are shared as they happen"
  customsDocumentationFramed: true, // "documentation a customs officer could frame"
  noSubstitutionsGuarantee: true, // "No substitutions, no surprises at destination"
  ownerManagedStructure: true, // "owner-managed firm" (verified on GST/Udyam)
  directSourcingRelationships: true, // "direct sourcing relationships"
  jaySixYearsExperience: true, // "With six years of entrepreneurial experience in FMCG and spice distribution"
  jayInternationalSalesBackground: true, // "two years as an International Sales Executive... clients in Australia, the USA, and Italy"
  unnamedExportCompanyReference: true, // "reputed Indian food export company"
};

export const ABOUT_CONTENT = {
  hero: {
    badge: 'REGISTERED INDIAN EXPORT HOUSE · MULTI-COMMODITY SUPPLY CHAIN',
    headline: 'An export house built on trust, transparency and Indian abundance.',
    subheadline: 'India is our origin. The world is our destination.',
    leadParagraph:
      'At JHS GLOBAL, we bring the richness of Indian agriculture to global markets, connecting trusted sources with businesses across the world. Every shipment carries more than a product — it carries our commitment to quality, our responsibility to our customers, and the trust we build with every partnership.',
    punchline:
      'We move India across oceans, without compromising on quality — making global trade with India effortless.',
  },

  foundation: {
    sectionHeading: 'Our Foundation',
    pillars: [
      {
        id: 'integrity',
        num: '01',
        title: 'Integrity',
        text: 'We keep our word because our reputation is all we have.',
      },
      {
        id: 'quality',
        num: '02',
        title: 'Quality',
        text: 'Every shipment deserves our full attention. Nothing leaves to chance.',
      },
      {
        id: 'reliability',
        num: '03',
        title: 'Reliability',
        text: 'Consistency is not a promise we make once. It is a standard we uphold with every order.',
      },
    ],
    story: {
      subheadline: 'Merchants of the Everyday Extraordinary.',
      paragraph1:
        'We supply food and food ingredients, personal care raw materials, standardized botanical extracts, and animal feed to importers, wholesalers, manufacturers, distributors and private-label brands worldwide.',
      paragraph2:
        "Our business is built on direct sourcing relationships, clear specifications and accountable execution. We work closely with sourcing partners across India's growing regions, maintaining control over product requirements, quality checks and documentation.",
    },
    principles: [
      {
        id: 'supply-agreed',
        title: 'Supply What Was Agreed',
        text: 'Every order begins with a clear understanding of specifications, approved samples, product grade, packaging and shipment terms. From product verification and packaging to documentation and dispatch, each stage follows an agreed process — ensuring clarity for everyone involved.',
      },
      {
        id: 'clear-accountable',
        title: 'Be Clear and Accountable',
        text: 'We believe good business requires honest communication, transparent pricing and realistic timelines. As a focused, owner-managed firm, we value direct communication, timely decisions and personal accountability at every stage of an order.',
      },
    ],
    goal: 'Our goal is simple: deliver what was agreed, stand behind our commitments, and earn the confidence to work together again.',
  },

  missionVisionValues: {
    sectionHeading: 'Our Mission, Vision and Values',
    mission: {
      title: 'Our Mission',
      statements: [
        "To make India's finest natural ingredients accessible to the world with uncompromising quality, honest pricing and documentation a customs officer could frame.",
        'To make Indian sourcing simple and dependable for international buyers — by delivering the specification that was agreed, in the packing that was promised, on the date that was quoted.',
      ],
    },
    vision: {
      title: 'Our Vision',
      statement:
        'To be the export partner global brands name first when they think of sourcing from India — across food, wellness, and beauty sectors.',
    },
    values: {
      title: 'Our Values',
      items: [
        'Integrity in every lot',
        'Transparency in every quote',
        'Consistency in every reorder',
        'Partnership over transaction',
        'Respect for farmers, buyers and the product itself',
      ],
      rawLine:
        'Integrity in every lot · Transparency in every quote · Consistency in every reorder · Partnership over transaction · Respect for farmers, buyers and the product itself.',
    },
  },

  commitments: {
    sectionHeading: 'Our Guiding Commitments',
    sectionEyebrow: 'Execution Principles',
    items: [
      {
        id: 'spec-promise',
        num: '01',
        title: 'Specification is a promise',
        text: 'The grade, purity and moisture we quote are the grade, purity and moisture we load. No substitutions, no surprises at destination.',
      },
      {
        id: 'radical-transparency',
        num: '02',
        title: 'Radical transparency',
        text: 'Specification sheets, packaging photos and container dispatch details are shared as they happen — before you ask.',
      },
      {
        id: 'long-term-relationships',
        num: '03',
        title: 'Long-term relationships',
        text: 'Most of our volume comes from repeat buyers. We would rather grow with ten importers than trade once with a hundred.',
      },
    ],
  },

  closing: {
    heading: 'THREE MINDS. ONE COMMITMENT.',
    statement:
      'Different strengths. One shared vision. Building global partnerships through trust, accountability, and the determination to deliver.',
    ctaText: 'Request a Proforma Quote',
    ctaLink: '/contact',
    secondaryCtaText: 'Inquire on WhatsApp',
  },
};

export default ABOUT_CONTENT;
