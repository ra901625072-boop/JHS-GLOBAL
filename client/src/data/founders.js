/**
 * client/src/data/founders.js
 * 
 * Central Single Source of Truth for JHS GLOBAL Founders & Leadership.
 * Consumed by:
 * - About Us page (client/src/pages/About/index.jsx)
 * - SEO Structured Data / JSON-LD (client/src/components/seo/JsonLd.jsx)
 * - Regression test suites & AI assistant grounding
 * 
 * Order & Content: 100% verbatim copy from client approved document.
 * 1. Jay Prajapati (Founder & CEO | JHS GLOBAL)
 * 2. Suraj Prajapati (Co-Founder | Sourcing & Operations)
 * 3. Henil Prajapati (Co-Founder | Commercial Development & Marketing)
 */

export const FOUNDERS = [
  {
    id: 'jay-prajapati',
    order: 1,
    name: 'Jay Prajapati',
    legalName: 'Jay Sureshbhai Prajapati',
    role: 'Founder & CEO | JHS GLOBAL',
    displayTitle: 'Founder & CEO',
    eyebrow: 'Executive Leadership',
    isStatutoryProprietor: true,
    tagline: 'From local markets to global ambitions.',
    bioParagraphs: [
      "With six years of entrepreneurial experience in FMCG and spice distribution and trading, Jay built his business foundation by serving hundreds of clients across the domestic market. Originally from the spice city of India — Unjha, Gujarat, he developed a strong understanding of India's spice trade through hands-on experience and a passion for business.",
      "Driven by an ambition to take his entrepreneurial vision global, Jay pursued professional export training and subsequently worked for two years as an International Sales Executive with a reputed Indian food export company. During this time, he handled international business deals with clients in Australia, the USA, and Italy, while managing and developing business enquiries from markets across the globe.",
      "At JHS GLOBAL, Jay leads international business development, sales, and buyer relationships, bringing a hands-on approach to negotiations and a strong commitment to building lasting partnerships."
    ],
    // Primary summary excerpt for collapsed card state
    bioExcerpt:
      "With six years of entrepreneurial experience in FMCG and spice distribution and trading, Jay built his business foundation by serving hundreds of clients across the domestic market. Originally from the spice city of India — Unjha, Gujarat, he developed a strong understanding of India's spice trade through hands-on experience and a passion for business.",
    philosophyTitle: 'His Philosophy',
    philosophyQuote:
      "Business is not just about using your mind to make decisions; it's about putting your heart into building relationships. Trust is earned through honesty, and every commitment deserves to be fulfilled.",
    philosophyReflection:
      "For Jay, a buyer's trust is more than a business achievement — it's his most valuable reward.",
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
    alt: 'Jay Prajapati, Founder & CEO, JHS GLOBAL',
    aspectRatio: '3/4',
    verifiedFlags: {
      statutoryProprietor: true,
      photoConfirmed: true,
      sixYearsExperienceConfirmed: false, // TODO(client)
      internationalSalesBackgroundConfirmed: false, // TODO(client)
    },
  },
  {
    id: 'suraj-prajapati',
    order: 2,
    name: 'Suraj Prajapati',
    role: 'Co-Founder | Sourcing & Operations',
    displayTitle: 'Co-Founder, Sourcing & Operations',
    eyebrow: 'Operations & Procurement',
    isStatutoryProprietor: false,
    tagline: 'Turning commitments into carefully executed results.',
    bioParagraphs: [
      "Suraj brings a practical, solution-driven mindset and extensive business experience to JHS GLOBAL. Known for his sharp judgment and determination, he approaches every challenge with one objective: finding the right solution and seeing the job through to completion.",
      "At JHS GLOBAL, he plays a hands-on role in domestic sourcing, supplier coordination, and order execution. From monitoring production and processing to overseeing packaging and quality checks, Suraj stays closely involved at every critical stage, helping ensure that orders progress according to agreed requirements and timelines.",
      "His approach goes beyond coordination. He believes that quality and reliability are built through active involvement, attention to detail, and accountability at every stage of execution."
    ],
    bioExcerpt:
      "Suraj brings a practical, solution-driven mindset and extensive business experience to JHS GLOBAL. Known for his sharp judgment and determination, he approaches every challenge with one objective: finding the right solution and seeing the job through to completion.",
    philosophyTitle: 'His Philosophy',
    philosophyQuote:
      "A job isn't done just because it's completed on paper. It's done when every detail has been taken care of and the result meets the commitment.",
    philosophyReflection: null,
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
    alt: 'Suraj Prajapati, Co-Founder, Sourcing & Operations, JHS GLOBAL',
    aspectRatio: '3/4',
    verifiedFlags: {
      statutoryProprietor: false,
      photoConfirmed: true,
    },
  },
  {
    id: 'henil-prajapati',
    order: 3,
    name: 'Henil Prajapati',
    role: 'Co-Founder | Commercial Development & Marketing',
    displayTitle: 'Co-Founder, Commercial Development & Marketing',
    eyebrow: 'Commercial Development & Trade',
    isStatutoryProprietor: false,
    tagline: 'The courage to pursue opportunities others might overlook.',
    bioParagraphs: [
      "Henil brings boldness, persistence, and a sharp instinct for negotiation to JHS GLOBAL. With a natural ability to navigate commercial discussions and pursue opportunities, he believes that a small possibility is still worth exploring when the determination to make it work is strong enough.",
      "From business marketing and buyer outreach to regulatory coordination and commercial negotiations, Henil approaches his responsibilities with discipline, initiative, and a hands-on attitude. He is not one to step back simply because a challenge feels unfamiliar; instead, he is willing to step forward, learn, and find a way to move things ahead."
    ],
    bioExcerpt:
      "Henil brings boldness, persistence, and a sharp instinct for negotiation to JHS GLOBAL. With a natural ability to navigate commercial discussions and pursue opportunities, he believes that a small possibility is still worth exploring when the determination to make it work is strong enough.",
    philosophyTitle: 'His Philosophy',
    philosophyQuote:
      "Business rewards those who dare to ask, negotiate with confidence, and turn possibilities into opportunities.",
    philosophyReflection: null,
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
    alt: 'Henil Prajapati, Co-Founder, Commercial Development & Marketing, JHS GLOBAL',
    aspectRatio: '3/4',
    verifiedFlags: {
      statutoryProprietor: false,
      photoConfirmed: true,
    },
  },
];

export default FOUNDERS;
