# project.md — Export B2B Website (PERN + LLM)

> Official Brand: **JHS GLOBAL** (Jay Sureshbhai Prajapati, Surat, Gujarat)
> Stack: **React + Node.js + REST API + PostgreSQL 16+ + LLM (AI)**

---

## 1. What is this project?

A **premium international B2B export website** for Indian specialty chemicals, botanical extracts, nutraceuticals & animal feed export enterprise **JHS GLOBAL**. It is not an online shop (no cart, no checkout). Its job is to make overseas **importers, distributors, cosmetic/nutraceutical manufacturers and feed compounders** trust the company, browse products, and send a **Request a Quote (RFQ)**.

The business sells to buyers who purchase by the **container / metric tonne / drum**, negotiate price, ask for samples, and verify certificates before paying. So the website works as a **digital catalogue + trust builder + lead-generation machine**.

### Product Divisions & Catalogue (Official Source of Truth — 115 Active Commodities across 4 Divisions)

#### Category 1: Food & Food Ingredients (62 Commodities)
- **Spices & Seasoning (20)**: Cumin Seeds, Turmeric (Whole / Ground), Black Pepper, Cardamom, Coriander Seeds, Fennel Seeds, Fenugreek Seeds, Mustard Seeds, Dry Ginger, Red Chilli (Whole / Powder), Cinnamon / Cassia, Clove, Nutmeg / Mace, Bay Leaves, Star Anise, Curry Powder / Garam Masala, Celery Seeds, Dill Seeds, Oregano, Thyme.
- **Superfoods (10)**: Chia Seeds, Flax Seeds, Pumpkin Seeds, Sunflower Seeds, Quinoa, Spirulina Powder, Moringa Leaf Powder, Wheatgrass Powder, Amla Powder, Pomegranate Seed / Powder.
- **Pulses, Grains & Agri Commodities (19)**: 1121 Raw Basmati Rice, 1121 Golden Sella Basmati Rice, 1509 Basmati Rice, Sugandha Basmati Rice, Sharbati Basmati Rice, PR11 / PR14 Non-Basmati Rice, IR64 Non-Basmati Rice, Sona Masoori Rice, Chickpeas / Split Chickpeas (Kabuli / Desi), Green Mung Beans / Split Mung, Black Matpe (Urad Whole / Split), Red Lentils (Masoor Whole / Split), Pigeon Peas (Toor Dal), Yellow Peas, Wheat / Wheat Flour (Atta / Maida), Maize / Corn (Food Grade), Pearl Millet (Bajra), Sorghum (Jowar), Finger Millet (Ragi).
- **Fresh Fruits & Vegetables (7)**: Fresh Red Onion, Fresh White Onion, Fresh Garlic, Fresh Ginger, Fresh Green Cavendish Banana, Fresh Alphonso / Kesar Mango (Seasonal), Fresh Pomegranate.
- **Dehydrated Vegetables & Fruit (14)**: Dehydrated White Onion (Flakes / Powder / Minced / Chopped), Dehydrated Red Onion, Dehydrated Garlic (Granules / Powder / Minced), Dehydrated Ginger (Flakes / Powder), Dehydrated Green Chilli, Dehydrated Tomato (Flakes / Powder), Dehydrated Carrot (Cubes / Powder), Dehydrated Beetroot (Powder / Flakes), Dehydrated Spinach Powder, Dehydrated Mint Leaves / Powder, Dehydrated Kasuri Methi, Dehydrated Potato (Flakes / Powder), Dehydrated Apple (Dices / Powder), Dehydrated Lemon (Powder / Slices).
- **Specialty Food Ingredients (2)**: Pure Natural Honey, Aseptic Fruit Pulp (Mango / Guava / Papaya).

#### Category 2: Personal Care Raw Materials (13 Commodities)
- **Carrier Oils & Specialty Lipids**: Castor oil and its derivatives, Sesame Oil, Black Seed (Nigella Sativa) Oil, Virgin Coconut Oil.
- **Surfactants & Base Formulations**: Sodium lauryl ether sulfate (SLES), Coco Betaine (CAPB).
- **Cosmetic Actives & Hydroxy Acids**: Salicylic acid, Glycolic acid.
- **Functional Ingredients & Minerals**: Vitamin E acetate, Kaolin clay powder, Guar Gum (Cosmetic Grade), Aloe Vera Powder.
- **Botanical Extracts**: Herbal / botanical extracts.

