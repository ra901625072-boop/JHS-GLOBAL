# JHS GLOBAL — Complete Page & Route Discovery Matrix

**Project:** JHS GLOBAL (International B2B Agro & Specialty Chemicals Exporter)  
**Client Environment:** `http://localhost:5173` | **API Server:** `http://localhost:5000/api/v1`  
**Brand Spelling:** JHS GLOBAL  
**Database:** PostgreSQL (Seeded with 3 Divisions, 10 Subcategories, 20 Verified Export Products, 7 Government Certificates, 7 Technical Blog Articles, 29 Procurement FAQs, 3 Staff Accounts)  
**Audit & Capture Role:** Senior UI/UX Designer & Product Photographer

---

## 1. Public Buyer Portal Routes

| # | Page / View Name | Route URL | Purpose & Buyer Context | Key States & Sections to Capture |
|---|---|---|---|---|
| 1 | **Home / Landing** | `/` | Flagship international storefront. Establishes commercial credibility, shows 3 master divisions, featured agro/chemical lines, verified credentials marquee, complete supply chain infrastructure, and instant RFQ entry. | • Full scroll (Desktop 1440 & Mobile 390)<br>• Hero viewport (16:9)<br>• 3 Division Cards Grid<br>• Technical Export Standards Bar<br>• Certification Marquee & Badges<br>• Interactive World Trade Map<br>• Product Showcase Marquee<br>• FAQ Accordion Preview<br>• Sticky Mobile Quote Bar (mobile) |
| 2 | **About Us & Infrastructure** | `/about-us` | Corporate profile, founder leadership, multi-commodity processing & warehouse infrastructure, export capacity (FCL/MT), flexible port logistics, and quality control ethos. (Handles redirects from `/about`, `/private-label`, `/global-reach`). | • Full scroll (Desktop & Mobile)<br>• Hero banner & Mission statement<br>• Founder & Executive profile card (`FounderCard.jsx`)<br>• Operational & Logistics capacity grid<br>• Corporate values & ESG compliance |
| 3 | **Products Catalogue (All)** | `/products` | Master catalogue index for overseas procurement officers. Multi-attribute filtering (Division, Form, Origin, Certifications), live keyword search, dynamic counts, and 48-Hour Unlisted Sourcing Banner. | • Full catalogue scroll<br>• Desktop filter sidebar vs Mobile filter sheet<br>• Active search & filter chips<br>• Product card grid (Rest & Hover states)<br>• Unlisted Sourcing Banner<br>• Empty state (when filter yields 0 matches) |
| 4 | **Category: Personal Care** | `/products?category=personal-care-raw-materials` | Filtered division view for cosmetic chemists, soap formulators, and cosmetic manufacturers. Features castor derivatives, surfactant bases (SLES), cosmetic acids, and clays. | • Division hero & subcategory tab strip<br>• Filtered product card grid<br>• Active category badges |
| 5 | **Category: Nutraceuticals** | `/products?category=nutraceutical-raw-materials` | Filtered division view for dietary supplement manufacturers and nutraceutical brands. Focuses on HPLC-standardized extracts (Ashwagandha, Curcumin, Boswellia) and plant proteins. | • Division header with botanical extraction focus<br>• Product card grid with HPLC purity badges<br>• Subcategory tab filter states |
| 6 | **Category: Animal Feed** | `/products?category=animal-feed` | Filtered division view for feed compounders, livestock integrators, and grain trading houses. Highlights solvent-extracted meals (Soybean DOC, Rapeseed, Cottonseed) and feed premixes. | • Division header with protein benchmarks & bulk MT metrics<br>• Product cards with moisture & crude protein tags |
| 7 | **Product Detail: Castor Oil** | `/products/castor-oil-and-derivatives` | Representative Personal Care detail page. Detailed technical specification table, fatty acid profile, packing drums/IBCs, FCL loadability, COA/MSDS download triggers, and Add to Quote. | • Full page scroll<br>• Above-the-fold 16:9 hero with gallery<br>• Technical Spec Table (`SpecTable.jsx`)<br>• Packaging options & container loadability calculator<br>• "Add to Quote" button (Rest, Clicked, Added state) |
| 8 | **Product Detail: SLES** | `/products/sodium-lauryl-ether-sulfate-sles` | High-volume surfactant export detail page. Concentration benchmarks (70%), foaming/active matter specs, 170kg HDPE drum packing, and export container specs. | • Technical specifications & CAS/EINECS details<br>• Certificate attachment tags<br>• Quote Drawer trigger interaction |
| 9 | **Product Detail: Ashwagandha** | `/products/ashwagandha-extract` | Flagship Nutraceutical detail page. Standardized Withanolides HPLC percentage, heavy metal limits, organic/kosher/halal eligibility, and pilot sample request CTA. | • High-resolution botanical imagery<br>• HPLC specification table<br>• Direct "Request Sample" modal/link |
| 10 | **Product Detail: Turmeric Curcumin** | `/products/turmeric-curcumin-extract` | Key botanical extract detail page. 95% Curcuminoids HPLC assay, Salem vs Alleppey origin, food/supplement compliance, and technical data sheets. | • Assay specification layout<br>• Quality verification badges<br>• Related products carousel |
| 11 | **Product Detail: Soybean Meal** | `/products/soybean-meal` | Representative Animal Feed bulk commodity page. High protein (min 46-48%), moisture content, bulk polypropylene packaging, FCL breakbulk logistics. | • Bulk container load metrics<br>• Feed analysis certificate breakdown<br>• Direct FCL enquiry CTA |
| 12 | **Quality & Certifications** | `/quality` | High-stakes trust-building page for international trade compliance. Displays verified government credentials (FSSAI Central, APEDA RCMC, Spices Board of India CRES, DGFT IEC, GST, MSME UDYAM), 4-tier quality assurance workflow matrix, and verified registration numbers. | • Full scroll<br>• Government license verification cards (with license numbers)<br>• Quality specification and verification matrix<br>• Certificate inspection modal / PDF trigger<br>• Batch traceability workflow |
| 13 | **Export Process & Incoterms** | `/export-process` | Step-by-step export roadmap demystifying the trade journey from initial RFQ to customs clearance and bill of lading release. Explains Incoterms 2020 (FOB, CIF, CFR) and international payment security (LC at sight, TT). | • Full process timeline (6-stage pipeline)<br>• Incoterms comparison matrix<br>• Documentation checklist (BL, COA, COO, Phytosanitary, Commercial Invoice)<br>• Interactive step hover states |
| 14 | **Commercial Sample Request** | `/sample-request` | Dedicated sample dispatch request portal for lab evaluation prior to commercial contract signing. Outlines DHL courier terms, sample weight limits (100g-500g), and evaluation criteria. | • Full page scroll<br>• Sample Request Form (empty state)<br>• Form validation state (required fields)<br>• Filled sample form state<br>• Courier & Dispatch timeline infographic |
| 15 | **Knowledge & Insights Blog** | `/blog` | Technical B2B editorial archive. In-depth procurement guides, HPLC assay chemistry, EU MRL pesticide residue rules, and freight market trends. | • Full blog listing scroll<br>• Editorial featured hero article<br>• Topic category filter pills<br>• Article cards with read-time and author attribution |
| 16 | **Blog Post Detail** | `/blog/curcumin-biomarker-chemistry-hplc-standardization-guide` | Long-form technical article. Deep-dive into HPLC analysis, USP/EP pharmacopeial benchmarks, botanical fingerprinting, and buyer procurement checklists. | • Editorial typography layout (Playfair serif headings, formatted tables)<br>• Author bio card & publication date<br>• Embedded technical comparison charts<br>• In-article "Inquire on this Ingredient" CTA box |
| 17 | **Procurement FAQ** | `/faq` | Categorized accordion repository answering overseas buyer queries on MOQ, payment terms (LC/TT), lead times, sample delivery, and container loadability. | • Full page view<br>• Category tab selector (All, Shipping, Payment, Quality)<br>• Accordion closed states<br>• Accordion open state showing detailed answer |
| 18 | **Contact & Request a Quote** | `/contact` | Primary high-conversion transaction portal. Comprehensive multi-step B2B RFQ form capturing Incoterms, destination port, container volume, custom packing requirements, plus Surat HQ physical coordinates and interactive Google Maps embed. | • Full page view<br>• RFQ Form (Empty state)<br>• RFQ Form (Filled with realistic mock business data)<br>• RFQ Form (Live validation feedback state)<br>• Surat registered office details & maritime port links |
| 19 | **404 Not Found Page** | `/non-existent-page-test-404` | Branded fallback view for invalid routes. Provides quick navigation recovery links back to the catalogue, home, or export desk. | • Centered 404 illustration & error message<br>• Quick-navigation recovery buttons |

