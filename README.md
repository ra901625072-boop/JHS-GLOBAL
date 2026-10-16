# JHS GLOBAL — International B2B Specialty Chemicals, Botanical Extracts, Nutraceuticals & Animal Feed Export Platform

A premium international B2B digital export portal and automated lead-generation engine designed for overseas commercial buyers, procurement directors, and wholesale importers across Personal Care Raw Materials, Nutraceutical Raw Materials, and Animal Feed.

---

## 1. System Architecture & Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, TanStack Query v5, React Router v6, React Helmet Async, Lucide Icons.
* **Backend:** Node.js, Express REST API mounted under `/api/v1`, Sequelize ORM, Zod runtime validation, Pino logger, Helmet, CORS, Express Rate Limit.
* **Database:** PostgreSQL 16+ (Sequelize models with 3NF relational normalization, JSONB dynamic specs, indexes, and full foreign key constraints).
* **AI Layer (Server-Side Only):** Retrieval-Augmented Generation (RAG) assistant querying live PostgreSQL catalogue specs; non-blocking lead triage and scoring engine (0–100); pre-composed sales response draft generator. Supports Mock, OpenAI, Google Gemini, and Anthropic Claude providers.
* **Design System:** Strict 3-brand-color token palette (Deep Navy `#0D2040`, Muted Gold `#C5A059`, Clean Canvas `#FBFBF9`). Accessible WCAG AA typography (`Playfair Display` serif for editorial hierarchy, `Plus Jakarta Sans` for technical data tables).

---

## 2. Directory Structure

```
export-b2b/
├── client/                     # Vite + React single-page frontend
│   ├── public/                 # Favicon, robots.txt, sitemap.xml fallback
│   ├── src/
│   │   ├── admin/              # JWT-authenticated Staff Lead Suite & Product CRUD
│   │   ├── app/                # Root Layout, Router, Query Client Providers
│   │   ├── components/         # Shared UI, Mega-menu, RFQ Drawers, Product Cards, AI Widget
│   │   ├── features/           # Modular domain APIs (products, inquiry, trust, blog, ai)
│   │   ├── pages/              # Buyer pages (Home, Products, Quality, Blog, RFQ, etc.)
│   │   ├── styles/             # Tailwind directives & typography layers
│   │   └── tokens/             # Design token constants (colors, fonts, radii, spacing)
├── server/                     # Express REST API backend
│   ├── src/
│   │   ├── config/             # Zod-validated environment config & logger
│   │   ├── middleware/         # Auth JWT verification, rate limiters, error handler
│   │   ├── modules/            # Domain modules (product, category, inquiry, sample, trust, blog, admin, ai)
│   │   ├── seeds/              # Idempotent database seeders (catalogue, articles, admin users)
│   │   └── utils/              # Standard JSON responses & email dispatcher
│   └── tests/                  # Vitest integration test suites (47 tests across 9 suites)
├── docs/                       # Specifications, database design, system design
└── package.json                # Monorepo workspaces manifest
```

---

## 3. Quick Start & Setup

### Prerequisites
* **Node.js:** v18+ (verified on v24)
* **PostgreSQL:** v16+ running locally (`postgres://postgres:postgres@localhost:5432/export_b2b`) or a managed PostgreSQL instance (AWS RDS, Supabase, Neon).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Files
Create local environment files from the provided templates:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Key `server/.env` settings:**
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/export_b2b

