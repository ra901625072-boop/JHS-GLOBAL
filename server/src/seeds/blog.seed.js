import BlogPost from '../modules/blog/blog.model.js';
import logger from '../utils/logger.js';

export const seedBlogPosts = async () => {
  logger.info('Seeding B2B export industry articles for raw materials catalogue...');

  const posts = [
    {
      title: 'Curcumin Biomarker Chemistry: HPLC Standardization & Purity Criteria for Importers',
      slug: 'curcumin-biomarker-chemistry-hplc-standardization-guide',
      excerpt:
        'A technical procurement guide for nutraceutical formulators: understanding HPLC assay methods for Curcuminoids (Curcumin, DMC, BDMC), residual solvent thresholds (USP 467), and zero-adulteration testing.',
      content: `## 1. Introduction: Phytochemical Biomarkers in Curcuma longa

In international dietary supplement and functional nutrition trade, commercial raw material specifications for botanical extracts are governed by high-performance liquid chromatography (HPLC) active biomarker quantification.

For **Curcuma longa (Turmeric Extract 95%)**, standard trade contracts require a guaranteed minimum of 95.0% Total Curcuminoids on a dry weight basis, comprising three distinct naturally occurring curcuminoid analogues:
1. **Curcumin (Curcumin I / Diferuloylmethane):** Typically 70% – 80% of total curcuminoids.
2. **Demethoxycurcumin (Curcumin II / DMC):** Typically 15% – 20%.
3. **Bisdemethoxycurcumin (Curcumin III / BDMC):** Typically 2.5% – 6.0%.

---

## 2. Analytical Verification Standards

| Testing Parameter | Export Specification Standard | Test Methodology |
|---|---|---|
| **Total Curcuminoids** | ≥ 95.0% w/w (dry basis) | HPLC (USP / Ph. Eur.) |
| **Residual Extraction Solvents** | Ethanol / Ethyl Acetate < 5,000 ppm (Class 3) | Headspace GC-FID (USP <467>) |
| **Synthetic Adulteration Screen** | Carbon-14 (C14) Natural Radiocarbon Dating | Accelerator Mass Spectrometry (AMS) |
| **Heavy Metals (Pb, As, Cd, Hg)** | Pb < 3.0, As < 1.0, Cd < 1.0, Hg < 0.1 ppm | ICP-MS (USP <2232>) |
| **Microbiological Limits** | Total Plate Count < 10,000 CFU/g; Salmonella Negative / 25g | BAM / ISO Standard |

---

## 3. Procurement Guardrails for Global Importers

When issuing a formal Request for Quote (RFQ), commercial buyers should request:
- Lot-specific HPLC chromatogram depicting all three peak resolutions.
- Residual solvent certificate confirming absence of Class 1 and Class 2 toxic extraction solvents (Methanol, Dichloromethane).
- C14 isotope test certificate if zero synthetic curcumin confirmation is required by destination regulations.`,
      coverImage: {
        url: '/images/products/turmeric-curcumin-extract.webp',
        alt: 'Curcumin 95% HPLC Testing and Extraction Guide',
      },
      author: {
        name: 'Dr. R. Natarajan',
        designation: 'Head of Quality Assurance & Phytochemistry',
        avatar: '/images/placeholders/avatar-default.jpg',
      },
      tags: ['Curcumin', 'Nutraceuticals', 'HPLC', 'Botanical Extracts', 'Quality Standards'],
      category: 'Nutraceutical Raw Materials',
      status: 'published',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      readMinutes: 6,
      seo: {
        title: 'Curcumin 95% HPLC Standardization & Purity Guide — B2B Procurement',
        description:
          'Learn HPLC biomarker standards, residual solvent limits, and purity criteria for importing 95% Curcumin extract powder.',
        keywords: ['curcumin extract 95', 'hplc curcuminoids', 'nutraceutical raw materials india', 'botanical extract exporter'],
      },
    },
    {
      title: 'Castor Oil & Ricinoleic Acid Oleochemical Derivatives: Industrial Formulation Guide',
      slug: 'castor-oil-ricinoleic-acid-derivatives-procurement-guide',
      excerpt:
        'A commercial overview of Indian Castor Oil grades (FSG, Pale Pressed), Hydrogenated Castor Oil (HCO wax), and 12-HSA for cosmetic formulators and chemical processors.',
      content: `## 1. India as the Global Capital of Castor Derivatives

India accounts for over 85% of the world's commercial castor oil production, with Gujarat state representing the primary agricultural cultivation and crushing corridor.

Castor oil (*Ricinus communis*) is unique among vegetable triglyceride oils due to its high concentration (85%–90%) of **ricinoleic acid** (12-hydroxy-9-cis-octadecenoic acid), a 18-carbon hydroxylated fatty acid that confers high viscosity, natural emolliency, pigment wet-out, and reactive hydroxyl functional sites.

---

## 2. Technical Grade Comparison

| Grade / Derivative | Primary Industrial Applications | Key Technical Parameters |
|---|---|---|
| **First Special Grade (FSG)** | Polyurethane resins, lubricants, cosmetic raw material | Acid Value ≤ 2.0 mg KOH/g; Hydroxyl Value 160–168 |
| **Pale Pressed Grade (PPG)** | High-clarity cosmetics, lipsticks, hair care | Gardner Color ≤ 1.0; Acid Value ≤ 1.0 mg KOH/g |
| **Hydrogenated Castor Oil (HCO)** | Castor wax flakes, rheology modifier, thixotrope | Melting Point 84°C–87°C; Iodine Value ≤ 3.0 |
| **12-Hydroxystearic Acid (12-HSA)** | Lithium complex greases, cosmetic wax sticks | Acid Value 175–182; Hydroxyl Value 155–165 |

---

## 3. Maritime Ocean Transport Standards

Export consignments are shipped in:
- 200 kg epoxy-lined steel drums (80 drums per 20ft FCL ~ 16.0 MT).
- 1,000 L intermediate bulk containers (IBCs) with tamper-sealed discharge valves.
- Dedicated stainless steel ISO tank containers (20–22 MT) for high-volume chemical formulators.`,
      coverImage: {
        url: '/images/products/castor-oil-and-derivatives.webp',
        alt: 'Castor Oil and Derivatives Commercial Procurement',
      },
      author: {
        name: 'K. S. Sharma',
        designation: 'Director of Oleochemicals & Export Trade',
        avatar: '/images/placeholders/avatar-default.jpg',
      },
      tags: ['Castor Oil', 'Personal Care', 'Oleochemicals', 'FSG Castor', 'Cosmetic Ingredients'],
      category: 'Personal Care Raw Materials',
      status: 'published',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      readMinutes: 7,
      seo: {
        title: 'Castor Oil and Ricinoleic Derivatives B2B Procurement Guide',
        description:
          'Technical specifications for importing Indian First Special Grade (FSG) Castor Oil, Hydrogenated Castor Wax, and 12-HSA in bulk drum shipments.',
        keywords: ['castor oil exporter india', 'first special grade castor', 'hydrogenated castor oil', 'ricinoleic acid'],
      },
    },
    {
      title: 'Animal Feed Protein Benchmarks: Soya Meal vs Rapeseed Meal in Commercial Rations',
      slug: 'animal-feed-protein-benchmarks-soya-vs-rapeseed-meal',
      excerpt:
        'Nutritional comparison of Indian Non-GMO Soybean Meal (DOC) and Rapeseed/Mustard Meal: crude protein, amino acid profiles, fiber parameters, and bulk container shipping.',
      content: `## 1. Overview: Protein Density in Animal Nutrition

High-protein oilseed meals are the foundational protein source in modern compound animal feed manufacturing. For commercial feed millers balancing rations for poultry, aquaculture, and dairy cattle, optimizing the protein-to-fiber ratio while managing ingredient cost is critical.

Indian oilseed meals are derived from **Non-GMO crop varieties**, providing a significant advantage in markets with strict GMO labeling regulations.

---

## 2. Nutritional Parameter Comparison

| Nutrient Parameter | Indian De-Oiled Soybean Meal (Hi-Pro) | Indian Rapeseed / Mustard Meal (DOC) | Analytical Method |
|---|---|---|---|
| **Crude Protein (dry basis)** | **46.0% – 48.0%** | **35.0% – 38.0%** | Kjeldahl (N × 6.25) |
| **Crude Fat (Residual Oil)** | 0.8% – 1.5% | 0.8% – 1.5% | Soxhlet Extraction |
| **Crude Fiber** | Max 5.5% – 6.0% | Max 10.0% – 11.0% | Weende Method |
| **Sand & Silica (Insoluble Ash)** | Max 1.5% – 2.0% | Max 2.0% – 2.5% | Acid Insoluble Ash |
| **Moisture Content** | Max 11.0% – 12.0% | Max 10.0% | Oven Drying 105°C |
| **Protein Dispersibility Index (PDI)** | 15% – 30% | 15% – 25% | AOCS Ba 10-65 |

---

## 3. Target Species Suitability

- **Broiler & Layer Feeds:** Hi-Pro Soya Meal is the gold standard due to its high lysine content and minimal crude fiber.
- **Dairy Cattle & Buffalo Rations:** Rapeseed Meal provides excellent rumen bypass protein and sulfur amino acids (methionine), supporting butterfat production at an economical cost per protein unit.
- **Aquaculture (Fish & Shrimp):** Soya meal with low urease activity (0.05–0.20 ΔpH) ensures high digestibility and minimal water pollution.`,
      coverImage: {
        url: '/images/products/soybean-meal.webp',
        alt: 'Soybean Meal vs Rapeseed Meal Animal Feed Export',
      },
      author: {
        name: 'Gurpreet Singh',
        designation: 'Head of Animal Feed Desk',
        avatar: '/images/placeholders/avatar-default.jpg',
      },
      tags: ['Animal Feed', 'Soybean Meal', 'Rapeseed Meal', 'Poultry Feed', 'Non-GMO'],
      category: 'Animal Feed',
      status: 'published',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      readMinutes: 5,
      seo: {
        title: 'Soybean Meal vs Rapeseed Meal Animal Feed Protein Guide | JHS GLOBAL',
        description:
          'Compare crude protein, amino acids, and fiber in Indian Non-GMO Soybean Meal and Rapeseed Meal for commercial feed formulations.',
        keywords: ['soybean meal exporter india', 'rapeseed meal animal feed', 'non-gmo soya doc', 'feed ingredients bulk'],
      },
    },
    {
      title: 'Incoterms 2020 Demystified for Containerized Cargo: FOB vs CIF vs CFR',
      slug: 'incoterms-2020-demystified-for-containerized-agro-cargo-fob-cif-cfr',
      excerpt:
        'A practical procurement guide on ICC Incoterms 2020 for raw material container shipping from Mundra and Nhava Sheva (JNPT) ports. Cost allocation, marine insurance, and transfer of risk explained.',
      content: `## 1. Introduction to Incoterms 2020 in Bulk Trade

When negotiating bulk raw material contracts (botanical extracts, chemical ingredients, animal feed meals), the chosen International Commercial Term (Incoterm) governs the precise allocation of freight costs, marine cargo risk, export customs documentation, and delivery obligations between buyer and seller.

The International Chamber of Commerce (ICC) Incoterms 2020 rules provide 11 terms. In maritime container trade from Indian ports (Mundra, JNPT, Hazira, Pipavav), three terms represent over 90% of all commercial contracts: **FOB**, **CFR**, and **CIF**.

---

## 2. Term-by-Term Cost & Risk Comparison

| Milestone / Cost Element | FOB (Free On Board) | CFR (Cost and Freight) | CIF (Cost, Insurance & Freight) |
|---|---|---|---|
| **Origin Transport & Port Handling** | Paid by Exporter | Paid by Exporter | Paid by Exporter |
| **Indian Export Customs Clearance** | Paid by Exporter | Paid by Exporter | Paid by Exporter |
| **Export Inspection & Testing** | Paid by Exporter | Paid by Exporter | Paid by Exporter |
| **Ocean Vessel Freight** | Paid by Buyer | **Paid by Exporter** | **Paid by Exporter** |
| **Marine Cargo Insurance** | Covered by Buyer | Covered by Buyer | **Covered by Exporter (Institute Cargo Clauses)** |
| **Transfer of Cargo Risk** | When loaded on vessel at Indian port | When loaded on vessel at Indian port | When loaded on vessel at Indian port |
| **Destination Discharge & Demurrage** | Paid by Buyer | Paid by Buyer | Paid by Buyer |

---

## 3. Practical Recommendations for Overseas Importers

### When to Select CIF (Recommended for Most Importers)
Choosing **CIF (Destination Port)** provides predictable landing cost accounting. Because we maintain high-volume contracts with major container carriers (Maersk, MSC, CMA CGM, Hapag-Lloyd), our ocean freight slot allocations and Institute Cargo Clauses (A) marine transit insurance policies are typically more cost-effective than spot bookings made from abroad.

### When to Select FOB
Choose **FOB (Mundra or JNPT)** if your company has global enterprise contracts with sea freight carriers or dedicated maritime freight forwarding agents who coordinate multi-port container consolidations.`,
      coverImage: {
        url: '/images/placeholders/blog-logistics.jpg',
        alt: 'Container Maritime Shipping Incoterms Logistics',
      },
      author: {
        name: 'P. V. Chacko',
        designation: 'Head of Maritime Shipping & Trade Finance',
        avatar: '/images/placeholders/avatar-default.jpg',
      },
      tags: ['Incoterms', 'Maritime Logistics', 'Shipping', 'Risk Transfer', 'CIF vs FOB'],
      category: 'Export Logistics & Banking',
      status: 'published',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      readMinutes: 6,
      seo: {
        title: 'Incoterms 2020 for Container Raw Material Cargo: FOB vs CIF vs CFR Guide',
        description:
          'Clear comparison of FOB, CIF, and CFR terms for containerized export imports from Indian ports. Risk transfer and cost breakdowns.',
        keywords: ['incoterms 2020 export', 'fob vs cif container', 'mundra port shipping terms', 'marine cargo insurance'],
      },
    },
  ];

  for (const post of posts) {
    let existing = await BlogPost.findOne({ where: { slug: post.slug } });
    if (!existing) {
      await BlogPost.create(post);
      logger.info(`Created blog article: ${post.title}`);
    } else {
      await existing.update(post);
      logger.info(`Updated blog article: ${post.slug}`);
    }
  }

  logger.info('B2B export blog articles seeded successfully.');
};

export default seedBlogPosts;
