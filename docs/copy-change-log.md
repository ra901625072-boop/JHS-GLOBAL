# JHS GLOBAL B2B Export Platform — Copy Change Log

This document records the complete copy audit and transformation from freight-forwarder, port-focused, and lab-heavy language to product-focused, complete supply chain management messaging.

## Audit Scope
- **Scanned**: `client/src`, `server/src`, `docs/`, `client/index.html`.
- **Target Terms**: Mundra, Hazira, Pipavav, JNPT, loading port, port clearance, vessel, sailing, clean on board, B/L, ICEGATE, connectivity, nearby, Surat (marketing use), inspection, third-party, SGS, Bureau Veritas, Intertek, pre-shipment, lab, laboratory, NABL, COA, certificate of analysis, Sortex, destoning, metal detection, fumigation, phytosanitary.

---

## Change Log Matrix

| File & Location | Current Text | Proposed Text | Rationale | Statutory (Keep)? |
| :--- | :--- | :--- | :--- | :--- |
| `client/index.html`:12 | `<title>Export B2B — Premium Agri & Food Ingredients Exporter</title>` | `<title>JHS GLOBAL — Indian Multi-Commodity Supply Chain Exporter</title>` | Replaces generic developer title with official brand identity and multi-commodity export scope. | No |
| `client/index.html`:6 | `<meta name="description" content="...spices, and food ingredients." />` | `<meta name="description" content="JHS GLOBAL: Leading Indian export house managing complete supply chains across food ingredients, personal care, nutraceuticals, and animal feed." />` | Replaces single-commodity focus with all 4 commercial divisions. | No |
| `client/src/components/layout/Header.jsx`:77-79 | `Port of Loading Agreed per Order` | `Complete Indian Supply Chain Management` | Elevates positioning from port logistics to complete supply chain ownership. | No |
| `client/src/components/layout/Header.jsx`:88-89 | `B2B Container Volume (FCL / MT)` | `Multi-Commodity Export Consolidation` | Focuses on buyer capability (mixed container sourcing) rather than freight jargon. | No |
| `client/src/components/layout/Footer.jsx`:128 | `Request Lab Samples` | `Request Product Samples` | Eliminates lab-centric phrasing; focuses on commercial product evaluation. | No |
| `client/src/components/layout/Footer.jsx`:196-201 | `DGFT IEC Registered... FSSAI Central License... Surat, Gujarat` | `DGFT IEC Registered... FSSAI Central License... Surat, Gujarat` | Statutory corporate registrations and central licensing. | **YES (KEEP)** |
| `client/src/components/layout/Footer.jsx`:305 | `401, Shyam-A... Surat, Gujarat – 394107` | `401, Shyam-A... Surat, Gujarat – 394107` | Statutory registered office address. | **YES (KEEP)** |
| `client/src/components/layout/Footer.jsx`:321-323 | `Port of Loading: Agreed per order (India gateway ports)` | `Supply Chain Control: End-to-end multi-commodity consolidation` | Replaces port reference with accountable supply chain management. | No |
| `client/src/pages/Home/index.jsx`:447 | `Whether you require specialized ingredient cuts... customs clearance to your agreed destination port.` | `Whether you require specialized ingredient cuts, customized mesh sizes, or consolidated multi-category containers — our export team coordinates product handling, export packaging, and delivery to your destination.` | Replaces port clearance and container stuffing with buyer-outcome processing and delivery. | No |
| `client/src/pages/Home/index.jsx`:468 | `Container stuffing and ocean freight coordinated to agreed global ports` | `Custom packaging and export delivery coordinated to your destination` | Replaces freight-forwarder terms with buyer fulfillment language. | No |
| `client/src/pages/Home/index.jsx`:678 | `Learn more about our Incoterms 2020 and export logistics →` | `Learn more about our export process and supply chain management →` | Replaces "export logistics" with supply chain management. | No |
| `client/src/pages/Home/index.jsx`:736 | `Order Lab Samples` | `Request Evaluation Samples` | Removes lab testing focus; aligns with commercial sampling. | No |
| `client/src/components/home/HomeFaqSection.jsx`:48 | `...pre-shipment COA lab testing, and export documentation turnaround.` | `...product specifications, export packaging, and quotation turnaround.` | Replaces pre-shipment COA lab testing with product specifications. | No |
| `client/src/components/common/UnlistedSourcingBanner.jsx`:48 | `<span>Lab COA Matching Standard</span>` | `<span>Custom Specification Matching</span>` | Replaces lab COA claim with buyer specification matching. | No |
| `client/src/components/home/WorldTradeMap.jsx`:57 | `type: 'EU MRL Lab Certified FCL'` | `type: 'EU Compliant Full Container Load'` | Eliminates lab claim while preserving regulatory compliance. | No |
| `client/src/components/home/WorldTradeMap.jsx`:71 | `type: 'Direct Vessel Service'` | `type: 'Scheduled International Service'` | Replaces vessel terminology with scheduled international service. | No |
| `client/src/data/aboutContent.js`:71 | `From inspection and testing to documentation and dispatch...` | `From product verification and packaging to documentation and dispatch...` | Removes inspection and testing in favor of product verification. | No |
| `client/src/data/aboutContent.js`:124 | `Lab reports, loading photos and container seal numbers are shared as they happen...` | `Specification sheets, packaging photos and container dispatch details are shared as they happen...` | Replaces lab reports and seal numbers with specification sheets and dispatch details. | No |
| `client/src/pages/ProductDetail/index.jsx`:217-220 | `Port of Loading: Agreed per order` | `Forms Available: {product.forms.join(', ')}` | Replaces port row with high-value product forms row (Whole, Powder, Cut/Sifted, Kibbled, Flakes). | No |
| `client/src/pages/ProductDetail/index.jsx`:365 | `Laboratory & Chemical Parameters` | `Product & Chemical Specifications` | Replaces "Laboratory" header with commercial product specifications. | No |
| `client/src/pages/ProductDetail/index.jsx`:416-439 | `Container Load & Maritime Transit` (Port of Loading row) | `Export Sourcing & Supply Chain` (Direct Sourcing, Multi-Commodity Consolidation, End-to-end Fulfillment, Export Documentation on Request) | Replaces maritime freight panel with product sourcing, consolidation, and fulfillment panel. | No |
| `client/src/pages/SampleRequest/index.jsx`:156 | `Order formal laboratory testing samples (100g–500g) with Certificate of Analysis (COA)...` | `Request commercial evaluation samples (100g–500g) with technical specification sheets...` | Replaces lab testing sample copy with commercial evaluation sample copy. | No |
| `client/src/pages/SampleRequest/index.jsx`:254-256 | `Authentic COA Included: Full lot Certificate of Analysis...` | `Technical Dossier Included: Technical specifications and batch documentation accompany each evaluation sample.` | Replaces COA focus with technical specification dossier. | No |
| `client/src/pages/SampleRequest/index.jsx`:353 | `Company / QA Lab Name *` | `Company Name *` | Removes QA Lab designation from customer input fields. | No |
| `client/src/pages/Faq/index.jsx`:30 | `Regulatory, COA & Compliance` | `Regulatory & Compliance Documentation` | Removes COA from FAQ category filters. | No |
| `server/src/seeds/trust.seed.js`:FAQ | `Can you arrange independent pre-shipment inspections?` | `How do you verify product specifications prior to dispatch?` | Shifts question and answer from third-party inspection agencies to JHS GLOBAL's internal quality matching and buyer-approved sampling. | No |
| `server/src/seeds/companyFact.seed.js`:Fact | `UNKNOWN — Lab evaluation samples are arranged on request` | `Commercial evaluation samples are arranged on request` | Replaces lab sample references in the AI knowledge base. | No |
| `server/src/seeds/companyFact.seed.js`:Fact | `Co-founder directing sourcing, quality inspection, and order execution.` | `Co-founder directing commodity sourcing, quality control, and order fulfillment.` | Replaces inspection with quality control and order fulfillment. | No |
| `server/src/seeds/product.seed.js`:Notes | `...guarantee (Hi-Pro 48% vs Standard 44%) and fumigation protocol` | `...guarantee (Hi-Pro 48% vs Standard 44%) and export documentation protocol` | Removes fumigation claim from seed data. | No |
| `client/src/components/ai/ChatWidget.jsx`:133 | `'Is a lot Certificate of Analysis (COA) provided?'` | `'Can you supply custom forms or mesh sizes?'` | Replaces COA question chip with flexible processing ability. | No |
| `client/src/components/seo/JsonLd.jsx`:25 | `'Premier Indian exporter of manufacturer-grade personal care... and animal feed...'` | `'Premier Indian exporter managing complete supply chains for food & food ingredients, personal care raw materials, nutraceutical raw materials, and animal feed.'` | Integrates 4th division and complete supply chain scope into structured data. | No |

---

## Statutory Content Guard
The legal registered office address:
`401, Shyam-A, Vatsalya Villa Residency, Chhaprabhatha Road, Amroli, Surat, Gujarat – 394107, India`
and statutory registration IDs (IEC, FSSAI, GST, APEDA, FIEO) are preserved solely on the `/contact` page, global Footer statutory block, and schema metadata. They are completely excluded from marketing slogans, hero banners, and promotional content.