#### Category 3: Nutraceutical Raw Materials (21 Commodities)
- **Standardized Botanical Extracts (9)**: Ashwagandha extract, Turmeric / curcumin extract, Boswellia serrata extract, Bacopa monnieri extract, Moringa oleifera extract, Amla extract, Green tea and Garcinia cambogia extracts, Pea protein isolate, Xanthan gum.
- **Herbal & Botanical Powders (12)**: Ashwagandha Powder, Moringa Powder, Tulsi Powder, Neem Powder, Amla Powder, Brahmi Powder, Shatavari Powder, Triphala Powder, Licorice (Mulethi) Powder, Giloy (Guduchi) Powder, Psyllium Husk / Powder, Indigo / Henna Powder.

#### Category 4: Animal Feed (19 Commodities)
- **Protein Oilseed Meals (4)**: Soybean meal, Rapeseed / mustard meal, Cottonseed meal, Feed-grade vitamins and minerals.
- **Grains & Feed Ingredients (15)**: De-oiled Rice Bran (DORB), Rice DDGS (Distillers Dried Grains with Solubles), Corn DDGS, Yellow Corn (Maize) - Feed Grade, Feed Wheat, Barley (Feed Grade), Groundnut / Peanut Meal (DOC), Sunflower Meal / Cake, Sesame Meal (DOC), Guar Churi / Guar Korma, Castor De-oiled Cake, Corn Gluten Meal (CGM 60%), Wheat Bran, Molasses (Cane Feed Grade), Limestone Powder (Calcite Feed Grade).

---

## 2. What we learned from the 6 reference sites

| Site | What they do well | What we copy / improve |
|---|---|---|
| shreebharateximx.com | Clear product lines, HS code on every product card, certificate PDFs on-page, "quote in 48h" promise, export-market list, blog | HS code + certificate PDFs + 48h sourcing promise |
| jenexglobal.com | Category → product → spec overview, downloadable catalogue PDF, private-label / services section, FAQ (MOQ, packing, shelf life) | Catalogue download, services section, FAQ |
| fittreeinternational.com | Mega-menu, private-labeling page, certification strip, quote popup, blog | Private-label page, popup RFQ, verified cert strip |
| omshreegroup.com/commodities | Category → sub-category → product hierarchy, buyer/supplier selector, trade-show banner, "min 1×20ft FCL" rule | 3-level category tree, buyer-type selector |
| horizonexim.co.in | Simple category pages, testimonials, FAQ (payment terms, delivery time), gallery, brochure PDF | Testimonials, gallery, payment/FAQ block |
| jftagro.com | Full RFQ form (commodity, MT, port, Incoterm, month), quote/packing/transit calculators, sample request, shipment tracker | Detailed RFQ fields, sample request, workflow section |
| flowtradeexim.com | 5-step "enquiry → shipment" process, global reach by region, simple product detail pages | Process timeline, region list |

### Common pattern across all of them

- **Weak points** (our opportunity): mostly WordPress/static HTML, generic stock photos, basic forms that email only, no admin lead tracking, no search, no AI help.
- **Strong points** to keep: category-first navigation, certificates visible everywhere, RFQ button on every page, WhatsApp button, specs (HS code, packing, MOQ, shelf life, origin) per product.

---

## 3. Typical pages on this type of site

| Page | Purpose |
|---|---|
| Home | Hero, 3 division cards (with interactive ingredient pill matrix and technical export standards bar), featured products, why choose JHS GLOBAL, certifications strip, export markets, process, testimonials, RFQ CTA |
| About Us / Company Profile | Story, Surat headquarters, infrastructure, team, export capacity, mission |
| Products (listing) | All categories, filters (category, origin, form, certification), search, 48-Hour Unlisted Sourcing Banner |
| Category page | Products of one category + sub-category tabs + 48-Hour Sourcing Banner |
| Product detail | Photos, specs table, packing, MOQ, shelf life, HS code, origin, certificates, "Add to Quote" |
| Quality & Certifications | Verified credentials: FSSAI Central License (10725997001058), APEDA (RCMC/APEDA/15765/2024-2025), Spices Board of India (CRES/SBCB/26585/2025-2026), DGFT IEC, GST, MSME (UDYAM-GJ-22-0460260); PDF downloads; NABL QC matrix |
| Export Process / Workflow | Enquiry → sample → QC → packing → shipment → docs |
| Private Label / OEM | Custom packing, branding, formulation |
| Global Reach | Countries / regions served |
| Blog / Insights | SEO articles, market updates |
| FAQ | MOQ, payment terms, Incoterms, documents |
| Contact + **Request a Quote** | Main conversion page |
| Admin panel (private) | Manage products, categories, enquiries, certificates, blog |

