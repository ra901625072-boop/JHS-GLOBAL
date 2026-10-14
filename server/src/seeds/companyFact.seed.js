import CompanyFact from '../modules/companyFact/companyFact.model.js';
import { syncCompanyFactEmbedding } from '../modules/ai/rag/embedding.service.js';
import logger from '../utils/logger.js';

export const companyFactsData = [
  // =========================================================================
  // 1. IDENTITY & REGISTRATION (VERIFIED FROM PRIMARY GOVT CERTIFICATES)
  // =========================================================================
  {
    category: 'identity',
    factKey: 'legal_entity_name',
    label: 'Legal Entity Name',
    factValue: 'Jay Sureshbhai Prajapati (Proprietorship)',
    source: 'client_document',
    sourceDocument: 'GST Certificate.pdf / DGFT IEC',
    isVerified: true,
    isPublic: true,
    notes: 'Sole Proprietorship registered under Indian law.',
  },
  {
    category: 'identity',
    factKey: 'trade_name',
    label: 'Registered Trade Name',
    factValue: 'JHS GLOBAL',
    source: 'client_document',
    sourceDocument: 'GST Certificate.pdf (Form GST REG-06)',
    isVerified: true,
    isPublic: true,
    notes: 'Official trade name as registered with GST, DGFT, APEDA, and Spices Board of India.',
  },
  {
    category: 'identity',
    factKey: 'brand_name',
    label: 'Commercial Brand Identity',
    factValue: 'JHS Global (Officially registered trade name on Government export certificates: JHS GLOBAL)',
    source: 'client_document',
    sourceDocument: 'client massage.txt & Primary Registrations',
    isVerified: true,
    isPublic: true,
    notes: 'Branded internationally as JHS Global; formal export billings issued under JHS GLOBAL.',
  },
  {
    category: 'identity',
    factKey: 'registered_address',
    label: 'Registered Corporate & Operating Address',
    factValue: 'Flat No. 401, Shyam-A, Build-H, Vatsalya Villa Residency, Chhaprabhatha Road, Amroli, Surat, Gujarat 394107, India',
    source: 'client_document',
    sourceDocument: 'GST Certificate.pdf & FSSAI License',
    isVerified: true,
    isPublic: true,
    notes: 'Official registered address in Surat, Gujarat.',
  },
  {
    category: 'identity',
    factKey: 'business_constitution',
    label: 'Constitution of Business',
    factValue: 'Proprietorship (Government Registered Micro Enterprise - Trading, NIC Code 46209)',
    source: 'client_document',
    sourceDocument: 'MSME Udyam Registration Certificate.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Registered micro enterprise for wholesale and trading of agricultural raw materials.',
  },
  {
    category: 'identity',
    factKey: 'founders_leadership',
    label: 'Founders & Executive Leadership',
    factValue:
      'JHS Global is led by three Founders: Jay Prajapati, Henil Prajapati, and Suraj Prajapati. Jay Prajapati serves as Founder and statutory Proprietor overseeing corporate governance, international banking, and ICC trade compliance. Henil Prajapati serves as Founder directing multimodal container logistics and commercial trade desk operations. Suraj Prajapati serves as Founder leading direct processor audits, 48-hour unlisted sourcing, and laboratory COA verification.',
    source: 'client_document',
    sourceDocument: 'Official Client & Founder Confirmation (GST REG-06 / APEDA)',
    isVerified: true,
    isPublic: true,
    notes: 'Three verified founders confirmed by management: Jay Prajapati, Henil Prajapati, Suraj Prajapati.',
  },
  {
    category: 'identity',
    factKey: 'founder_jay',
    label: 'Founder Jay Prajapati',
    factValue:
      'Jay Prajapati (Jay Sureshbhai Prajapati) is Founder and statutory Proprietor of JHS Global. He directs corporate governance, statutory licensing, Letter of Credit banking under ICC Incoterms 2020, and customs clearance protocols.',
    source: 'client_document',
    sourceDocument: 'GST Certificate.pdf & JHS APEDA.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Sole legal proprietor on Indian government statutory export certificates.',
  },
  {
    category: 'identity',
    factKey: 'founder_henil',
    label: 'Founder Henil Prajapati',
    factValue:
      'Henil Prajapati is Founder of JHS Global, directing multimodal container dispatch logistics, maritime terminal coordination (Hazira, Mundra, JNPT), and rapid 48-hour commercial quotation operations.',
    source: 'client_document',
    sourceDocument: 'Official Client & Founder Confirmation',
    isVerified: true,
    isPublic: true,
    notes: 'Co-founder directing global operations and container logistics.',
  },
  {
    category: 'identity',
    factKey: 'founder_suraj',
    label: 'Founder Suraj Prajapati',
    factValue:
      'Suraj Prajapati is Founder of JHS Global, leading direct agricultural mill and chemical manufacturer audits, the 48-hour unlisted raw material sourcing desk, and HPLC laboratory COA verification.',
    source: 'client_document',
    sourceDocument: 'Official Client & Founder Confirmation',
    isVerified: true,
    isPublic: true,
    notes: 'Co-founder leading manufacturer audits, quality verification, and unlisted sourcing.',
  },

  // =========================================================================
  // 2. CERTIFICATIONS & TAX CREDENTIALS (VERIFIED)
  // =========================================================================
  {
    category: 'certifications',
    factKey: 'gstin',
    label: 'Goods & Services Tax Identification Number (GSTIN)',
    factValue: '24EZHPP3437C1ZH (Jurisdiction: Centre Range-V, Surat, Gujarat; Approved 14/02/2025)',
    source: 'client_document',
    sourceDocument: 'GST Certificate.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Active GST registration for zero-rated international exports.',
  },
  {
    category: 'certifications',
    factKey: 'dgft_iec',
    label: 'DGFT Importer-Exporter Code (IEC)',
    factValue: 'EZHPP3437C (Issued 03/03/2025 by Office of the Joint DGFT, Surat, Ministry of Commerce & Industry, Govt. of India)',
    source: 'client_document',
    sourceDocument: 'JHS IEC.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Permanent statutory license authorizing cross-border merchant exports.',
  },
  {
    category: 'certifications',
    factKey: 'pan_number',
    label: 'Permanent Account Number (PAN)',
    factValue: 'EZHPP3437C',
    source: 'client_document',
    sourceDocument: 'JHS IEC.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Statutory tax identification of proprietor.',
  },
  {
    category: 'certifications',
    factKey: 'msme_udyam',
    label: 'Ministry of MSME Udyam Registration',
    factValue: 'UDYAM-GJ-22-0460260 (Classification: Micro Enterprise, Classification Date: 07/02/2025)',
    source: 'client_document',
    sourceDocument: 'JHS GLOBAL Udyam Registration Certificate.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Official MSME enterprise registration.',
  },
  {
    category: 'certifications',
    factKey: 'fssai_central_license',
    label: 'FSSAI Central Food Safety License',
    factValue: '10725997001058 (FSSAI Central Licensing Authority, Kind of Business: Trader/Merchant - Exporter, Valid for 2026-27)',
    source: 'client_document',
    sourceDocument: 'RENEWAL LICENSE 2026-27.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Statutory Central License authorizing export of food ingredients and nutraceutical raw materials.',
  },
  {
    category: 'certifications',
    factKey: 'apeda_rcmc',
    label: 'APEDA Registration-cum-Membership Certificate (RCMC)',
    factValue: 'RCMC/APEDA/15765/2024-2025 (Registered Merchant Exporter for Fruits, Vegetables, Cereals, Pulses, Ministry of Commerce & Industry)',
    source: 'client_document',
    sourceDocument: 'JHS APEDA.pdf',
    isVerified: true,
    isPublic: true,
    notes: 'Statutory APEDA registration for agricultural exports.',
  },
  {
    category: 'certifications',
    factKey: 'spices_board_cres',
    label: 'Spices Board of India Exporter Registration (CRES)',
    factValue: 'CRES/SBCB/26585/2025-2026 (Registered Merchant Exporter for Spices & Spice Products, Valid from 27/10/2025 to 26/10/2028)',
    source: 'client_document',
    sourceDocument: 'SPICE BOARD-JHS GLOBAL.PDF',
    isVerified: true,
    isPublic: true,
    notes: 'Statutory registration with Spices Board, Head Office Cochin.',
  },

  // =========================================================================
  // 3. COMMERCIAL OPERATIONS & SOURCING PROMISES (VERIFIED)
  // =========================================================================
  {
    category: 'operations',
    factKey: 'unlisted_sourcing_promise',
    label: '48-Hour Unlisted Sourcing Commitment',
    factValue: "Can't find the raw material or ingredient you are looking for? Share your target specifications with our export desk and we will source and qualify it within 48 hours.",
    source: 'client_document',
    sourceDocument: 'client massage.txt',
    isVerified: true,
    isPublic: true,
    notes: 'Client explicit instruction: unlisted product sourcing turnaround is 48 hours.',
  },
  {
    category: 'operations',
    factKey: 'quote_turnaround_promise',
    label: 'Quote & Proforma Response Time',
    factValue: '48 business hours turnaround guarantee for qualified commercial buyers with containerized, LCL, or custom packing requirements.',
    source: 'client_document',
    sourceDocument: 'Home Page-website.docx',
    isVerified: true,
    isPublic: true,
    notes: 'Commercial trade desk commitment.',
  },
  {
    category: 'operations',
    factKey: 'catalogue_divisions',
    label: 'Commercial Catalogue Divisions',
    factValue: '3 Core Export Divisions: (1) Personal Care Raw Materials, (2) Nutraceutical Raw Materials, and (3) Animal Feed.',
    source: 'client_document',
    sourceDocument: 'client massage.txt & Products_website.xlsx',
    isVerified: true,
    isPublic: true,
    notes: 'Master catalogue divisions approved by client.',
  },
  {
    category: 'quality',
    factKey: 'quality_testing_assurance',
    label: 'Quality Process & Testing Assurance',
    factValue: 'Batch-specific laboratory Certificate of Analysis (COA) confirming physical parameters, active marker assay (HPLC), moisture levels, and microbiological screening. Pre-shipment independent inspection by SGS, Bureau Veritas, or Intertek available upon buyer request.',
    source: 'client_document',
    sourceDocument: 'Home Page-website.docx & Export Catalogue',
    isVerified: true,
    isPublic: true,
    notes: 'Standard quality workflow for commercial shipments.',
  },
  {
    category: 'operations',
    factKey: 'export_loading_ports',
    label: 'Primary Export Departure Sea Ports',
    factValue: 'Hazira Port (Surat, Gujarat - INHZR1) and Mundra Port (Kutch, Gujarat - INMUN1); Nhava Sheva / JNPT (Mumbai, Maharashtra - INNSA1).',
    source: 'client_document',
    sourceDocument: 'Home Page-website.docx',
    isVerified: true,
    isPublic: true,
    notes: 'Primary maritime container loading terminals.',
  },

  // =========================================================================
  // 4. UNCONFIRMED / MISSING FACTS (EXPLICITLY MARKED AS UNVERIFIED / UNKNOWN)
  // MUST NOT BE INVENTED OR GUARANTEED BY THE AI ASSISTANT
  // =========================================================================
  {
    category: 'contact',
    factKey: 'contact_official_email',
    label: 'Official Export Inquiries Email',
    factValue: 'UNKNOWN — Email address to be confirmed by client. Please use the RFQ form on the website.',
    source: 'admin_portal',
    sourceDocument: 'TODO(client)',
    isVerified: false,
    isPublic: true,
    notes: 'TODO(client) — supply official public inquiry email (masked on FoSCoS portal).',
  },
  {
    category: 'contact',
    factKey: 'contact_official_phone',
    label: 'Official Trade Desk Telephone',
    factValue: 'UNKNOWN — Official trade desk landline to be confirmed by client. Trade WhatsApp line available via website widget.',
    source: 'admin_portal',
    sourceDocument: 'TODO(client)',
    isVerified: false,
    isPublic: true,
    notes: 'TODO(client) — supply official company phone number.',
  },
  {
    category: 'operations',
    factKey: 'operating_hours',
    label: 'Commercial Desk Business Hours',
    factValue: 'UNKNOWN — Business operating hours to be confirmed by management.',
    source: 'admin_portal',
    sourceDocument: 'TODO(client)',
    isVerified: false,
    isPublic: true,
    notes: 'TODO(client) — specify operating hours and timezone (e.g., Mon-Sat 09:00-18:00 IST).',
  },
  {
    category: 'operations',
    factKey: 'annual_processing_capacity',
    label: 'Annual Processing / Export Capacity',
    factValue: 'UNKNOWN — Aggregate capacity is crop and contract dependent and is not published as a fixed guarantee.',
    source: 'admin_portal',
    sourceDocument: 'TODO(client)',
    isVerified: false,
    isPublic: true,
    notes: 'TODO(client) — confirm verifiable annual export tonnage.',
  },
  {
    category: 'policy',
    factKey: 'sample_policy',
    label: 'Product Sample Evaluation Policy',
    factValue: 'UNKNOWN — Lab evaluation samples are arranged on request. Courier charges (DHL/FedEx) and sample terms to be confirmed per commodity grade.',
    source: 'admin_portal',
    sourceDocument: 'TODO(client)',
    isVerified: false,
    isPublic: true,
    notes: 'TODO(client) — clarify free sample threshold and international courier billing policy.',
  },
  {
    category: 'policy',
    factKey: 'payment_terms_policy',
    label: 'Accepted Commercial Payment Terms',
    factValue: 'UNKNOWN — Typical industry terms include 30% advance TT with balance against B/L copy, or Irrevocable LC at Sight. Exact binding terms are negotiated per proforma order.',
    source: 'admin_portal',
    sourceDocument: 'TODO(client)',
    isVerified: false,
    isPublic: true,
    notes: 'TODO(client) — confirm accepted banking and payment terms policy.',
  },
  {
    category: 'policy',
    factKey: 'private_label_moq',
    label: 'Private Label (OEM) Minimum Order Quantity',
    factValue: 'UNKNOWN — Custom private labeling and branded retail packaging available; minimum production run varies by formulation and packing format.',
    source: 'admin_portal',
    sourceDocument: 'TODO(client)',
    isVerified: false,
    isPublic: true,
    notes: 'TODO(client) — specify minimum order quantity for private label packaging.',
  },
];

export const seedCompanyFacts = async () => {
  logger.info('Seeding company knowledge base facts (verified + unverified placeholders)...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of companyFactsData) {
    const existing = await CompanyFact.findOne({ where: { factKey: item.factKey } });
    if (existing) {
      await existing.update(item);
      updatedCount++;
    } else {
      const fact = await CompanyFact.create(item);
      createdCount++;
      // Sync embedding in background
      if (fact.isPublic) {
        syncCompanyFactEmbedding(fact.toJSON()).catch(() => {});
      }
    }
  }

  logger.info(
    `Company facts seeded successfully: ${createdCount} created, ${updatedCount} updated. Total: ${companyFactsData.length}`
  );
};

export default seedCompanyFacts;
