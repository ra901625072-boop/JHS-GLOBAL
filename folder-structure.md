# folder-structure.md — Recommended Folder Structure

**Approach:** one Git repo, two apps (`client` and `server`) — a simple **monorepo**. Easy to share with the client, deploy separately, and for an AI agent to navigate.

Rule of thumb: **organise by feature on the backend, by page + component on the frontend.**

---

## 1. Root

```
export-b2b/
├── client/                 # React app (buyer site + admin UI)
├── server/                 # Node.js + Express REST API
├── docs/                   # these .md files
│   ├── project.md
│   ├── folder-structure.md
│   ├── database-design.md
│   ├── system-design.md
│   └── agent.md
├── .gitignore
├── docker-compose.yml      # postgres + redis + server (local dev)
├── package.json            # root scripts: dev, lint, test
└── README.md
```

---

## 2. Backend — `server/`

```
server/
├── src/
│   ├── config/             # env loader, db connection, redis, cors, constants
│   │   ├── env.js
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── modules/            # ONE FOLDER PER FEATURE (core idea)
│   │   ├── category/
│   │   │   ├── category.model.js        # Sequelize model
│   │   │   ├── category.routes.js       # URL → controller
│   │   │   ├── category.controller.js   # req/res only
│   │   │   ├── category.service.js      # business logic, DB calls
│   │   │   └── category.validation.js   # Joi / Zod schemas
│   │   ├── product/
│   │   ├── inquiry/        # RFQ / quote requests
│   │   ├── sample/         # sample requests
│   │   ├── certificate/
│   │   ├── blog/
│   │   ├── testimonial/
│   │   ├── auth/           # admin login, JWT
│   │   ├── user/           # admin users
│   │   ├── upload/         # image / pdf upload
│   │   ├── newsletter/
│   │   └── ai/             # LLM features (see below)
│   │       ├── ai.routes.js
│   │       ├── ai.controller.js
│   │       ├── ai.service.js            # builds prompts, calls provider
│   │       ├── ai.provider.js           # thin wrapper: Claude/OpenAI
│   │       ├── prompts/                 # prompt templates as .txt / .js
│   │       │   ├── quoteAssistant.prompt.js
│   │       │   ├── inquirySummary.prompt.js
│   │       │   └── replyDraft.prompt.js
│   │       └── rag/                     # embeddings + retrieval
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── cache.middleware.js
│   │   ├── error.middleware.js
│   │   └── notFound.middleware.js
│   │
│   ├── services/           # shared services (not tied to one module)
│   │   ├── email.service.js
│   │   ├── storage.service.js    # Cloudinary / S3
│   │   ├── cache.service.js
│   │   └── queue.service.js
│   │
│   ├── utils/              # slugify, pagination, apiResponse, logger, asyncHandler
│   ├── jobs/               # background jobs (send email, AI summary, embeddings)
│   ├── seeds/              # seed categories, products, admin user
│   ├── app.js              # express app setup (middlewares + routes)
│   └── server.js           # starts server
│
├── tests/                  # unit + integration (Jest + Supertest)
├── .env.example
└── package.json
```

### Backend layer rules (very important)

```
routes  →  controller  →  service  →  model (DB)
```

- **routes**: only URL + middleware list.
- **controller**: reads request, calls service, sends response. No business logic.
- **service**: all logic + DB queries. Reusable and testable.
- **model**: Sequelize model + indexes + associations.
- **validation**: every input validated before controller runs.

---

## 3. Frontend — `client/`