---

## 4. Typical workflow of such a project

```
Visitor (buyer) lands via Google / LinkedIn / WhatsApp / trade show
        │
        ▼
Browses categories → opens product → reads specs & certificates
        │
        ▼
Adds products to "Quote Basket" → fills RFQ form
        │
        ▼
Backend validates → saves to PostgreSQL → emails buyer (auto-reply) + sales team
        │
        ▼
AI summarises & scores the enquiry, drafts a reply for the sales team
        │
        ▼
Sales team replies in 24–48h → sample → proforma invoice → order
```

---

## 5. Tech stack and why each part is used

| Layer | Tech | Purpose |
|---|---|---|
| Frontend | **React** (Vite) + React Router + Tailwind CSS | Fast SPA, reusable product cards, premium UI; SSR/SEO handled with prerender or Next-style meta via `react-helmet-async` |
| Backend | **Node.js + Express** | REST API, auth, validation, file upload, email |
| API style | **REST** (JSON, versioned `/api/v1`) | Simple, cacheable, easy for frontend and admin |
| Database | **PostgreSQL 16+** (Sequelize) | Robust ACID transactional integrity, relational 3NF (orders, quotations, RFQs), foreign key enforcement, and JSONB columns for flexible dynamic product specs |
| AI | **LLM API** (Claude / OpenAI, server-side only) | See section 6 |
| Media | Cloudinary or S3 + CDN | Optimised product images (WebP), PDFs |
| Email | Nodemailer + SMTP / Resend | Quote confirmation + notifications |
| Cache / limits | Redis (optional, recommended) | Caching, rate limits, queues |
| Deploy | Vercel/Netlify (frontend), Render/Railway/VPS (API), AWS RDS / Supabase / Neon / Self-hosted PostgreSQL | High reliability, ACID guarantees, cheap and scalable |

---

## 6. Where the LLM (AI) helps

1. **Quote assistant (chat widget)** — answers buyer questions from our own product data (RAG): "Do you have Ashwagandha extract with 5% withanolides or USP grade Salicylic acid?" → returns matching products + link.
2. **RFQ summariser & lead scorer** — turns a long enquiry into a 3-line summary, extracts product / quantity / port / Incoterm, scores lead priority (hot / warm / cold).
3. **Reply drafter** — drafts a professional email reply for the sales team to review and send.
4. **Product description helper (admin)** — generates SEO title, meta description and spec text from basic fields; admin edits and approves.
5. **Multi-language enquiry support** — detects the buyer's language and translates the enquiry for the sales team.
6. **Smart search** — natural-language search ("pharmaceutical grade glycolic acid or non-GMO soybean meal") mapped to filters.

**Rule:** AI never invents prices, certificates or specs. It only answers from database content and says "our team will confirm" otherwise. All AI output to buyers is logged; reply drafts need human approval.

---

## 7. Purpose and benefits

**For the client (exporter)**
- Looks like a serious international supplier → higher trust.
- Every enquiry is saved, scored and trackable (no lost WhatsApp messages).
- Sales team saves time with AI summaries and draft replies.
- Product data managed from one admin panel.
- SEO-ready pages bring organic buyers.

**For the buyer (importer)**
- Finds the exact product and its specs quickly.
- Sees certificates before contacting.
- Sends one clear RFQ with multiple products.
- Gets a fast acknowledgement.

---

## 8. Scope

**In scope (v1):** public site, product catalogue, RFQ + sample request, certificates, blog, admin panel, email notifications, AI quote assistant + RFQ summariser, SEO, analytics.

**Out of scope (v1):** online payments, buyer accounts / portal, shipment tracking, multi-currency pricing, mobile app.

**Later (v2):** buyer login with RFQ history, live price indices, shipment tracker, WhatsApp Business API integration, multi-language site.

---

## 9. Success metrics

- RFQ conversion rate (visits → submitted RFQ)
- Median first-response time (target ≤ 24h)
- % of RFQs with complete info (product, MT, port)
- Organic search traffic and top-10 keywords
- Core Web Vitals: LCP < 2.5 s on mobile

---

## 10. File map of this documentation

| File | Content |
|---|---|
| `project.md` | This file — what, why, tech, how |
| `folder-structure.md` | Recommended folders and how to build in them |
| `database-design.md` | PostgreSQL 3NF tables, JSONB schemas, foreign keys, indexes, ERD |
| `system-design.md` | Architecture, workflows, cache, rate limits, API list |
| `agent.md` | Rules for the AI coding agent (do / don't / how) |