---

## 2. Interactive Global Overlays & Micro-States (Cross-Page)

| # | Element / Overlay Name | Trigger Mechanism | Visual States to Capture |
|---|---|---|---|
| A | **Global Navigation Header** | Sticky top bar across all pages | • Top utility bar (APEDA/FSSAI badges, loading ports, 48h turnaround)<br>• Default transparent/translucent state<br>• Scrolled elevated state (`shadow-card`, backdrop blur)<br>• Active route indicators |
| B | **Mobile Menu Drawer** | Hamburger menu button (`sm` and `xs` viewports) | • Full mobile navigation slide-in (`MobileMenuDrawer.jsx`)<br>• Division quick links and contact touchpoints |
| C | **Quote Basket Drawer** | Floating shopping bag icon in header | • Empty drawer state ("Your quote basket is empty")<br>• Filled drawer state (with 2-3 products added, MT quantity, remove triggers)<br>• Slide-out animation & backdrop blur |
| D | **AI Buyer Assistant Chat** | Floating AI widget badge (bottom right) | • Minimized floating badge with pulse indicator<br>• Expanded chat window showing seeded RAG prompt buttons and greeting<br>• Interactive query state |
| E | **WhatsApp Direct Connect** | Floating WhatsApp button (bottom left) | • Rest state with pulsing ring<br>• Hover tooltip displaying export desk direct WhatsApp link |
| F | **Sticky Mobile Quote Bar** | Scroll on mobile devices (`StickyMobileQuoteBar.jsx`) | • Mobile bottom docking bar with direct "RFQ" and "Call" action buttons |

