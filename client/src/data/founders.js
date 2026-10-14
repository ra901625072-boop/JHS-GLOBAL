/**
 * Central Single Source of Truth for JHS Global Founders & Leadership.
 * Consumed by:
 * - About Us page (client/src/pages/About/index.jsx)
 * - SEO Structured Data / JSON-LD (client/src/components/seo/JsonLd.jsx)
 * - Regression test suites
 *
 * All biographical and operational notes strictly reflect verified company facts.
 * Specific unconfirmed partner details remain marked TODO(client).
 */

export const FOUNDERS = [
  {
    id: 'jay-prajapati',
    name: 'Jay Prajapati',
    legalName: 'Jay Sureshbhai Prajapati',
    role: 'Founder',
    displayTitle: 'Founder',
    eyebrow: 'Executive Leadership',
    isStatutoryProprietor: true,
    focus: 'Corporate Governance & Trade Compliance',
    bio: 'Directs statutory compliance, international banking under ICC Incoterms 2020, and corporate governance across cross-border consignments.',
    responsibilities: [
      'Statutory export licensing & government liaison',
      'Letter of Credit (LC) & banking trade finance',
      'Port authority & customs clearance oversight',
    ],
    social: {
      linkedin: null, // TODO(client: supply verified LinkedIn profile)
    },
    images: {
      avif: '/images/about/founder-jay-768w.avif',
      webp: '/images/about/founder-jay-768w.webp',
      jpg: '/images/about/founder-jay-768w.jpg',
      srcSetAvif:
        '/images/about/founder-jay-384w.avif 384w, /images/about/founder-jay-480w.avif 480w, /images/about/founder-jay-768w.avif 768w',
      srcSetWebp:
        '/images/about/founder-jay-384w.webp 384w, /images/about/founder-jay-480w.webp 480w, /images/about/founder-jay-768w.webp 768w',
      srcSetJpg:
        '/images/about/founder-jay-384w.jpg 384w, /images/about/founder-jay-480w.jpg 480w, /images/about/founder-jay-768w.jpg 768w',
      blur: '/images/about/founder-jay-blur.jpg',
    },
    alt: 'Jay Prajapati, Founder at JHS Global standing in navy suit blazer',
    aspectRatio: '3/4',
  },
  {
    id: 'henil-prajapati',
    name: 'Henil Prajapati',
    role: 'Founder',
    displayTitle: 'Founder',
    eyebrow: 'Executive Leadership',
    isStatutoryProprietor: false,
    focus: 'Global Logistics & Trade Desk Operations',
    bio: 'Oversees multimodal dispatch logistics, maritime container coordination, and end-to-end documentation integrity from factory floor to seaport terminal.',
    responsibilities: [
      'Container dispatch & port terminal coordination',
      '48-hour commercial quotation turnaround',
      'Freight forwarder & carrier rate negotiation',
    ],
    social: {
      linkedin: null, // TODO(client: supply verified LinkedIn profile)
    },
    images: {
      avif: '/images/about/founder-henil-768w.avif',
      webp: '/images/about/founder-henil-768w.webp',
      jpg: '/images/about/founder-henil-768w.jpg',
      srcSetAvif:
        '/images/about/founder-henil-384w.avif 384w, /images/about/founder-henil-480w.avif 480w, /images/about/founder-henil-768w.avif 768w',
      srcSetWebp:
        '/images/about/founder-henil-384w.webp 384w, /images/about/founder-henil-480w.webp 480w, /images/about/founder-henil-768w.webp 768w',
      srcSetJpg:
        '/images/about/founder-henil-384w.jpg 384w, /images/about/founder-henil-480w.jpg 480w, /images/about/founder-henil-768w.jpg 768w',
      blur: '/images/about/founder-henil-blur.jpg',
    },
    alt: 'Henil Prajapati, Founder at JHS Global standing in black tailored suit',
    aspectRatio: '3/4',
  },
  {
    id: 'suraj-prajapati',
    name: 'Suraj Prajapati',
    role: 'Founder',
    displayTitle: 'Founder',
    eyebrow: 'Executive Leadership',
    isStatutoryProprietor: false,
    focus: 'Procurement & Raw Material Qualification',
    bio: 'Leads direct manufacturer qualification, standardized batch testing protocol enforcement, and contract fulfillment across all export divisions.',
    responsibilities: [
      'Direct manufacturer & processor vendor audits',
      '48-hour unlisted raw material sourcing desk',
      'COA verification & independent lab testing oversight',
    ],
    social: {
      linkedin: null, // TODO(client: supply verified LinkedIn profile)
    },
    images: {
      avif: '/images/about/founder-suraj-768w.avif',
      webp: '/images/about/founder-suraj-768w.webp',
      jpg: '/images/about/founder-suraj-768w.jpg',
      srcSetAvif:
        '/images/about/founder-suraj-384w.avif 384w, /images/about/founder-suraj-480w.avif 480w, /images/about/founder-suraj-768w.avif 768w',
      srcSetWebp:
        '/images/about/founder-suraj-384w.webp 384w, /images/about/founder-suraj-480w.webp 480w, /images/about/founder-suraj-768w.webp 768w',
      srcSetJpg:
        '/images/about/founder-suraj-384w.jpg 384w, /images/about/founder-suraj-480w.jpg 480w, /images/about/founder-suraj-768w.jpg 768w',
      blur: '/images/about/founder-suraj-blur.jpg',
    },
    alt: 'Suraj Prajapati, Founder at JHS Global seated at desk with globe and laptop',
    aspectRatio: '3/4',
  },
];

export default FOUNDERS;
