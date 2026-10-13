# system-design.md — System Design

Scale assumption: **B2B catalogue site** — low write volume (tens of RFQs/day), moderate read volume (thousands of visits/day), spikes after trade shows or email campaigns. A **modular monolith** is the right choice (no microservices).

---

## 1. High-level architecture

```
                    ┌──────────────┐
   Buyer browser ──►│  CDN (Cloudflare / Vercel Edge)  │── static React build, images, PDFs
                    └──────┬───────┘
                           │ /api/*
                    ┌──────▼───────┐
                    │ Node/Express │  (REST API, stateless, 2+ instances)
                    │  - auth      │
                    │  - catalogue │
                    │  - inquiry   │
                    │  - ai        │
                    └──┬───┬───┬───┘
        ┌──────────────┘   │   └───────────────┐
 ┌──────▼──────┐    ┌──────▼──────┐     ┌──────▼───────┐
 │ PostgreSQL  │    │   Redis     │     │ Object store │
 │ (RDS/Cloud) │    │ cache+queue │     │ S3/Cloudinary│
 └─────────────┘    └──────┬──────┘     └──────────────┘
                           │ jobs
                    ┌──────▼──────┐        ┌─────────────┐
                    │ Worker      │───────►│ LLM API     │
                    │ (BullMQ)    │        │ (Claude/GPT)│
                    └──────┬──────┘        └─────────────┘
                           └──────────────► Email (SMTP/Resend)
```

- **Frontend** = static files on CDN (fast, cheap, SEO-friendly with prerender).
- **API** = stateless; scales by adding instances.
- **Worker** = same codebase, separate process; handles email, AI summary, embeddings so the user never waits.
- **Redis** = cache + rate-limit counters + job queue. (Optional in v1 → use in-memory cache + `express-rate-limit`; switch to Redis when running >1 instance.)

---

## 2. Main workflows

### 2.1 Browse → product (read path)
```
Browser → CDN (static) → React → GET /api/v1/products?category=personal-care-raw-materials
        → cache middleware (Redis hit?) ── yes → return JSON
                                          └─ no → PostgreSQL → store in cache → return
```

### 2.2 Request a Quote (write path — the key flow)
```
1. Buyer adds products to Quote Basket (localStorage)
2. Submit RFQ form → POST /api/v1/inquiries
3. Middleware: rate limit → reCAPTCHA/honeypot → validation → sanitise
4. Service: create Inquiry (status=new, referenceNo) → 201 response immediately
5. Enqueue jobs:
     a) email buyer: "We received your RFQ (ref RFQ-2026-000123)"
     b) email sales team: new lead + admin link
     c) AI job: summarise, extract fields, lead score, draft reply
6. Worker saves AI result into inquiry.ai → admin sees it in inbox
7. Sales reviews → edits draft → sends reply → status = quoted
```
Response time target for step 2–4: **< 500 ms** (AI work is async).

### 2.3 AI Quote Assistant (chat)
```
User question → POST /api/v1/ai/chat (SSE stream)
  → rate limit + input length cap + abuse filter
  → embed question → PostgreSQL pgvector search (HNSW cosine similarity, top 5 products/FAQs)
  → prompt = system rules + retrieved context + last 6 messages
  → LLM → stream tokens to browser
  → if user shows buying intent → suggest "Add to quote / Send RFQ"
  → log usage, store session
```
Guardrails: answer **only from retrieved context**; no prices, no invented certificates; if unsure → "Our export team will confirm — send an RFQ."

### 2.4 Admin publishing
```
Admin login (JWT) → create/update product → upload images (signed upload to storage)
 → save in PostgreSQL → purge cache keys (products:*) → enqueue re-embedding → optionally AI SEO helper
```

---

## 3. API structure (REST, versioned)

Base: `/api/v1` — JSON — standard response:
```json
{ "success": true, "data": {...}, "meta": { "page":1, "limit":12, "total":20 } }
{ "success": false, "error": { "code":"VALIDATION_ERROR", "message":"...", "details":[...] } }
```