---

## 3. Admin Operations Suite (`/admin`)

*Note: Captures use pre-configured local staff credentials (`admin@exportb2b.com`). Strictly mock/seeded records; no private or sensitive data captured.*

| # | Admin View Name | Route URL | Purpose & Operations Managed | Key States to Capture |
|---|---|---|---|---|
| 20 | **Admin Login Portal** | `/admin/login` | Secure JWT authentication entry with double-click secret trigger in footer or direct URL. | • Login card with security badges<br>• Form empty state<br>• Filled state |
| 21 | **Admin Command Dashboard** | `/admin` | Real-time export operations overview. Metrics for pending RFQs, sample dispatches, active catalogue count, and quick pipeline status. | • Full dashboard layout<br>• KPI metric cards (Total Inquiries, Samples Dispatched, Active Products)<br>• Recent inquiries timeline |
| 22 | **Inquiry & RFQ Manager** | `/admin/inquiries` | Overseas buyer inquiry triage. Status pipelines (New, Under Review, Quoted, Closed), SLA deadlines, AI scoring preview, and spam flagging. | • Inquiry data table with status badges<br>• Filter tabs (New, Quoted, All)<br>• Inquiry detail drawer / modal view |
| 23 | **Sample Request Tracker** | `/admin/samples` | Tracking physical lab sample couriers (DHL/FedEx), AWB numbers, dispatch dates, and delivery confirmations. | • Sample dispatch table<br>• AWB tracking indicators |
| 24 | **Product Catalogue Manager** | `/admin/products` | CRUD management of the 20 export items, HS codes, CAS numbers, active status, and technical specifications. | • Products data table with thumbnail previews<br>• Category filter dropdown<br>• Edit product modal or drawer |
| 25 | **Category Tree Manager** | `/admin/categories` | Hierarchy management of 3 master divisions and 10 subcategories. | • Category tree structure<br>• Division ordering and status switches |
| 26 | **Certificates Manager** | `/admin/certificates` | Management of FSSAI, APEDA, Spices Board, DGFT, and ISO certificate records and PDF attachments. | • Certificate cards grid<br>• Issuing authority and validity dates |
| 27 | **Company Knowledge Base** | `/admin/company-knowledge` | RAG ground-truth context repository powering the server-side AI Buyer Assistant. | • Fact items list with retrieval tags<br>• Add new knowledge modal |
| 28 | **Blog CMS Manager** | `/admin/blog` | Technical article publishing suite with markdown/rich editor, meta tags, and read-time calculations. | • Articles table with publication dates & status badges |
| 29 | **Procurement FAQ Manager** | `/admin/faqs` | Q&A editor for buyer inquiries with category tags and home page display order toggles. | • Categorized FAQ list with drag/order handles |
| 30 | **User & Role Administration** | `/admin/users` | Staff access control (Super Admin, Sales Desk, Content Editor) with role-based permissions. | • Staff user table with role badges (Admin, Sales, Editor) |
| 31 | **Export Platform Settings** | `/admin/settings` | Global system configurations, SLA alert thresholds, notification emails, and AI model parameters. | • Configuration settings form layout |

---