```
client/
├── public/                 # favicon, robots.txt, sitemap.xml, og images
├── src/
│   ├── assets/             # fonts, logos, static images
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx      # all routes (lazy loaded)
│   │   └── providers.jsx   # QueryClient, Helmet, Quote basket context
│   │
│   ├── pages/              # one file per route
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Products/           # listing + filters
│   │   ├── Category/
│   │   ├── ProductDetail/
│   │   ├── Quality/
│   │   ├── ExportProcess/
│   │   ├── PrivateLabel/
│   │   ├── GlobalReach/
│   │   ├── Blog/ , BlogPost/
│   │   ├── Faq/
│   │   ├── Contact/            # includes RFQ form
│   │   └── NotFound/
│   │
│   ├── admin/              # separate area, protected routes
│   │   ├── pages/ (Dashboard, Products, Categories, Inquiries, Certificates, Blog, Settings)
│   │   └── components/
│   │
│   ├── components/
│   │   ├── layout/         # Header, Footer, MegaMenu, WhatsAppButton
│   │   ├── ui/             # Button, Input, Modal, Badge, Skeleton, Tabs
│   │   ├── product/        # ProductCard, SpecTable, ProductGallery
│   │   ├── rfq/            # QuoteForm, QuoteBasket, QuoteDrawer
│   │   ├── sections/       # Hero, CategoryGrid, CertStrip, ProcessTimeline, MapSection
│   │   └── ai/             # ChatWidget, SuggestedQuestions
│   │
│   ├── features/           # state + api per feature
│   │   ├── products/ (api.js, hooks.js)
│   │   ├── inquiry/
│   │   ├── quoteBasket/    # context / zustand store (persist in localStorage)
│   │   └── ai/
│   │
│   ├── services/
│   │   └── apiClient.js    # axios instance, interceptors, base URL
│   ├── hooks/              # useDebounce, useMediaQuery, useScrollReveal
│   ├── utils/              # formatters, constants, seo helpers
│   ├── styles/             # tailwind.css, tokens (colors, spacing, fonts)
│   ├── types/              # (optional) JSDoc / TS types
│   └── main.jsx
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### Frontend rules

- **Pages** compose sections; **components** are dumb and reusable.
- Server data via **TanStack Query** (cache, loading, errors). Local UI state via `useState` / small store.
- All API calls go through `services/apiClient.js` — never `fetch` directly in components.
- Lazy-load every page (`React.lazy`) and every image (`loading="lazy"`, WebP, width/height set).

---

## 4. Best way to develop in this structure (order of work)

| Phase | Backend | Frontend |
|---|---|---|
| **0. Setup** | Init repo, ESLint/Prettier, env files, PostgreSQL connection, error handler, logger | Vite + Tailwind, design tokens, layout (Header/Footer), router |
| **1. Catalogue core** | `category` + `product` modules, seeds, list/detail/search endpoints | Home, Products, Category, ProductDetail pages |
| **2. Conversion** | `inquiry` + `sample` modules, email service, rate limit, validation | Quote basket + RFQ form + success page |
| **3. Trust pages** | `certificate`, `testimonial` modules | Quality, About, Process, Global Reach, FAQ |
| **4. Admin** | `auth`, role guard, CRUD for all, upload | Admin login + CRUD screens, inquiry inbox |
| **5. Content** | `blog` module | Blog list/detail, SEO meta, sitemap |
| **6. AI** | `ai` module: summary, lead score, reply draft, RAG chat | Chat widget, admin "AI summary" panel |
| **7. Hardening** | Cache, Redis rate limits, tests, security review | Performance, a11y, SEO audit, analytics |
| **8. Launch** | Deploy API + PostgreSQL + backups + monitoring | Deploy frontend + domain + SSL + sitemap submit |

### Per-feature checklist (repeat for every module)

1. Write Sequelize **model** + associations + indexes.
2. Write **validation** schema.
3. Write **service** functions.
4. Write **controller** + **routes**; register in `app.js`.
5. Add **tests** (happy + error case).
6. Build the **frontend api + hook**, then the **page/component**.
7. Update `docs/` if schema or API changed.

---

## 5. Naming conventions

- Files: `kebab-case` for folders, `camelCase.js` for modules, `PascalCase.jsx` for React components.
- API paths: plural nouns, lowercase — `/api/v1/products`, `/api/v1/inquiries`.
- Env vars: `UPPER_SNAKE_CASE`, documented in `.env.example`.
- Git: `feature/<name>`, `fix/<name>`; commit style `feat:`, `fix:`, `docs:`.

---

## 6. Why this structure is best for this project

- **Feature modules** on the backend: adding "Sample request" or "Certificates" touches one folder only.
- **Separate `admin/`** on the frontend keeps buyer bundle small (admin code lazy-loaded).
- **`ai/` isolated**: provider can be swapped (Claude ↔ OpenAI) without touching other code; keys never reach the client.
- **`docs/` in repo**: client and agents always read the same source of truth.