# Authentication
JWT_ACCESS_SECRET=your_32_char_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_32_char_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Configuration (Server-Side Only - never exposed to client)
LLM_PROVIDER=mock          # Options: mock | openai | gemini | anthropic
LLM_API_KEY=               # Leave blank for built-in grounded mock simulator
LLM_MODEL=gpt-4o-mini
```

### 3. Seed Database
Seeds 3 master export divisions, 10 subcategories, 20 export products with HS codes and lab specs, 6 verified government credentials (FSSAI Central License, APEDA, Spices Board of India, DGFT IEC, GST, MSME), international testimonials, FAQs, 4 technical blog articles, and staff accounts:
```bash
npm --prefix server run seed
```

#### Pre-Configured Staff Accounts:
* **Super Admin:** `admin@exportb2b.com` | `Admin@Export2026!`
* **Sales Desk:** `sales@exportb2b.com` | `Sales@Export2026!`
* **Content Editor:** `editor@exportb2b.com` | `Editor@Export2026!`

### 4. Start Development Servers
```bash
npm run dev
```
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
* **Admin Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 4. API Endpoint Index (`/api/v1`)

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | System status and PostgreSQL heartbeat |
| `GET` | `/categories` | Public | 3 export divisions and subcategory hierarchy |
| `GET` | `/products` | Public | Faceted product catalogue with search and filter |
| `GET` | `/products/:slug` | Public | Full product specification dossier & lab parameters |
| `POST` | `/inquiries` | Public | Multi-product RFQ submission with honeypot guard |
| `POST` | `/samples` | Public | Commercial sample requisition form |
| `GET` | `/certificates` | Public | Compliance certificates with PDF inspection |
| `GET` | `/testimonials` | Public | Verified buyer testimonials |
| `GET` | `/market-regions` | Public | Shipping corridors and delivery lead times |
| `GET` | `/faqs` | Public | Procurement, payment, and packing FAQs |
| `GET` | `/blog` | Public | Export technical guides and market analysis |
| `GET` | `/blog/:slug` | Public | Article body with SEO tags and JSON-LD schema |
| `GET` | `/sitemap.xml` | Public | Dynamic XML sitemap indexing all catalogue URLs |
| `GET` | `/robots.txt` | Public | Search crawler governance instructions |
| `POST` | `/ai/chat` | Public | Rate-limited grounded AI trade assistant |
| `POST` | `/auth/login` | Public | Staff login with access token and httpOnly refresh cookie |
| `POST` | `/auth/refresh` | Public | Silent token rotation |
| `POST` | `/auth/logout` | Protected | Invalidate session |
| `GET` | `/admin/dashboard` | Admin/Sales | Pipeline metrics, recent RFQs, and product counts |
| `GET` | `/admin/inquiries` | Admin/Sales | RFQ inbox with search, status, and country filters |
| `PATCH` | `/admin/inquiries/:id/status` | Admin/Sales | Update commercial stage and log team notes |
| `POST` | `/admin/products` | Admin/Editor | Create new catalogue commodity |
| `PUT` | `/admin/products/:id` | Admin/Editor | Update technical commodity specifications |
| `DELETE`| `/admin/products/:id` | Admin/Editor | Soft-deactivate commodity |
| `POST` | `/ai/admin/inquiries/:id/summarize` | Admin/Sales | Trigger AI lead scoring and executive summary |
| `POST` | `/ai/admin/inquiries/:id/reply-draft` | Admin/Sales | Pre-compose commercial quotation follow-up draft |

---

## 5. Security & Quality Architecture

1. **Zero Client Secrets:** No AI API keys or backend credentials exist in the client build. All LLM calls execute through backend routes.
2. **Strict B2B Model:** No e-commerce shopping carts, pricing calculators, or hardcoded retail prices. All transactions operate on "Price on Request" official RFQ workflows.
3. **Bot & Spam Mitigation:**
   * Honeypot field (`website_hp`) silently traps automated submissions without notifying bots.
   * Multi-tiered rate limiters for public routes, sensitive RFQ forms (`inquiryLimiter`), and AI endpoints (`aiLimiter`).
4. **Data Validation:** Every payload is validated against strict Zod schemas on the server before database persistence.
5. **Session Security:** Short-lived JWT access tokens (15 minutes in memory) paired with secure `httpOnly`, `sameSite: strict` refresh cookies (7 days).
6. **Graceful Placeholders:** Client-specific data, certificate license IDs, and product photography are clearly marked with `TODO(client)` markers to prevent fabricated claims.

---

## 6. Testing & Quality Verification

Run the comprehensive Vitest automated test suite:
```bash
npm --prefix server test
```
**Verification Coverage (57 Tests across 10 Suites + 40 AI Evaluation Cases):**
* `tests/evaluation.test.js` — 40 end-to-end benchmark tests for Visitor and Admin AI workflows (100% pass rate).
* `tests/ai.test.js` — RAG grounding verification, price refusal, lead scoring, and draft reply generation.
* `tests/admin.test.js` — Role-based access control (`admin`, `sales`, `editor`), dashboard metrics, product CRUD.
* `tests/auth.test.js` — Token issuance, invalid credential handling, refresh rotation, logout.
* `tests/blog.test.js` — Article publishing, slug resolution, 404 boundaries.
* `tests/category.test.js` — Category tree resolution and validation.
* `tests/health.test.js` — API health check and uptime ping.
* `tests/inquiry.test.js` — RFQ creation, honeypot trapping, sample requests, and validation.
* `tests/product.test.js` — Product pagination, text search, slug lookup, and related items.
* `tests/trust.test.js` — Certificates, testimonials, trade corridors, and FAQs.

Production build verification:
```bash
npm --prefix client run build
```

---

## 7. Production Deployment Runbook

### Option A: Node.js Reverse Proxy (Single Host / VPS)
1. Build frontend: `npm --prefix client run build`.
2. Configure Nginx reverse proxy:
   * Serve `client/dist` statically for all non-API paths.
   * Forward `/api/v1` traffic to `http://localhost:5000`.
3. Run backend with process manager: `pm2 start server/src/server.js --name "export-b2b-api"`.

### Option B: Cloud Architecture (Decoupled)
* **Frontend:** Deploy `client/dist` to Cloudflare Pages, Vercel, or AWS S3 + CloudFront.
* **Backend:** Deploy `server/` to AWS ECS, Google Cloud Run, or Render with managed PostgreSQL (AWS RDS / Supabase / Neon / Render Postgres).
* Set `VITE_API_BASE_URL=https://api.yourbrand.com/api/v1` in client environment.
* Set `CLIENT_URL=https://yourbrand.com` in server environment to configure CORS.
# JHS-GLOBAL
