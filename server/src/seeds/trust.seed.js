import { Op } from 'sequelize';
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

  // Ensure faqs table has slug, show_on_home, home_order columns
  try {
    await Faq.sequelize.query(`
      ALTER TABLE faqs ADD COLUMN IF NOT EXISTS slug VARCHAR(150);
      ALTER TABLE faqs ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT false;
      ALTER TABLE faqs ADD COLUMN IF NOT EXISTS home_order INTEGER DEFAULT 0;
      CREATE INDEX IF NOT EXISTS idx_faqs_home ON faqs (is_active, show_on_home, home_order);
      CREATE INDEX IF NOT EXISTS idx_faqs_group ON faqs (is_active, "group", "order");
    `);
  } catch (migErr) {
    logger.debug(`Faq table migration note: ${migErr.message}`);
  }

  // 3. FAQs (Grouped & Featured)
  const faqs = [
    // Group 1: Ordering & Minimum Quantities (MOQ)
    {
      question: 'What is your standard Minimum Order Quantity (MOQ)?',
      answer: 'Our standard export minimum order quantity is one 20ft Full Container Load (FCL), corresponding to approximately 18–24 Metric Tonnes (MT) depending on commodity bulk density. For high-potency standardized botanical extracts and pharmaceutical-grade ingredients, we accommodate trial LCL shipments starting at 100 kg to 500 kg depending on product formulation. Share your destination port and required volume, and our sales desk will confirm exact feasibility.',
      group: 'Ordering & Minimum Quantities (MOQ)',
      slug: 'standard-minimum-order-quantity-moq',
      showOnHome: true,
      homeOrder: 1,
      order: 1,
    },
    {
      question: 'Can we consolidate multiple commodities in a single container (Mixed FCL)?',
      answer: 'Yes. For multi-product formulators and institutional blenders, we arrange consolidated 20ft and 40ft container consignments (e.g., palleted drums of Castor Oil derivatives alongside dry botanical extract drums or feed-grade minerals), provided the products share compatible moisture, storage, and hazard classifications.',
      group: 'Ordering & Minimum Quantities (MOQ)',
      slug: 'mixed-container-fcl-consolidation',
      showOnHome: false,
      homeOrder: 0,
      order: 2,
    },
    {
      question: 'Can you source unlisted specialty agricultural commodities or industrial raw materials?',
      answer: 'Yes. Through our direct APMC mandi tie-ups and manufacturer networks across Gujarat, Maharashtra, and Madhya Pradesh, we provide an unlisted sourcing turnaround. Share your specification sheet or CAS number, and our commercial trade desk will provide availability and pricing within 48 business hours.',
      group: 'Ordering & Minimum Quantities (MOQ)',
      slug: 'unlisted-commodity-sourcing-service',
      showOnHome: false,
      homeOrder: 0,
      order: 3,
    },
    {
      question: 'How do I place an official Request for Quotation (RFQ)?',
      answer: 'You can assemble required items into your digital Quote Basket directly from our catalogue, or submit your specification sheet through our RFQ form or WhatsApp export desk. Please include product grade, volume (MT), destination discharge port, target Incoterm (CIF/FOB/CFR), and shipment month.',
      group: 'Ordering & Minimum Quantities (MOQ)',
      slug: 'how-to-submit-rfq',
      showOnHome: false,
      homeOrder: 0,
      order: 4,
    },

    // Group 2: Product Quality & Technical Specifications
    {
      question: 'Do you provide lot-specific Certificate of Analysis (COA) prior to container loading?',
      answer: 'Yes. Every commercial production batch undergoes mandatory analytical laboratory testing prior to stuffing. We provide pre-shipment COAs certifying moisture levels, active marker assays (e.g., Curcumin % or Withanolides % via HPLC), mesh particle size, microbial counts, and heavy metal limits. Independent inspection reports (SGS, Bureau Veritas, or Intertek) can be arranged at the port of loading upon buyer request.',
      group: 'Product Quality & Technical Specifications',
      slug: 'lab-certificate-of-analysis-coa',
      showOnHome: true,
      homeOrder: 4,
      order: 5,
    },
    {
      question: 'Do your botanical and nutraceutical extracts carry therapeutic or medical claims?',
      answer: 'No. JHS GLOBAL supplies manufacturer-grade raw ingredients and standardized botanical extracts exclusively as raw materials for dietary supplements, functional foods, and cosmetic formulations. In accordance with international export regulations, our ingredients are not marketed to diagnose, treat, cure, or prevent any medical condition.',
      group: 'Product Quality & Technical Specifications',
      slug: 'nutraceutical-raw-material-compliance',
      showOnHome: false,
      homeOrder: 0,
      order: 6,
    },
    {
      question: 'What grades and specifications are available for Castor Oil derivatives?',
      answer: 'We supply First Special Grade (FSG), Commercial Grade, Pale Pressed Grade (PPG), and technical derivatives including 12-Hydroxystearic Acid (12-HSA) and Ricinoleic Acid, packaged in standard 200L epoxy-coated steel drums or ISO tanks. Lot-specific acid value, iodine value, and viscosity specifications are detailed on each batch COA.',
      group: 'Product Quality & Technical Specifications',
      slug: 'castor-oil-grades-and-specifications',
      showOnHome: false,
      homeOrder: 0,
      order: 7,
    },
    {
      question: 'What protein and moisture levels do you guarantee for Animal Feed meals?',
      answer: 'Our Soybean Meal (De-Oiled Cake / DOC) is supplied at a standardized 46%–48% crude protein guarantee with maximum 12% moisture. Rapeseed/mustard meal and cottonseed meal are graded according to international feed compounder standards with certified fiber and sand/silica limits.',
      group: 'Product Quality & Technical Specifications',
      slug: 'animal-feed-protein-moisture-specs',
      showOnHome: false,
      homeOrder: 0,
      order: 8,
    },

    // Group 3: Packaging & Maritime Shipping
    {
      question: 'Which loading ports in India do you dispatch from?',
      answer: 'Consignments are dispatched through Western India\'s primary deep-water container ports: Hazira Port (Surat, located within 25 km of our export center), Mundra Port (Kutch, Gujarat), and Nhava Sheva / JNPT (Navi Mumbai). This multi-port connectivity ensures container slot availability and competitive ocean freight routing.',
      group: 'Packaging & Maritime Shipping',
      slug: 'loading-ports-and-gateways',
      showOnHome: false,
      homeOrder: 0,
      order: 9,
    },
    {
      question: 'What packaging configurations do you offer for bulk export?',
      answer: 'Standard bulk packaging includes 25 kg multi-wall craft paper bags with polyethylene inner liners, 50 kg HDPE/PP woven bags, 200L HDPE/epoxy-lined steel drums for liquid derivatives, and 1,000 kg UV-stabilized polypropylene jumbo bags (FIBC) with discharge spouts. Palletization with heat-treated ISPM-15 wooden pallets and stretch wrapping is provided upon request.',
      group: 'Packaging & Maritime Shipping',
      slug: 'bulk-export-packaging-types',
      showOnHome: false,
      homeOrder: 0,
      order: 10,
    },
    {
      question: 'How do you prevent moisture damage and condensation during ocean transit?',
      answer: 'All container stuffing operations are supervised in dry weather under covered warehouses. Containers are equipped with multi-ply Kraft paper container liners, desiccants (calcium chloride container dry bags), and corrugated moisture-barrier flooring sheets. Mandatory container pre-inspection ensures zero floor odor, oil stains, or roof pinholes.',
      group: 'Packaging & Maritime Shipping',
      slug: 'ocean-transit-moisture-protection',
      showOnHome: false,
      homeOrder: 0,
      order: 11,
    },
    {
      question: 'What are your average production and export lead times?',
      answer: 'Standard dispatch from our Gujarat processing yard to the loading port container freight station (CFS) is typically 10 to 18 business days following contract confirmation and receipt of the financial instrument (TT/LC). Ocean transit time varies depending on the destination discharge port.',
      group: 'Packaging & Maritime Shipping',
      slug: 'export-lead-times-and-dispatch',
      showOnHome: false,
      homeOrder: 0,
      order: 12,
    },

    // Group 4: Commercial Banking & Payment Terms
    {
      question: 'What international payment and banking terms do you accept?',
      answer: 'We operate under standard international commercial banking protocols: (1) Advance payment via Telegraphic Transfer (TT) with deposit and balance payable against presentation of scanned shipping documents (Bill of Lading, COA, Phytosanitary Certificate), or (2) Irrevocable Letter of Credit (LC) at sight issued or confirmed by a prime international commercial bank. Exact credit terms depend on volume, commodity, and buyer trade history.',
      group: 'Commercial Banking & Payment Terms',
      slug: 'international-payment-banking-terms',
      showOnHome: true,
      homeOrder: 2,
      order: 13,
    },
    {
      question: 'Which Incoterms 2020 do you quote under?',
      answer: 'We provide binding quotations under ICC Incoterms 2020 rules. Our standard quoting terms are FOB (Free on Board at Hazira, Mundra, or JNPT ports), CIF (Cost, Insurance, and Freight to your designated discharge port), and CFR (Cost and Freight). On specific request, Ex-Works (EXW) pricing from our Gujarat processing facilities can be provided.',
      group: 'Commercial Banking & Payment Terms',
      slug: 'incoterms-2020-quoting-options',
      showOnHome: true,
      homeOrder: 3,
      order: 14,
    },
    {
      question: 'How long are your proforma quotations valid?',
      answer: 'Due to volatility in raw agricultural harvests, commodity mandi spot rates, and ocean freight bunker adjustments, commercial quotations are typically valid for 3 to 7 calendar days from issuance, unless formally locked via signed proforma invoice.',
      group: 'Commercial Banking & Payment Terms',
      slug: 'quotation-validity-and-price-locks',
      showOnHome: false,
      homeOrder: 0,
      order: 15,
    },

    // Group 5: Commercial Samples & Private Label (OEM)
    {
      question: 'Can I request commercial samples before placing an FCL container order?',
      answer: 'Yes. We provide pre-shipment evaluation samples (typically 100g to 500g) for technical testing, pilot formulation, and assay verification. Samples are accompanied by the batch Certificate of Analysis (COA) and Material Safety Data Sheet (MSDS/SDS). Sample product is provided complimentary; international courier charges (DHL/FedEx) are either borne by the buyer or credited against the initial commercial FCL contract.',
      group: 'Commercial Samples & Private Label (OEM)',
      slug: 'commercial-sample-dispatch-policy',
      showOnHome: true,
      homeOrder: 5,
      order: 16,
    },
    {
      question: 'Do you offer custom private labeling and contract manufacturing (OEM)?',
      answer: 'Yes. For overseas distributors and retail brand owners, we provide custom packaging solutions including branded standing zip pouches (100g–1kg), airtight HDPE canisters, customized outer master cartons, and multilingual regulatory label formatting compliant with destination market authorities. Private label projects are subject to custom packaging MOQs.',
      group: 'Commercial Samples & Private Label (OEM)',
      slug: 'private-label-contract-manufacturing-oem',
      showOnHome: false,
      homeOrder: 0,
      order: 17,
    },
    {
      question: 'Can you match custom particle mesh sizes or standardized biomarker assays?',
      answer: 'Yes. We offer precision milling, micronization (from 40 mesh to 120 mesh), and custom extract standardization (e.g., tailored Withanolide percentages or water-soluble extract grades) through certified extraction facilities, subject to batch volume confirmation.',
      group: 'Commercial Samples & Private Label (OEM)',
      slug: 'custom-mesh-sizing-and-extract-standardization',
      showOnHome: false,
      homeOrder: 0,
      order: 18,
    },

    // Group 6: Export Documentation & Regulatory Compliance
    {
      question: 'What statutory export licenses and government registrations does JHS GLOBAL hold?',
      answer: 'JHS GLOBAL is fully accredited by Indian statutory export authorities: Directorate General of Foreign Trade (DGFT) Importer-Exporter Code (EZHPP3437C), FSSAI Central Food Safety License (10725997001058), APEDA Registration-Cum-Membership (RCMC/APEDA/15765/2024-2025), Spices Board of India Exporter CRES (CRES/SBCB/26585/2025-2026), and MSME Udyam Registration (UDYAM-GJ-22-0460260).',
      group: 'Export Documentation & Regulatory Compliance',
      slug: 'statutory-export-licenses-and-registrations',
      showOnHome: false,
      homeOrder: 0,
      order: 19,
    },
    {
      question: 'What mandatory shipping and customs documents accompany each export bill?',
      answer: 'Every standard container export consignment includes: (1) Clean on Board Ocean Bill of Lading (3 original + 3 non-negotiable copies), (2) Commercial Invoice and Detailed Packing List, (3) Certificate of Origin issued by authorized Chamber of Commerce, (4) Official Phytosanitary Certificate issued by Plant Quarantine authority, (5) Certificate of Fumigation (Methyl Bromide / Phosphine), and (6) Lot-specific manufacturer Certificate of Analysis (COA).',
      group: 'Export Documentation & Regulatory Compliance',
      slug: 'standard-export-shipping-documents',
      showOnHome: false,
      homeOrder: 0,
      order: 20,
    },
    {
      question: 'Can you arrange third-party pre-shipment inspections like SGS or Bureau Veritas?',
      answer: 'Yes. Buyers may nominate international third-party inspection agencies (SGS, Bureau Veritas, Intertek, or Cotecna) to conduct independent sampling, moisture verification, weight verification, and container stuffing supervision at the port of loading prior to vessel departure. Inspection costs are billed according to mutual sales contract terms.',
      group: 'Export Documentation & Regulatory Compliance',
      slug: 'third-party-pre-shipment-inspection',
      showOnHome: false,
      homeOrder: 0,
      order: 21,
    },
    {
      question: 'Do you provide Non-GMO and allergen declarations?',
      answer: 'Technical documentation packages including Non-GMO Declarations, Allergen Statements, TSE/BSE-free Certificates, and Material Safety Data Sheets (SDS) are issued upon contract finalization for pharmaceutical and cosmetic manufacturer compliance.',
      group: 'Export Documentation & Regulatory Compliance',
      slug: 'technical-compliance-declarations',
      showOnHome: false,
      homeOrder: 0,
      order: 22,
    },
    {
      question: 'Who are the founders and leadership team of JHS GLOBAL?',
      answer: 'JHS GLOBAL is led by three Founders: Jay Prajapati (Founder & CEO), Suraj Prajapati (Co-Founder, Sourcing & Operations), and Henil Prajapati (Co-Founder, Commercial Development & Marketing). Jay Prajapati leads international business development, sales, and buyer relationships. Suraj Prajapati oversees domestic sourcing, supplier coordination, and order execution. Henil Prajapati directs commercial development, international marketing, and buyer outreach.',
      group: 'Corporate Profile & Leadership',
      slug: 'founders-and-leadership-team',
      showOnHome: false,
      homeOrder: 0,
      order: 23,
    },
    {
      question: 'What is the mission, vision, and core values of JHS GLOBAL?',
      answer: 'Our mission is to make India\'s finest natural ingredients accessible to the world with uncompromising quality, honest pricing, and customs-grade documentation, delivering agreed specifications in promised packaging on quoted dates. Our vision is to be the first-choice export partner global brands name for Indian sourcing across food, wellness, and beauty sectors. Our values are: Integrity in every lot, Transparency in every quote, Consistency in every reorder, Partnership over transaction, and Respect for farmers and buyers.',
      group: 'Corporate Profile & Leadership',
      slug: 'mission-vision-and-values',
      showOnHome: false,
      homeOrder: 0,
      order: 24,
    },
  ];

  for (const f of faqs) {
    const existing = await Faq.findOne({
      where: {
        [Op.or]: [{ slug: f.slug }, { question: f.question }],
      },
    });
    if (existing) {
      await existing.update(f);
    } else {
      await Faq.create(f);
    }
  }

  logger.info('Testimonials, market regions, and 22 FAQs seeded successfully');
};

export default seedTrustData;
