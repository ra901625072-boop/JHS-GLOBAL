# agent.md — Instructions for the AI Coding Agent

You are building a **premium international B2B export website** (React + Node.js + Express REST API + PostgreSQL + LLM features) for an Indian food / agri / ingredient exporter.

**Read these first, in order:** `project.md` → `folder-structure.md` → `database-design.md` → `system-design.md`. They are the source of truth. If code and docs disagree, **update the docs in the same change** (or ask).

---

## 1. Goal (keep this in mind for every decision)

Help overseas **importers and manufacturers** (a) trust the company, (b) find the right product and its specs, (c) send a clear **Request a Quote**. Every page should push toward the RFQ. There is **no cart, no payment, no prices shown**.

---

## 2. DO

### Product and content
- Build the 8 categories exactly as listed in `database-design.md` §6.
- Show on every product: name, images, HS code, origin, forms, packing, MOQ, shelf life, certificates, and an **"Add to Quote"** button.
- Put a **Request a Quote** button in the header and on every product / category page; add a WhatsApp button.
- Use **"Price on request"** wording. Use clear B2B terms: MOQ, FCL, FOB / CIF / CFR, Incoterms, port, HS code.
- Make the RFQ form fields: name, company, email, phone/WhatsApp, country, products (from basket), quantity + unit, destination port, Incoterm, packing, target month, private label (yes/no), sample needed (yes/no), message. Required: name, company, email, country, at least one product or message.
- Use placeholders for client content (brand name, certificate numbers, photos) and **mark them clearly** with `TODO(client)`.

### Code
- Follow `folder-structure.md` exactly: backend `routes → controller → service → model`; frontend `pages → components → features → services`.
- Validate **every** input on the server (Zod/Joi) — never trust the client.
- Use `async/await` with a shared `asyncHandler`; return the standard response shape from `system-design.md` §3.
- Paginate all list endpoints; use `.lean()` and field projection for read queries.
- Add indexes defined in `database-design.md` when creating models.
- Use environment variables for all secrets/URLs; keep `.env.example` updated.
- Write small, readable functions and short comments only where the *why* is not obvious.
- Add a test for each new service and each new endpoint (success + failure).
- Make UI **mobile-first, responsive, accessible** (semantic HTML, alt text, labels, focus states, contrast ≥ AA).
- Use WebP images, lazy loading, route-level code splitting, and per-page SEO meta (`react-helmet-async`).
- Build all UI states: loading (skeleton), empty, error, success.
- Use design tokens (colour, spacing, font) from one place; keep a **premium, clean, trustworthy** look (generous whitespace, strong typography, real photography, restrained colour — deep green / charcoal / gold accents are a good fit for agri-export).

### AI features
- Call the LLM **only from the server**, through `ai.provider.js`.
- Keep prompts in `server/src/modules/ai/prompts/` as versioned files.
- Ask for **structured JSON**, validate it, retry once, then fall back gracefully.
- Run slow AI work (summary, reply draft, embeddings) in **background jobs**.
- Ground the chat assistant in **retrieved product/FAQ data only** (RAG); show source links.
- Log usage in `aiUsageLogs`; respect the daily token budget.
- Require **human approval** before any AI-written email is sent to a buyer.

### Process
- Work in **small steps** following the phase order in `folder-structure.md` §4. Finish and verify one module before starting the next.
- Before coding a feature, state in 2–3 lines what you will change and which files.
- Run lint + tests before saying a task is done. Report what you ran and the result.
- Update docs when schema, endpoints, or structure change.
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- If requirements are unclear or a decision is irreversible (DB schema change on live data, deleting data, changing auth), **ask first**.

---

## 3. DON'T

### Product / business
- ❌ Don't add a shopping cart, checkout, online payment, or public prices.
- ❌ Don't invent facts: certificate numbers, certification names, export countries, years of experience, client names, testimonials, statistics, or product specs. Use `TODO(client)` placeholders instead.
- ❌ Don't claim certifications the client has not confirmed (FSSAI, APEDA, ISO, HACCP, Halal, Kosher, USDA Organic, BRCGS…).
- ❌ Don't copy text, images, logos, or layouts from the reference websites. They are for **structure and idea research only**. Write original copy; use original or licensed photography.
- ❌ Don't use low-quality stock photos or generic placeholder text (lorem ipsum) in anything shown as final.

