import Testimonial from '../modules/testimonial/testimonial.model.js';
import MarketRegion from '../modules/marketRegion/marketRegion.model.js';
import Faq from '../modules/faq/faq.model.js';
import logger from '../utils/logger.js';

export const seedTrustData = async () => {
  logger.info('Seeding testimonials, market regions, and FAQs...');

  // 1. Testimonials (Aligned with Personal Care, Nutraceutical, and Animal Feed)
  const testimonials = [
    {
      name: 'Dr. Klaus Reinhardt',
      designation: 'Head of Raw Material Procurement',
      company: 'AuraCare Cosmetics GmbH',
      country: 'Germany',
      flag: '🇩🇪',
      text: 'We procure regular 20ft FCL shipments of Refined Castor Oil derivatives and cosmetic active ingredients. The batch-to-batch consistency, low acid value, and thorough technical documentation make them a dependable Indian raw material partner.',
      rating: 5,
      order: 1,
    },
    {
      name: 'Tariq Al-Mansoor',
      designation: 'Director of Feed Milling Operations',
      company: 'Emirates Livestock & Feed Mill LLC',
      country: 'United Arab Emirates',
      flag: '🇦🇪',
      text: 'Their high-protein Non-GMO Soybean Meal (DOC) and Rapeseed Meal consistently meet our protein solubility benchmarks. Vessel arrivals at Jebel Ali are on schedule with complete fumigation and phytosanitary documentation.',
      rating: 5,
      order: 2,
    },
    {
      name: 'David Sterling',
      designation: 'VP of Botanical Supply Chain',
      company: 'PureBotanica Labs Inc.',
      country: 'United States',
      flag: '🇺🇸',
      text: 'Their HPLC-standardized Ashwagandha and 95% Curcumin extract pass all third-party laboratory microbiological and heavy metal screening without issue. Direct technical communication on COA specifications is transparent and professional.',
      rating: 5,
      order: 3,
    },
  ];

  for (const t of testimonials) {
    let item = await Testimonial.findOne({ where: { order: t.order } });
    if (item) {
      await item.update(t);
    } else {
      await Testimonial.create(t);
    }
  }

  // 2. Market Regions
  const regions = [
    {
      region: 'Middle East & GCC',
      description: 'Major transit hub with direct weekly vessel sailings from Mundra and Nhava Sheva (JNPT).',
      transitDays: '4–7 Days',
      order: 1,
      countries: [
        { name: 'United Arab Emirates', code: 'AE', ports: ['Jebel Ali (AEJEA)', 'Abu Dhabi (AEAUH)'] },
        { name: 'Saudi Arabia', code: 'SA', ports: ['Jeddah Islamic Port (SAJED)', 'Dammam (SADMM)'] },
        { name: 'Qatar', code: 'QA', ports: ['Hamad Port (QAHMD)'] },
        { name: 'Oman', code: 'OM', ports: ['Sohar (OMSOH)', 'Salalah (OMSLL)'] },
        { name: 'Kuwait', code: 'KW', ports: ['Shuwaikh Port (KWSWK)'] },
      ],
    },
    {
      region: 'Europe & United Kingdom',
      description: 'Strict adherence to EU MRL thresholds, aflatoxin testing, and ethylene oxide (ETO) absence declarations.',
      transitDays: '20–26 Days',
      order: 2,
      countries: [
        { name: 'Germany', code: 'DE', ports: ['Hamburg (DEHAM)', 'Bremerhaven (DEBRV)'] },
        { name: 'Netherlands', code: 'NL', ports: ['Rotterdam (NLRTM)'] },
        { name: 'United Kingdom', code: 'GB', ports: ['Felixstowe (GBFXT)', 'London Gateway (GBLGP)'] },
        { name: 'Belgium', code: 'BE', ports: ['Antwerp (BEANR)'] },
        { name: 'Italy', code: 'IT', ports: ['Genoa (ITGOA)', 'Trieste (ITTRS)'] },
      ],
    },
    {
      region: 'North America',
      description: 'FDA FSMA compliant documentation, automated US Customs filing, and fumigation certificates.',
      transitDays: '28–35 Days',
      order: 3,
      countries: [
        { name: 'United States', code: 'US', ports: ['New York / New Jersey (USNYC)', 'Houston (USHOU)', 'Long Beach (USLGB)'] },
        { name: 'Canada', code: 'CA', ports: ['Montreal (CAMTR)', 'Vancouver (CAVAN)'] },
      ],
    },
    {
      region: 'Southeast Asia & Far East',
      description: 'Rapid feeder connections across ASEAN ports for agro commodities and raw materials.',
      transitDays: '10–16 Days',
      order: 4,
      countries: [
        { name: 'Singapore', code: 'SG', ports: ['Singapore (SGSIN)'] },
        { name: 'Malaysia', code: 'MY', ports: ['Port Klang (MYPKG)', 'Penang (MYPEN)'] },
        { name: 'Vietnam', code: 'VN', ports: ['Ho Chi Minh City (VNSGN)', 'Haiphong (VNHPH)'] },
        { name: 'Thailand', code: 'TH', ports: ['Laem Chabang (THLCH)'] },
      ],
    },
  ];

  for (const r of regions) {
    const exists = await MarketRegion.findOne({ where: { region: r.region } });
    if (!exists) {
      await MarketRegion.create(r);
    }
  }

  // 3. FAQs (Grouped)
  const faqs = [
    {
      question: 'What is your standard Minimum Order Quantity (MOQ)?',
      answer: 'Our standard export minimum order quantity is one 20ft Full Container Load (FCL), which corresponds to approximately 18–24 Metric Tonnes (MT) depending on commodity density. For high-potency standardized botanical extracts and pharmaceutical-grade ingredients, we accommodate trial LCL shipments starting at 100 kg to 500 kg.',
      group: 'MOQ & Ordering',
      order: 1,
    },
    {
      question: 'Can we combine multiple commodities in a single container (Mixed FCL)?',
      answer: 'Yes. For commercial manufacturers and multi-ingredient formulators, we arrange multi-product consolidated 20ft and 40ft containers (e.g. palleted drums of Castor Oil derivatives alongside dry botanical extract drums or feed premix bags), provided the cargo items share compatible temperature and storage classifications.',
      group: 'MOQ & Ordering',
      order: 2,
    },
    {
      question: 'What international payment terms do you accept?',
      answer: 'We operate under international commercial banking standards. Standard terms are: (1) 30% advance deposit via Telegraphic Transfer (TT), balance 70% payable against scanned copies of the Bill of Lading, Phytosanitary Certificate, and commercial invoice. (2) Irrevocable Letter of Credit (LC) at sight issued by a prime international commercial bank.',
      group: 'Payment & Banking',
      order: 3,
    },
    {
      question: 'Which Incoterms 2020 do you quote under?',
      answer: 'We provide binding quotations under ICC Incoterms 2020. Our primary quoting terms are: FOB (Free on Board at Mundra or Nhava Sheva/JNPT ports), CIF (Cost, Insurance, and Freight delivered to your discharge port), and CFR (Cost and Freight). On special request, we can also provide EXW (Ex-Works from our Gujarat or Maharashtra processing plants).',
      group: 'Shipping & Incoterms',
      order: 4,
    },
    {
      question: 'What mandatory shipping and customs documents are provided with each consignment?',
      answer: 'Every container export bill includes: (1) Clean on Board Ocean Bill of Lading (3 originals + 3 non-negotiable copies), (2) Commercial Invoice and Detailed Packing List, (3) Certificate of Origin (issued by Chamber of Commerce or Export Inspection Agency), (4) Official Phytosanitary Certificate issued by Plant Quarantine authority, (5) Certificate of Fumigation, and (6) Lot-specific Certificate of Analysis (COA) from an accredited NABL testing lab.',
      group: 'Shipping & Incoterms',
      order: 5,
    },
    {
      question: 'Do you provide lab Certificate of Analysis (COA) prior to dispatch?',
      answer: 'Yes. Every production lot undergoes mandatory chemical and physical testing before container stuffing. We provide pre-shipment COAs certifying moisture levels, purity percentages, active marker concentrations (e.g. Curcumin % via HPLC), and testing for aflatoxins, pesticide residues, and heavy metals. On buyer request, independent inspection by SGS, Bureau Veritas, or Intertek can be conducted at the port of loading.',
      group: 'Quality & Testing',
      order: 6,
    },
    {
      question: 'Do you support custom Private Label (OEM) packaging?',
      answer: 'Yes. Our processing infrastructure offers comprehensive contract manufacturing and custom private labeling. We support retail packaging ranging from 100g to 5kg standing zip pouches, heat-sealed clear bags, HDPE jars, and branded outer master cartons, formatted to satisfy FDA (US), EFSA (EU), or GSO (GCC) regulatory labeling requirements.',
      group: 'Private Label OEM',
      order: 7,
    },
  ];

  for (const f of faqs) {
    const exists = await Faq.findOne({ where: { question: f.question } });
    if (!exists) {
      await Faq.create(f);
    }
  }

  logger.info('Testimonials, market regions, and FAQs seeded successfully');
};

export default seedTrustData;
