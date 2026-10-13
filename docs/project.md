# project.md — Export B2B Website (PERN + LLM)

> Working name: **[BrandName] Exports** — replace with the client's brand.
> Stack: **React + Node.js + REST API + PostgreSQL + LLM (AI)**

---

## 1. What is this project?

A **premium international B2B export website** for an Indian agri / food-ingredient exporter. It is not an online shop (no cart, no checkout). Its job is to make overseas **importers, distributors, food manufacturers and brand owners** trust the company, browse products, and send a **Request a Quote (RFQ)**.

The business sells to buyers who purchase by the **container / metric tonne**, negotiate price, ask for samples, and verify certificates before paying. So the website works as a **digital catalogue + trust builder + lead-generation machine**.

### Product categories (from client brief)

1. Spices, Seasonings & Herbs
2. FMCG & Ethnic Indian Food Products
3. Pulses, Rice & Agricultural Commodities
4. Fresh & Dehydrated Fruits and Vegetables
5. Superfoods
6. Personal Care Raw Materials
7. Nutraceutical Raw Materials
8. Animal Feed

---

## 2. What we learned from the 6 reference sites

| Site | What they do well | What we copy / improve |
|---|---|---|
| shreebharateximx.com | Clear 5 product lines, HS code on every product card, certificate PDFs on-page, "quote in 48h" promise, export-market list, blog | HS code + certificate PDFs + response-time promise |
| jenexglobal.com | Category → product → spec overview, downloadable catalogue PDF, private-label / services section, FAQ (MOQ, packing, shelf life) | Catalogue download, services section, FAQ |
| fittreeinternational.com | Huge mega-menu (17 categories), private-labeling page, certification logos (FSSAI, APEDA, HACCP, Halal, BRCGS, USDA Organic), quote popup, blog | Private-label page, popup RFQ, cert logo strip |
| omshreegroup.com/commodities | Category → sub-category → product hierarchy, buyer/supplier/other selector, trade-show banner, "min 1×20ft FCL" rule | 3-level category tree, buyer-type selector |
| horizonexim.co.in | Simple category pages, testimonials, FAQ (payment terms, delivery time), gallery, brochure PDF | Testimonials, gallery, payment/FAQ block |
| jftagro.com | Most advanced: full RFQ form (commodity, MT, port, Incoterm, month), quote/packing/transit calculators, sample request, shipment tracker, export workflow, due-diligence section | Detailed RFQ fields, sample request, workflow section |
| flowtradeexim.com | 5-step "enquiry → shipment" process, global reach by region, simple product detail pages | Process timeline, region list |

### Common pattern across all of them

- **Weak points** (our opportunity): mostly WordPress/static HTML, generic stock photos, basic forms that email only, no admin lead tracking, no search, no AI help.
- **Strong points** to keep: category-first navigation, certificates visible everywhere, RFQ button on every page, WhatsApp button, specs (HS code, packing, MOQ, shelf life, origin) per product.

---

## 3. Typical pages on this type of site

| Page | Purpose |
|---|---|
| Home | Hero, 8 category cards, featured products, why choose us, certifications strip, export markets, process, testimonials, RFQ CTA |
| About / Company Profile | Story, infrastructure, team, export capacity, mission |
| Products (listing) | All categories, filters (category, origin, form, certification), search |
| Category page | Products of one category + sub-category tabs |
| Product detail | Photos, specs table, packing, MOQ, shelf life, HS code, origin, certificates, "Add to Quote" |
| Quality & Certifications | FSSAI, APEDA, IEC, ISO 22000, HACCP, Halal, Kosher, Organic; PDF downloads; QC process |
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

1. **Quote assistant (chat widget)** — answers buyer questions from our own product data (RAG): "Do you have 25 kg turmeric finger with 3% curcumin?" → returns matching products + link.
2. **RFQ summariser & lead scorer** — turns a long enquiry into a 3-line summary, extracts product / quantity / port / Incoterm, scores lead priority (hot / warm / cold).
3. **Reply drafter** — drafts a professional email reply for the sales team to review and send.
4. **Product description helper (admin)** — generates SEO title, meta description and spec text from basic fields; admin edits and approves.
5. **Multi-language enquiry support** — detects the buyer's language and translates the enquiry for the sales team.
6. **Smart search** — natural-language search ("organic turmeric from Salem") mapped to filters.

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