### Public endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/categories` | Category tree |
| GET | `/categories/:slug` | One category + children |
| GET | `/products` | List: `?category=&sub=&q=&form=&origin=&cert=&page=&limit=&sort=` |
| GET | `/products/featured` | Home page |
| GET | `/products/:slug` | Product detail |
| GET | `/products/:slug/related` | Related products |
| GET | `/search/suggest?q=` | Autocomplete |
| GET | `/certificates` | Public certificates |
| GET | `/testimonials` | |
| GET | `/market-regions` | |
| GET | `/faqs` | |
| GET | `/blog` , `/blog/:slug` | |
| GET | `/settings/public` | Company info, stats |
| POST | `/inquiries` | **Submit RFQ** |
| POST | `/samples` | Sample request |
| POST | `/contact` | Contact message |
| POST | `/newsletter` | Subscribe |
| POST | `/ai/chat` | Quote assistant (stream) |
| GET | `/health` | Uptime check |

### Admin endpoints (JWT + role)
| Method | Path | Role |
|---|---|---|
| POST | `/auth/login`, `/auth/refresh`, `/auth/logout` | public |
| GET/POST/PUT/DELETE | `/admin/products` , `/admin/categories` | admin, editor |
| GET/POST/PUT/DELETE | `/admin/certificates`, `/admin/blog`, `/admin/faqs`, `/admin/testimonials` | admin, editor |
| GET | `/admin/inquiries` (filters: status, country, priority, date) | admin, sales |
| GET/PATCH | `/admin/inquiries/:id` (status, assign, notes) | admin, sales |
| POST | `/admin/inquiries/:id/ai/regenerate` | admin, sales |
| POST | `/admin/inquiries/:id/reply` (send approved reply) | admin, sales |
| GET | `/admin/samples`, PATCH `/admin/samples/:id` | admin, sales |
| POST | `/admin/upload` (signed URL) | admin, editor |
| POST | `/admin/ai/seo` (generate SEO text) | admin, editor |
| GET | `/admin/dashboard` (counts, charts) | admin, sales |
| GET/POST/PATCH | `/admin/users` | admin |

### Conventions
- Plural nouns, `kebab-case`, no verbs in paths (except actions like `/regenerate`).
- Pagination: `page`, `limit` (max 50). Sorting: `sort=-createdAt`.
- Idempotency: RFQ accepts an `Idempotency-Key` header to avoid double submit.
- Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500.

---

## 4. Caching strategy

| Layer | What | TTL | Invalidation |
|---|---|---|---|
| **CDN / browser** | JS/CSS (hashed), images, PDFs | 1 year (`immutable`) | new filename on build |
| **CDN** | `index.html` | no-cache / short | each deploy |
| **API response (Redis)** | `GET /categories` | 1 h | on category change |
| | `GET /products` (by query hash) | 10 min | on product change → delete `products:*` |
| | `GET /products/:slug` | 30 min | on that product update |
| | `GET /certificates`, `/market-regions`, `/faqs`, `/settings/public` | 1 h | on admin edit |
| **HTTP headers** | `Cache-Control: public, max-age=60, stale-while-revalidate=300` on public GETs, `ETag` enabled | | |
| **Client (TanStack Query)** | `staleTime` 5 min for catalogue | | refetch on window focus off |
| **AI** | Cache FAQ-like chat answers by normalised question hash | 24 h | when product data changes |
| **Never cache** | `/inquiries`, `/admin/*`, `/auth/*` | | |

Key naming: `v1:products:list:<hash>`, `v1:product:<slug>`, `v1:categories:tree`.
Pattern: **cache-aside** (read from cache → miss → DB → set).

---

## 5. Rate limiting and abuse protection

| Endpoint group | Limit (per IP) | Window | Notes |
|---|---|---|---|
| General public GET | 300 | 15 min | |
| `POST /inquiries` | **5** | 1 h | + 20/day per email; reCAPTCHA v3 + honeypot field |
| `POST /samples`, `/contact` | 5 | 1 h | |
| `POST /newsletter` | 5 | 1 h | |
| `POST /ai/chat` | **20** msgs | 10 min | + max 2000 chars input, + daily global token budget |
| `POST /auth/login` | 5 | 15 min | lock account 15 min after 5 fails |
| `/admin/*` | 600 | 15 min | per user |
| `POST /admin/upload` | 30 | 1 h | file type + size (≤ 5 MB images, ≤ 10 MB PDF) |

Implementation: `express-rate-limit` + `rate-limit-redis`. Return `429` with `Retry-After`.
Extra: `helmet`, strict CORS (only our domains), body size limit 1 MB, SQL parameterized queries via Sequelize (SQL injection prevention), `xss` sanitising, input validation on every route, Cloudflare WAF/bot protection.