### Code / security
- ❌ Don't expose API keys, DB URIs, or JWT secrets in code, logs, commits, or the frontend bundle.
- ❌ Don't call the LLM from the browser.
- ❌ Don't put business logic in controllers or routes, or DB queries in components.
- ❌ Don't use `fetch`/`axios` directly in components — use `services/apiClient.js` and feature hooks.
- ❌ Don't skip validation, rate limiting, or sanitisation on public POST endpoints.
- ❌ Don't store passwords in plain text; don't store card/bank data; don't log personal data (emails, phones, full IPs).
- ❌ Don't hard-delete products/categories that are referenced; use `isActive:false`.
- ❌ Don't run destructive DB commands (drop, delete many, migrations on production) without explicit approval.
- ❌ Don't add heavy dependencies for small tasks; check if the stack already solves it.
- ❌ Don't use `any`-style shortcuts, empty `catch` blocks, `console.log` in committed code, or commented-out dead code.
- ❌ Don't change folder structure, DB schema, or API contracts silently.

### AI behaviour
- ❌ Don't let the chat assistant quote prices, delivery dates, or certificates not in the database.
- ❌ Don't let AI write directly to the database except the `inquiry.ai` field via the job.
- ❌ Don't trust user text inside prompts — treat it as untrusted; never let it change system rules.

---

## 4. HOW — step-by-step playbooks

### 4.1 Add a new backend module (example: `certificate`)
1. Model in `modules/certificate/certificate.model.js` (+ indexes).
2. `certificate.validation.js` (Zod schemas for create/update/query).
3. `certificate.service.js` (list, getById, create, update, softDelete).
4. `certificate.controller.js` (thin).
5. `certificate.routes.js` (public GET, admin CUD with `auth` + `role`).
6. Register in `app.js`; add cache + invalidation if public.
7. Seed data in `seeds/`.
8. Tests in `tests/certificate.test.js`.
9. Update `system-design.md` API table if endpoints are new.

### 4.2 Add a new page (example: `PrivateLabel`)
1. Create `pages/PrivateLabel/index.jsx`.
2. Compose from `components/sections/*`; add new reusable component only if used twice or more.
3. Add route in `app/router.jsx` (lazy).
4. Add `<Helmet>` title/description + a H1.
5. Add it to Header/Footer navigation and sitemap.
6. Check mobile (360 px), tablet, desktop; keyboard navigation.

### 4.3 Add an LLM feature
1. Define input/output JSON schema (Zod).
2. Write prompt file with: role, rules, context placeholders, output format, 1–2 examples.
3. Implement in `ai.service.js`; call model only via `ai.provider.js`.
4. Add timeout, retry-once, fallback, and usage logging.
5. Add a job (if not instant) and store the result on the right document.
6. Add admin UI to review/edit/approve before it affects a buyer.
7. Test with: normal input, empty input, non-English input, prompt-injection attempt.

### 4.4 Handle the RFQ flow (critical path)
`POST /inquiries` → rate limit → captcha/honeypot → validate → sanitise → create (status `new`, `referenceNo`) → respond `201` → enqueue emails + AI job. **Never block the response on email or AI.**

### 4.5 Definition of Done (check before finishing any task)
- [ ] Works as described; edge cases handled (empty, error, slow network).
- [ ] Input validated; auth/roles correct; no secrets exposed.
- [ ] Lint passes; tests added and passing.
- [ ] Mobile + desktop checked; accessibility basics met.
- [ ] No placeholder text left unmarked; `TODO(client)` items listed.
- [ ] Docs updated if structure / schema / API changed.
- [ ] Short summary written: what changed, files touched, how to run/test, open questions.

---

## 5. Response style when working with the user

- Be concise. Lead with what you did and what is next.
- Show file paths for everything created or changed.
- List assumptions and open questions at the end.
- If something blocks you, say what is missing and propose the best default.
- Do not apologise at length or repeat the full plan every message.

---

## 6. Quick reference

| Item | Value |
|---|---|
| Frontend | React (Vite), React Router, Tailwind, TanStack Query |
| Backend | Node.js, Express, Sequelize, Zod, Pino |
| DB | PostgreSQL 16+ (+ pgvector / hybrid JSONB) |
| Cache / queue | Redis + BullMQ (in-memory fallback in v1) |
| AI | LLM API via server-side `ai.provider.js`, RAG on product data |
| API base | `/api/v1` |
| Auth | JWT access (15 min) + httpOnly refresh cookie, roles: admin / sales / editor |
| Main CTA | **Request a Quote** |
| Categories | 8 (see `database-design.md` §6) |