---

## 6. Security

- **Auth:** admin only. JWT access token (15 min) + httpOnly refresh cookie (7 d), bcrypt (cost 12), role-based guards.
- **Secrets:** env vars only; LLM keys **server-side only**, never in React bundle.
- **Uploads:** validate MIME + size, rename files, store outside server disk (S3/Cloudinary).
- **PII:** buyer email/phone stored; hash IPs; privacy policy + cookie consent; allow deletion on request (GDPR-friendly).
- **HTTPS everywhere**, HSTS, secure cookies, dependency audit (`npm audit`) in CI.
- **AI security:** treat user text as untrusted (prompt-injection). System prompt rules cannot be overridden; AI has **no tools that write data**; output is escaped before rendering.
- **Backups + audit logs** for admin changes.

---

## 7. AI design details

| Feature | Trigger | Sync/Async | Model tier | Output |
|---|---|---|---|---|
| Quote assistant | user chat | sync stream | fast/small model | answer + product links |
| RFQ summary + extraction + score | new inquiry | **async job** | small model, JSON mode | `{summary, extracted, leadScore, language}` |
| Reply draft | after summary | async | mid model | email draft (human approves) |
| SEO helper | admin click | sync | small | title, meta, description |
| Translation | non-English RFQ | async | small | English copy |

- **Prompts** live in `ai/prompts/` (versioned files, not inline strings).
- **Structured output:** require JSON schema, validate with Zod, retry once on invalid JSON.
- **Timeouts:** 20 s; on failure the inquiry still works (AI is an enhancement, never a dependency).
- **Cost control:** daily token budget, per-IP chat limits, response caching, log in `aiUsageLogs`.
- **RAG:** chunk product + FAQ text (~300 tokens), embed, store in `embeddings`, top-k = 5, min similarity threshold; re-embed on change.

---

## 8. Background jobs (BullMQ on Redis)

| Queue | Job | Retries |
|---|---|---|
| `email` | send buyer ack, team alert, reply | 5, exponential |
| `ai` | summarise inquiry, draft reply | 3 |
| `embedding` | embed product / FAQ | 3 |
| `maintenance` | certificate-expiry reminder (weekly), cleanup old chats, sitemap rebuild (daily) | 1 |

If Redis is not used in v1: use a simple in-process queue + `node-cron`, then migrate.

---

## 9. SEO and performance

- **Rendering:** React SPA with **prerendering** (e.g. `vite-plugin-ssr` / `react-snap`) for Home, categories, products, blog — or choose Next.js if SEO is the top priority (default stays plain React per the client brief).
- `react-helmet-async` for title/meta/OG, JSON-LD (`Organization`, `Product`, `BreadcrumbList`, `FAQPage`), `sitemap.xml`, `robots.txt`, canonical URLs, clean slugs.
- Images: WebP/AVIF, responsive `srcset`, lazy load, CDN transform.
- Code split per route; fonts self-hosted with `font-display: swap`.
- Targets: LCP < 2.5 s, CLS < 0.1, Lighthouse ≥ 90 mobile.

---

## 10. Observability and operations

- **Logging:** `pino` JSON logs with request ID; no PII in logs.
- **Errors:** Sentry (frontend + backend).
- **Uptime:** `/api/v1/health` checked by UptimeRobot; alert on failure.
- **Analytics:** GA4 / Plausible; events: `view_product`, `add_to_quote`, `submit_rfq`, `click_whatsapp`, `download_catalogue`.
- **Environments:** `local` → `staging` → `production`; CI (GitHub Actions): lint → test → build → deploy.
- **Backups:** Automated `pg_dump` daily snapshots + WAL archiving for Point-In-Time Recovery (PITR); restore drill before launch.

---

## 11. Scaling path (if traffic grows)

1. Add Redis cache + second API instance behind a load balancer.
2. Move worker to its own service (pg-boss or BullMQ).
3. Use PostgreSQL streaming replication with read replicas; add compound and partial indexes from `pg_stat_statements` slow-query log.
4. Optimize search using PostgreSQL `tsvector` + `pg_trgm` trigram indexes for sub-millisecond typo-tolerant full-text search.
5. Only then consider splitting AI into its own service.
