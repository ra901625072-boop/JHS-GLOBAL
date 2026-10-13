# mobile-ui.md — Complete Mobile UI/UX & Motion Engineering Specification

> **Project:** JHS Global — International B2B Specialty Chemicals, Botanical Extracts, Nutraceuticals & Animal Feed Exim Platform  
> **Status:** Architecture & Engineering Guide (Phase 1)  
> **Core Rule:** Desktop UI (≥1024px) is approved and frozen. Zero regressions allowed.

---

## Executive Summary & Hard Desktop Boundary Contract

This document provides the exhaustive, production-grade design and engineering specification for bringing the desktop B2B export experience of **JHS Global** to mobile devices (<1024px).

### The Hard Desktop Boundary Contract
1. **Desktop Invariance (≥1024px):** Not one layout position, pixel margin, typography token, color value, animation duration, or interactive behavior may change on viewports 1024px wide and above.
2. **Strict Scoping Mechanisms:**
   - All mobile adjustments must utilize Tailwind responsive prefixes (`max-lg:`, `block lg:hidden`, `hidden lg:flex`) or custom CSS scoped under media queries `@media (max-width: 1023px)`.
   - Any new mobile-exclusive patterns (such as Bottom Sheets, Sticky Quote Bar, Swipe Carousels) are rendered conditionally or styled strictly below 1024px (`lg:hidden`).
   - Shared utility classes and tokens in `tokens.js` and `motion.js` must remain backward-compatible; mobile-specific constants are appended with clear scoping identifiers.
3. **Mandatory Desktop Regression Verification:**
   - Every file modification must be verified at **1440px** (MacBook/iMac) and **1024px** (iPad Pro / Small Laptop) against the baseline before concluding the implementation step.

---

## 1. Audit of the Current Mobile State

A rigorous audit of the existing client application revealed significant usability bottlenecks on touchscreens and narrow viewports (360px–430px).

### 1.1 Page-by-Page Audit

| Page Route | Current Mobile Behavior & Breakage | UX & Technical Impact |
|---|---|---|
| **`/` (Home)** | • Hero headline wraps unevenly on 360px.<br>• `WorldTradeMap` renders an intricate SVG (viewBox `0 0 1010 666`) below the hero text; destination ports become 3–5px untappable dots, tooltips fail on touch, and coordinates clip.<br>• `AntigravityWaveTrack` runs an active 60fps rAF loop across 24 DOM nodes, creating battery drain and horizontal layout overflow on narrow screens.<br>• Certification marquee hover-pause is non-functional on touchscreens. | High battery/GPU drain; critical unresponsiveness on trade map; cluttered hero above-the-fold. |
| **`/products` (Catalogue)** | • Filter sidebar (`ProductFilters`) sits directly stacked above the 3-column product grid.<br>• Mobile users must scroll past ~700px of AI search forms, categories, and sort dropdowns before encountering their first product card.<br>• Pagination controls lack thumb-friendly touch padding. | Severe conversion drop; high bounce rate before reaching commodity cards. |
| **`/categories/:slug` (Category)** | • Sub-division pill tabs use raw `overflow-x-auto` with no fade indicators or scroll snapping.<br>• Header actions render two stacked desktop buttons pushing product cards off-screen.<br>• "Download PDF" button triggers a native browser `alert()`. | Poor discovery of sub-categories; unprofessional alert modal on mobile. |
| **`/products/:slug` (Product Detail)** | • `ProductGallery` requires tapping tiny 80px thumbnail boxes; no horizontal swipe gesture or momentum exists.<br>• `SpecTable` uses raw `overflow-x-auto`; tables require awkward horizontal pinching/scrolling.<br>• Form inputs in commercial box use 14px (`text-sm`), triggering iOS Safari auto-zoom.<br>• Crucial "Add to Quote" CTA scrolls out of view with no sticky bottom anchor. | Frustrating iOS zoom bug; loss of conversion intent during spec reading. |
| **`/quality` (Quality & Certs)** | • NABL analytical testing parameters table is forced into horizontal scroll.<br>• Certificate PDF preview modal is centered and rigid rather than mobile-optimized.<br>• Secondary button triggers `alert()`. | Hard to inspect purity limits on phone; modal buttons clip on short screens. |
| **`/export-process` (Process)** | • 5-step workflow displays 3-column grid cards stacked vertically with no continuous visual spine or timeline connection.<br>• Document checklists add high vertical scroll bulk without progressive disclosure. | Disconnected narrative; excessive vertical scroll fatigue. |
| **`/private-label` (OEM)** | • 4 packaging cards stack into a heavy list with static heights.<br>• Step workflow lacks touch horizontal paging. | High cognitive load for retail brand managers browsing on mobile. |
| **`/global-reach` (Global Reach)** | • Importer testimonials stack into 3 tall static cards.<br>• Region selector tabs lack swipeable container. | Wasted vertical real estate; lack of engaging swipe interaction. |
| **`/blog` & `/blog/:slug`** | • Long table blocks inside Markdown render with small font or clipped borders.<br>• Code/table snippets lack horizontal drag affordance indicators. | Reduced readability for technical harvest and MRL reports. |
| **`/faq` (FAQ)** | • Search bar and 5 topic tabs take up ~300px above accordion list.<br>• Accordion headers have small tap targets on close arrows. | Hard to scan quickly while holding phone one-handed. |
| **`/contact` (RFQ Page)** | • Left column (Corporate Office card + Due Diligence checklist) stacks *before* the RFQ form, forcing ~450px of reading before reaching the form.<br>• RFQ form inputs lack `inputMode` and `autoComplete` attributes, slowing down mobile keyboard data entry.<br>• Submit button is buried at the bottom of 800 lines of form controls. | High mobile drop-off rate on primary B2B lead generation channel. |
| **`/sample-request`** | • Same form stacking and keyboard issues as RFQ form.<br>• Address fields lack postal autofill optimization. | Friction for international quality directors ordering courier samples. |
| **`/about` (About)** | • 4 operational pillars stack in large cards with small indicator numbers. | Long, static read with no interactive mobile rhythm. |
| **`/admin/*` (Trade Desk)** | • High-density data tables in `AdminTableShell` cause horizontal overflow.<br>• Top navigation timezones clip on mobile screens. | Sales officers on phones struggle to review RFQs while traveling. |

---

### 1.2 Component-by-Component Audit

| Component | Current Implementation | Failure Mode on Mobile (<1024px) |
|---|---|---|
| **`Header`** | `h-20`, top trust bar `hidden sm:block`, buttons `min-h-[40px]`. | Takes up 80px vertical space; hamburger and basket buttons fail 44px tap target; top trust strip missing on phones; no visible RFQ CTA in header. |
| **`MegaMenu` / Mobile Menu** | Simple collapsible dropdown with `max-h-[500px]`, links only. | No category hierarchy or accordion tree; lacks full-screen backdrop; body scrolls underneath menu. |
| **`ProductCard`** | Vertical card with `grid grid-cols-2 gap-2` action buttons. | Dual buttons at bottom are cramped on 360px widths; origin and MOQ text truncated to 170px max-width. |
| **`ProductGallery`** | Single image display + flex row of thumbnail buttons. | No touch swipe gestures; clicking thumbnails is inaccurate on small touchscreens; no touch-drag momentum. |
| **`SpecTable`** | HTML table in `<div className="overflow-x-auto">`. | Users must scroll horizontally; columns are clipped; difficult to align parameter with value while scrolling. |
| **`ProductFilters`** | Inline card with AI search, text input, category list, sort select. | Sits above product list on mobile, forcing massive vertical scroll before products appear. |
| **`QuoteDrawer`** | Slide-in drawer with `pl-10` and `w-screen max-w-md`. | `pl-10` forces a 40px gap showing page background; quantity input is tiny with no step buttons; no bottom safe-area inset. |
| **`QuoteForm`** | Multi-section form with `text-xs sm:text-sm` inputs. | Triggers iOS Safari zoom (<16px); missing `inputMode` and `autoComplete`; no sticky submit button. |
| **`WhatsAppButton` & `ChatWidget`** | Both positioned fixed at bottom-right (`bottom-6` and `bottom-20`). | Collide with each other and with mobile navigation bars; chat popover overflows screen on phone keyboard focus. |
| **`useSmoothScroll` (Lenis)** | Lenis initialized globally with `touchMultiplier: 1.5`. | Fights native iOS/Android momentum touch scrolling; causes stutter and gesture conflicts with bottom sheets. |

---

### 1.3 Prioritized Issue Matrix

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            PRIORITY RANKING                                  │
├───────────────────┬───────────────────────────────┬──────────────────────────┤
│ CRITICAL (P0)     │ IMPORTANT (P1)                │ POLISH (P2)              │
│ Must fix for basic│ Needed for commercial B2B     │ Delights and refines     │
│ mobile usability  │ conversion flow               │ tactile feel             │
├───────────────────┼───────────────────────────────┼──────────────────────────┤
│ • iOS input zoom  │ • Filters into Bottom Sheet   │ • Testimonial swipe      │
│   (font-size 16px)│ • Sticky Quote Bar + Coord.   │ • Haptic / press feedback│
│ • Disable Lenis on│   WhatsApp / AI FAB           │ • Safe-area bottom padding│
│   touch devices   │ • Product gallery swipe       │ • Wave track simplified  │
│ • Tap targets ≥44px│ • Spec table stacked cards    │   CSS carousel           │
│ • Full-screen /   │ • RFQ Form single column +    │ • Process timeline line  │
│   drawer menu with│   inputMode & autocomplete    │ • Admin mobile card view │
│   category tree   │ • Quote basket Bottom Sheet   │ • Certification marquee  │
│ • Zero horizontal │ • Contact page form moved     │   touch pause            │
│   body scroll     │   above static office text    │                          │
└───────────────────┴───────────────────────────────┴──────────────────────────┘
```

---

## 2. Design Principles

### 2.1 Same Brand Feel: Identity and Visual DNA

The mobile experience must feel unmistakably high-end, institutional, and authoritative. It is not an e-commerce retail app; it is an international commodity trading platform.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BRAND TOKEN CONTINUITY                            │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ IDENTICAL (No Change) │ • Primary Forest Green: #0D2818 (core) / #05140B    │
│                       │ • Accent Champagne Gold: #C5A059 (highlights)       │
│                       │ • Action Amber Gold: #D97706 (RFQ conversion)       │
│                       │ • Surface Canvas: #FBFBF9 | Surface Card: #FFFFFF   │
│                       │ • Font Families: Playfair Display + Plus Jakarta    │
│                       │ • Tone of Voice: Formal B2B, Incoterms, HS Codes    │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ ADAPTIVE FOR MOBILE   │ • Form Input Font: 16px on mobile (prevents iOS zoom)│
│                       │ • H1 Display: 32px–38px (down from 52px)            │
│                       │ • Container Gutters: 16px (down from 32px)          │
│                       │ • Card Padding: 16px (down from 24px–32px)          │
│                       │ • Touch Targets: Strict min 44px × 44px             │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

#### Typography Scale Adaptation
- **Desktop H1:** `text-5xl` (48px) / `text-6xl` (60px)  
  ➔ **Mobile H1:** `text-3xl` (30px) at 360px–390px, `text-4xl` (36px) at 430px+, tracking-tight, line-height 1.15.
- **Desktop H2:** `text-3xl` (30px) / `text-4xl` (36px)  
  ➔ **Mobile H2:** `text-2xl` (24px) / `text-[1.625rem]` (26px), font-serif font-bold.
- **Desktop Body:** `text-sm` (14px) / `text-base` (16px)  
  ➔ **Mobile Body:** `text-sm` (14px) with generous line-height (`leading-relaxed`, 1.6) for descriptions; form field inputs strictly `text-base` (16px).
- **Metadata & Tags:** `text-xs` (12px) and `text-[11px]`, font-mono for HS codes and batch figures.

---

### 2.2 Mobile-First Usability & Ergonomics

```
      TOP ZONE (Hard to Reach)
┌───────────────────────────────────┐
│ [Logo]             [Basket] [Menu]│ ➔ Global Nav & Identity
├───────────────────────────────────┤
│                                   │
│          READING ZONE             │ ➔ Page Content & Specs
│                                   │
│                                   │
├───────────────────────────────────┤
│ [Filter & Sort]  [Search Input]   │ ➔ Secondary Controls
├───────────────────────────────────┤
│ (WhatsApp)               (AI Bot) │ ➔ Floating Touch Anchors
│ [   REQUEST A QUOTE (48h)       ] │ ➔ Primary Action (Thumb Anchor)
└───────────────────────────────────┘
     THUMB ZONE (Natural Reach)
```

1. **Strict 44px Minimum Tap Targets:** Every interactive element (buttons, hamburger, select toggles, quantity steppers, checkbox hits) has a hit bounding box of at least 44px × 44px (`min-h-[44px] min-w-[44px]`).
2. **Readable Form Inputs Without iOS Zoom:** All `<input>`, `<select>`, and `<textarea>` elements are rendered with `font-size: 16px` on viewports `<1024px`. This prevents iOS Safari from automatically zooming the page and throwing the viewport off-center.
3. **Safe-Area Inset Handling:** Fixed bars and drawers use `env(safe-area-inset-bottom)` and `env(safe-area-inset-top)` to clear the iPhone home indicator pill and Android system gesture bars:
   ```css
   padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
   ```
4. **Zero Horizontal Viewport Overflow:** Body has `overflow-x: hidden; width: 100%;`. No element may cause horizontal scroll unless explicitly enclosed inside a dedicated touch-swipe track with momentum scroll.

---

### 2.3 Minimal but Complete B2B Information Architecture

In B2B trade, overseas buyers require precise technical parameters before requesting samples or container allocations. **Information must never be cut to save space.**

- **HS Code Chapter & Digits:** Always displayed as a high-contrast mono badge (`HS 0910.30`).
- **MOQ Thresholds:** Retained prominently (`MOQ: 1x 20ft FCL / 18 MT`).
- **Packing Standards:** Available as clear chips or a stacked breakdown rather than hidden.
- **Incoterms & Ports:** Displayed under stacked disclosure blocks.
- **Progressive Disclosure:** Information is arranged into structured accordions, horizontal pill chips, or swipe cards rather than removed.

---

### 2.4 Sticky CTA Architecture: Bottom Bar & Floating Elements

To guarantee that "Request a Quote" is always exactly one tap away while preventing floating buttons from colliding with each other or content:

```
┌─────────────────────────────────────────────────────────────┐
│                     BOTTOM ANCHOR STACK                     │
├─────────────────────────────────────────────────────────────┤
│ Floating Actions (right-aligned, stacked vertically):       │
│   • Bottom: calc(4.75rem + env(safe-area-inset-bottom))     │
│   • [WhatsApp Button] (48px circle, green, icon)            │
│   • [Trade Assistant AI] (48px circle, deep green, sparkles)│
├─────────────────────────────────────────────────────────────┤
│ Sticky Bottom Quote Bar (full width, fixed to screen):      │
│   • Background: white/95 with backdrop blur                 │
│   • Border top: hairline border-neutral-200                 │
│   • Left: Live Quote Basket Pill with count                 │
│   • Right: High-Contrast "Request a Quote" CTA Button       │
│   • Height: 64px + safe-area-inset-bottom                   │
└─────────────────────────────────────────────────────────────┘
```

- When the user is on the RFQ form itself (`/contact`), the Sticky Bottom Quote Bar dynamically transforms into a **"Submit RFQ (48h Binding Quote)"** sticky submit button.
- Floating buttons automatically stay pinned above the sticky bar without overlapping content.

---

## 3. Breakpoints and Layout System

### 3.1 Breakpoint System & Grid Metrics

```
┌───────────┬──────────────┬──────────────┬─────────────┬───────────────────────────┐
│ Breakpoint│ Target Width │ Margins (px) │ Gutter (px) │ Typical Reference Devices │
├───────────┼──────────────┼──────────────┼─────────────┼───────────────────────────┤
│ `xs`      │ 360px–389px  │ 16px         │ 12px        │ Galaxy S8/S9, Xperia      │
│ `sm`      │ 390px–429px  │ 16px         │ 16px        │ iPhone 12/13/14/15 Pro    │
│ `md`      │ 430px–767px  │ 20px         │ 16px        │ iPhone Pro Max, Plus      │
│ `tablet`  │ 768px–1023px │ 24px–32px    │ 20px–24px   │ iPad Mini, iPad 10", Air  │
│ `desktop` │ 1024px+      │ 32px–48px    │ 24px–32px   │ Laptops, Desktops (FROZEN)│
└───────────┴──────────────┴──────────────┴─────────────┴───────────────────────────┘
```

- **Container Max-Widths:**
  - Phone: `w-full px-4` (16px padding on each side).
  - Tablet: `w-full px-6 sm:px-8` (24px–32px padding).
  - Desktop: `max-w-7xl mx-auto px-8` (unchanged).

---

### 3.2 Responsive Rules for Every Page

#### 1. Home Page (`/`)
- **Hero:** Single-column layout. Masked title scale adjusted to `text-3xl sm:text-4xl`.
- **World Trade Section:** Replaces heavy interactive SVG with a high-contrast **Interactive Destination Ports Carousel** (swipeable cards displaying Port, Country, Flag, Ocean Transit Days, and Primary Cargo) with the vector world map softly visible in the background.
- **Accreditation Marquee:** Remains continuous ticker with touch-pause on touchstart/touchend.
- **Categories Wave:** Renders a horizontal touch-swipe track with snap points (`snap-x mandatory`).
- **Metrics Strip:** 2×2 grid of roll-up counters.
- **Featured Products:** 1 column at <640px, 2 columns at 640px–1023px.
- **Workflow & QA Steps:** Stacked vertical cards with numbered badge markers.

#### 2. Products Listing (`/products`)
- **Filter Bar:** Extracted into a sticky floating bar below header with **"Filter & Sort (N active)"** button that triggers a **Bottom Sheet Drawer**.
- **Search Input:** Full width at top of page with clear button.
- **Product Grid:** 1 column on phones (<640px), 2 columns on tablet (640px–1023px).
- **Pagination:** Large touch targets (`min-h-[44px]`).

#### 3. Category Page (`/categories/:slug`)
- **Category Header:** Replaces desktop multi-button cluster with compact title and single quote CTA.
- **Sub-Division Filter:** Horizontal swipe chip bar with edge fade indicators.
- **Brochure Download:** Opens a native mobile share/save sheet rather than triggering an alert.

#### 4. Product Detail (`/products/:slug`)
- **Gallery:** 1:1 or 4:3 swipeable carousel with touch drag, momentum, and dot pagination.
- **Quick Specs Grid:** 2 columns of high-contrast cards.
- **Commercial Box:** Single-column inputs, quantity stepper with large `+` and `-` touch buttons.
- **Technical Specs Table:** Transforms into stacked key-value cards or collapsible parameter accordion.
- **Sticky Footer Bar:** Shows commodity name, quantity summary, and "Add to Quote" button.

#### 5. Quality & Certifications (`/quality`)
- **Certificates Grid:** 1 column of detailed accreditation cards with PDF view button.
- **PDF Viewer Modal:** Becomes a full-height mobile bottom sheet with clear close button.
- **Lab Testing Matrix:** Stacked parameter cards displaying biomarker, testing method (HPLC/GC-MS), and standard limit.

#### 6. Export Process (`/export-process`)
- **5-Step Workflow:** Clean connected vertical timeline with a continuous green/gold left line, circular numbered beacons (01–05), and collapsible "Required Documentation" drawers.
- **Incoterms Guide:** 1 column stacked cards with bold Incoterm badges (CIF, FOB, CFR, EXW).

#### 7. Private Label (`/private-label`)
- **Packaging Solutions:** Horizontal swipe card gallery showing pouch, jar, bag formats and MOQ parameters.
- **Launch Workflow:** 4-step vertical timeline.

#### 8. Global Reach (`/global-reach`)
- **Corridor Hubs:** Horizontal swipeable tab bar for continents/regions with instant panel change.
- **Buyer Testimonials:** 1-card visible touch swipe carousel with swipe momentum and dot pagination.

#### 9. Blog Listing & Article (`/blog`, `/blog/:slug`)
- **Listing:** 1-column article cards with tag pills and read time.
- **Article Header:** Centered title, author pill, sticky floating share button.
- **Tables in Article Content:** Horizontal swipe container with a visible "← Scroll Table →" prompt.

#### 10. FAQ (`/faq`)
- **Search:** Top sticky search input.
- **Topic Filter:** Horizontal scrollable chip bar.
- **Accordion:** 48px hit areas with animated chevron indicator.

#### 11. Contact & RFQ Form (`/contact`)
- **Layout Order Reversal:** RFQ Form is placed **FIRST** on mobile. The corporate office and due diligence cards are positioned below or accessible via a secondary toggle.
- **AI Quick-Fill:** Compact expandable card.
- **Single-Column Grid:** All two-column inputs become clean 1-column stacks.
- **Inputs:** `inputMode="email"`, `inputMode="tel"`, `autoComplete` attributes.
- **Sticky Submit Bar:** When scrolling the form, a bottom bar displays "Submit RFQ • 48h Turnaround".

#### 12. Sample Request (`/sample-request`)
- Same ergonomic improvements: 1-column layout, touch stepper for samples, address autofill tags.

#### 13. Admin Trade Desk (`/admin/*`)
- **Sidebar:** Left slide-in drawer with backdrop blur.
- **Data Tables:** Transforms into responsive stacked record cards on viewports <768px, displaying reference number, buyer country flag, tonnage, status badge, and action button.

---

## 4. Component-by-Component Mobile Specs

### 4.1 Header & Mobile Menu (Drawer with Category Tree Accordion)

#### Layout & Dimensions
- Header height on mobile: `h-16` (64px, down from 80px on desktop).
- Left: JHS Wordmark + Logo badge (36px × 36px).
- Right: Basket Trigger (with count badge) + Hamburger Button (44px × 44px tap target).
- Mobile Drawer: Opens from left or full-screen from top, animated with `--ease-standard`.
- Category Tree: Renders an accordion displaying all 8 categories with their HS chapter badge and expandable sub-categories.

#### ASCII Wireframe: Mobile Header & Open Drawer
```
┌──────────────────────────────────────────────┐
│ [JHS] JHS Global            [Basket 2] [Menu]│ ➔ 64px Mobile Bar
└──────────────────────────────────────────────┘

DRAWER OPEN STATE (Full-screen overlay):
┌──────────────────────────────────────────────┐
│ [JHS] Commercial Export Desk             [X] │
├──────────────────────────────────────────────┤
│ ▾ PRODUCT CATEGORIES (8 Divisions)           │
│   ▸ Ch. 09  Spices & Culinary Herbs       [+]│
│     • Salem Turmeric Finger (Curcumin 3–5%)  │
│     • Malabar Black Pepper 550GL             │
│   ▸ Ch. 10  Pulses & Basmati Rice         [+]│
│   ▸ Ch. 07  Dehydrated Fruits & Veg       [+]│
│   ▸ Ch. 12  Superfoods & Botanicals       [+]│
│   ▸ Ch. 33  Essential Oils & Extracts     [+]│
│   ▸ Ch. 13  Nutraceutical Raw Materials   [+]│
│   ▸ Ch. 19  FMCG Ethnic Foods             [+]│
│   ▸ Ch. 23  Animal Feed & Meals           [+]│
├──────────────────────────────────────────────┤
│ • Quality & International Certifications     │
│ • 5-Step Export Workflow & Incoterms         │
│ • Private Label OEM Packaging                │
│ • Global Reach & Discharge Ports             │
│ • Exim FAQ & Laboratory Sampling             │
│ • Harvest Reports & Market Insights          │
├──────────────────────────────────────────────┤
│ [   REQUEST COMMERCIAL QUOTE (RFQ)    ]      │
│ [   WHATSAPP EXPORT DESK             ]      │
└──────────────────────────────────────────────┘
```

---

### 4.2 Home Hero & Interactive World Trade Section

#### Layout & Dimensions
- Text: Single column, `pt-8 pb-6 px-4`.
- Headline: 32px font, bold serif, tracking-tight.
- Eyebrow: APEDA & FSSAI certified badge.
- Interactive Trade Corridors: Swipeable card carousel directly under hero text.

#### ASCII Wireframe: Mobile Hero & Trade Corridor Card
```
┌──────────────────────────────────────────────┐
│ [SHIELD] APEDA & FSSAI CERTIFIED EXPORTER    │
│                                              │
│ Premium Indian agricultural                  │
│ products, exported worldwide.                │
│                                              │
│ Direct origin procurement. Guaranteed lab    │
│ COA. Ocean freight to 30+ countries.         │
│                                              │
│ [ REQUEST A QUOTE (RFQ) ]  [ EXPLORE ]       │
├──────────────────────────────────────────────┤
│ MARITIME SHIPPING CORRIDORS (Mundra / JNPT)  │
│ ┌──────────────────────────────────────────┐ │
│ │ 🇦🇪 Port of Jebel Ali / Dubai     [4–7d] │ │
│ │ AEJEA • Direct Weekly Container Service  │ │
│ │ Cargo: Spices, Basmati Rice, Oilseeds    │ │
│ └──────────────────────────────────────────┘ │
│     ●  ○  ○  ○  ○  (Swipe for Rotterdam, NY) │
└──────────────────────────────────────────────┘
```

---

### 4.3 Category Navigation (Touch-Friendly Wave / Swipe Cards)

#### Behavior
- Desktop `AntigravityWaveTrack` (running 60fps rAF across 24 items) is paused on mobile (<1024px).
- Replaced by a native touch-swipe horizontal track (`snap-x snap-mandatory flex gap-3 overflow-x-auto pb-4 no-scrollbar`).
- Discs are 56px × 56px with clear icons, title, and HS Chapter pill.

#### ASCII Wireframe: Category Swipe Track
```
┌──────────────────────────────────────────────┐
│ EXIM PRODUCT DIVISIONS (Swipe to browse)     │
│                                              │
│ ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐   │
│ │ ( ✨ )│  │ ( 🌾 )│  │ ( ☀️ )│  │ ( 🍃 )│   │
│ │Ch. 09 │  │Ch. 10 │  │Ch. 07 │  │Ch. 12 │   │
│ │Spices │  │ Rice  │  │Dehyd. │  │Superf.│   │
│ └───────┘  └───────┘  └───────┘  └───────┘   │
└──────────────────────────────────────────────┘
```

---

### 4.4 Product Card

#### Layout & Dimensions
- Card padding: 14px.
- Media aspect ratio: 4:3 with lazy loading.
- HS code badge: top-left mono pill.
- Title: 16px font-serif, line-clamp-2.
- Action row: Stacked or asymmetrical 2-button layout:
  - "View Specs" button: secondary outline (44px height).
  - "Add to Quote" button: primary amber gold with `+` icon (44px height).

#### ASCII Wireframe: Mobile Product Card
```
┌──────────────────────────────────────────────┐
│ [HS 0910.30]                  [Export Grade] │
│                                              │
│            [ 4:3 Product Image ]             │
│                                              │
├──────────────────────────────────────────────┤
│ SPICES & BOTANICALS                          │
│ Salem Turmeric Finger (Curcumin 3.5%)        │
│                                              │
│ Origin: Salem, Tamil Nadu, India             │
│ MOQ: 1x 20ft FCL (18 MT)                     │
│ Packing: 25kg PP Bags / Vacuum Foil          │
├──────────────────────────────────────────────┤
│ [  VIEW SPECS  ]  [ + ADD TO QUOTE BASKET  ] │ ➔ 44px tap
└──────────────────────────────────────────────┘
```

---

### 4.5 Product Gallery (Swipe Carousel)

#### Layout & Dimensions
- Main Viewport: 1:1 or 4:3 aspect ratio with touch swipe listeners (`onTouchStart`, `onTouchMove`, `onTouchEnd`).
- Swipe gesture: Tracks horizontal touch delta with momentum threshold (50px) to slide to next/previous image.
- Indicators: Centered pagination dots (8px circle, active dot is elongated gold pill 20px wide).
- Thumbnail Bar: Horizontal scroll row below main view with active border highlight.

#### ASCII Wireframe: Mobile Swipe Gallery
```
┌──────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────┐ │
│ │                                          │ │
│ │                                          │ │
│ │          [ Product Photograph ]          │ │
│ │              (Swipe ← →)                 │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                 ●  ○  ○  ○                   │ ➔ Pagination dots
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                  │
│ │[1] │ │[2] │ │[3] │ │[4] │                  │ ➔ Thumbnails (56px)
│ └────┘ └────┘ └────┘ └────┘                  │
└──────────────────────────────────────────────┘
```

---

### 4.6 Technical Spec Tables (Stacked Key-Value Cards)

#### Behavior
- Traditional tables with horizontal scroll are replaced on mobile by stacked key-value cards or collapsible parameter accordions.
- Each parameter displays the test name, value in bold monospace, and standard method (e.g. HPLC / NABL).

#### ASCII Wireframe: Stacked Spec Cards
```
┌──────────────────────────────────────────────┐
│ TECHNICAL QUALITY SPECIFICATIONS             │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ Parameter: Curcumin Content (HPLC)       │ │
│ │ Specification: Min. 3.5% – 5.0%          │ │
│ │ Method: ASTA Method 18.0 / Lab COA       │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Parameter: Moisture Content              │ │
│ │ Specification: Max. 10.0%                │ │
│ │ Method: ISO 939 / Vacuum Oven            │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ Parameter: Extraneous Matter             │ │
│ │ Specification: Max. 0.5% (Sortex)        │ │
│ │ Method: Visual Inspection / Sieving      │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

### 4.7 Filters & Sort (Bottom Sheet Pattern)

#### Behavior
- On mobile catalogue (`/products`), clicking "Filter & Sort (N active)" opens a native-feeling Bottom Sheet from the bottom.
- Includes backdrop blur, a draggable pull bar, category selection, AI smart search prompt, sort options, and sticky bottom buttons ("Reset" and "Apply Filters (N Products)").

#### ASCII Wireframe: Filter Bottom Sheet
```
┌──────────────────────────────────────────────┐
│                  [ === ]  (Drag Bar)         │
│ FILTER & SORT CATALOGUE                  [X] │
├──────────────────────────────────────────────┤
│ ▾ SORT COMMODITIES                           │
│   (●) Newest Listed   (○) Name (A–Z)         │
│                                              │
│ ▾ EXPORT DIVISION                            │
│   [ All Categories ]  [ Spices & Herbs ]     │
│   [ Basmati Rice ]    [ Dehydrated Veg ]     │
│                                              │
│ ▾ AI SMART SEARCH                            │
│   [ 20 MT Salem turmeric high curcumin     ] │
│   [ Apply AI Specs ]                         │
├──────────────────────────────────────────────┤
│ [ RESET ALL ]     [ APPLY FILTERS (13 ITEMS) ]│ ➔ Sticky submit
└──────────────────────────────────────────────┘
```

---

### 4.8 Quote Basket (Bottom Sheet Drawer with Steppers)

#### Behavior
- When clicking the header basket button or sticky quote bar, the basket slides up as a Bottom Sheet with `max-h-[85vh]`.
- Each commodity item features a thumbnail, name, HS code, a touch stepper (`-` [Qty] `+`), and a delete icon with 44px tap area.
- Sticky drawer bottom displays indicative commercial terms (FOB/CIF) and high-contrast "Proceed to RFQ Form" button.

#### ASCII Wireframe: Quote Basket Bottom Sheet
```
┌──────────────────────────────────────────────┐
│                  [ === ]                     │
│ YOUR QUOTE BASKET (2 Commodities)        [X] │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ [Photo] Salem Turmeric Finger            │ │
│ │         HS: 0910.30 • Packing: 25kg PP   │ │
│ │         [-]  [ 18 ]  [+]   [ MT ▾ ]  [🗑]│ │ ➔ Stepper controls
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ [Photo] 1121 Steam Basmati Rice          │ │
│ │         HS: 1006.30 • Packing: 50kg Bags │ │
│ │         [-]  [ 24 ]  [+]   [ MT ▾ ]  [🗑]│ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ Terms: Commercial Proforma issued in 48h     │
│ [      PROCEED TO FORMAL RFQ FORM      ]     │ ➔ 48px sticky button
└──────────────────────────────────────────────┘
```

---

### 4.9 RFQ Form (Single Column, Input Modes, Autocomplete & Sticky Submit)

#### Mobile Optimization Specifications
1. **Single-Column Stacking:** All fields stack vertically in logical 1-column order.
2. **Input Modes:**
   - Email: `type="email" inputMode="email" autoComplete="email"`
   - Phone/WhatsApp: `type="tel" inputMode="tel" autoComplete="tel"`
   - Numbers (Tonnage): `type="number" inputMode="numeric"`
   - Contact Name: `type="text" autoComplete="name"`
   - Company: `type="text" autoComplete="organization"`
   - Country: `type="text" autoComplete="country-name"`
3. **Typography:** All inputs have `text-base` (16px) to eliminate iOS Safari viewport zoom.
4. **Touch Hits for Checkboxes:** Custom Private Label and Lab Sample checkboxes wrapped in full-width tap cards (min height 52px).
5. **Sticky Form Submit Bar:** Renders at bottom of viewport when scrolled past top of form.

#### ASCII Wireframe: Mobile RFQ Form
```
┌──────────────────────────────────────────────┐
│ 1. BUYER & COMPANY IDENTIFICATION            │
│ Contact Name *                               │
│ [ Michael Vance                            ] │
│ Corporate Email *                            │
│ [ procurement@eurofoods.de                 ] │
│ Registered Company *                         │
│ [ EuroFoods GmbH                           ] │
│ Destination Country *                        │
│ [ Germany                                  ] │
├──────────────────────────────────────────────┤
│ 2. MARITIME LOGISTICS & INCOTERMS            │
│ Destination Discharge Port                   │
│ [ Port of Hamburg (DEHAM)                  ] │
│ Requested Incoterm                           │
│ [ CIF (Cost, Insurance & Freight)       ▾  ] │
├──────────────────────────────────────────────┤
│ [✓] Require Private Label OEM Packaging      │ ➔ 52px tap card
│ [✓] Require DHL/FedEx Lab Sample Dispatch    │ ➔ 52px tap card
├──────────────────────────────────────────────┤
│ [     SUBMIT FORMAL RFQ (48h GUARANTEE)    ] │ ➔ Sticky Submit
└──────────────────────────────────────────────┘
```

---

### 4.10 Process Timeline (Connected Vertical Step Tracker)

#### Behavior
- In `ExportProcessPage`, steps 01–05 are connected by a vertical timeline spine (2px width in accent/primary color).
- Numbered circular beacon pins (01, 02, 03, 04, 05) align along the left rail.
- Phase titles, descriptions, and documents display cleanly to the right of the spine.

#### ASCII Wireframe: Vertical Process Timeline
```
┌──────────────────────────────────────────────┐
│ 5-STEP EXPORT WORKFLOW TIMELINE              │
│                                              │
│ (01)── Enquiry & 48h Binding Quotation       │
│  │     Submit specifications, MT volume, and │
│  │     discharge port. Binding proforma pack.│
│  │     [Docs: Proforma Invoice, Specs Sheet] │
│  │                                           │
│ (02)── Sample Dispatch & COA Approval        │
│  │     Air courier dispatch of 250g–500g lot │
│  │     samples via DHL/FedEx with lab COA.   │
│  │                                           │
│ (03)── Commercial Contract & Banking (LC/TT) │
│  │     Sales agreement governed by Incoterms.│
│  │                                           │
│ (04)── Sortex Cleaning & Container Stuffing  │
│  │     Optical sorting, desiccant barriers.  │
│  │                                           │
│ (05)── Port Clearance & Ocean Bill of Lading │
│        Customs clearance at Mundra/JNPT.     │
└──────────────────────────────────────────────┘
```

---

### 4.11 Buyer Testimonials (Touch Swipe Carousel)

#### Behavior
- In `GlobalReachPage`, testimonials transform from a 3-column desktop grid into a horizontal swipe carousel.
- Displays 1 full card at a time with subtle peek of next card (`w-[88vw] snap-center`).
- Includes star ratings, buyer quote, company, designation, country flag, and bottom pagination dots.

---

### 4.12 Sticky Bottom Action Bar & Coordinated Floating Desk

#### Coordinated Touch Layer Architecture
```css
/* Sticky Bottom Quote Bar */
.sticky-quote-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(3.75rem + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 40;
}

/* Floating Actions (WhatsApp + Trade AI) */
.floating-desk-actions {
  position: fixed;
  bottom: calc(4.25rem + env(safe-area-inset-bottom, 0px));
  right: 1rem;
  z-index: 40;
}
```

---

## 5. Motion and Animation on Mobile

### 5.1 Desktop to Mobile Motion Mapping

Every single animation currently configured on desktop must have a dedicated mobile rule:

| Animation / Interaction | Desktop Behavior (≥1024px) | Mobile Behavior (<1024px) | Rationale |
|---|---|---|---|
| **`useSmoothScroll` (Lenis)** | Inertial smooth scroll via Lenis with `wheelMultiplier: 1.0` and `duration: 1.1s`. | **REMOVED** on touch (`window.__lenis = null;`). Native touch momentum scroll used. | Lenis fights iOS/Android hardware momentum; causes rubber-banding lag and scroll conflicts with bottom sheets. |
| **`useScrollReveal` (GSAP)** | `y: 20px`, `duration: 0.6s`, `stagger: 0.06s` triggered at `top 85%`. | **SIMPLIFIED:** `y: 10px`, `duration: 0.35s`, `stagger: 0.03s`, plays once. | Shorter physical distance prevents perceptible jitter on fast thumb swipes; faster completion. |
| **Hero Port Gateway Unveil** | Multi-step GSAP timeline: map scale, masked lines `y: 22px`, CTAs, trust points (total 1.2s). | **SIMPLIFIED:** Masked lines `y: 12px`, duration 0.45s; map replaced by swipe cards. | Immediate content accessibility; avoids blocking user engagement on initial render. |
| **`AntigravityWaveTrack`** | 60fps rAF loop calculating sinusoidal wave `y` offsets and SVG path. | **REPLACED** with CSS touch-scroll track (`scroll-snap-type: x mandatory`). rAF loop paused below 1024px. | Eliminates high CPU/GPU battery drain on mobile; smooth native 120Hz/60Hz touch scrolling. |
| **`CertificationMarquee`** | Infinite CSS marquee (35s) with `hover:[animation-play-state:paused]`. | **SIMPLIFIED:** Infinite marquee with touchstart pause and touchend resume. | Touch devices have no persistent `:hover`; touchstart pause lets buyers read accreditations. |
| **`ProductCard` Hover Elevate** | `hover:-translate-y-1 hover:shadow-card` (300ms). | **REPLACED:** `:active:scale-[0.98]` tactile press feedback (150ms). | No hover on touch; tactile tap feedback confirms selection. |
| **`QuoteDrawer` Slide-In** | Right drawer slide `translate-x-full` to `translate-x-0` with `pl-10`. | **REPLACED** with Bottom Sheet: `translate-y-full` to `translate-y-0` with drag dismiss handle. | Natural mobile ergonomic pattern; 100% width with bottom thumb zone reach. |
| **`MegaMenu` Dropdown** | Hover popover under header across full width. | **REPLACED** with full-screen slide Drawer containing Category Accordion. | Mega-menu hover cannot function on touch; accordion offers clear multi-level browsing. |
| **`ChatWidget` Popover** | Desktop floating window 410px wide, bottom 160px. | **REPLACED** with full-screen or 90vh Bottom Sheet modal with safe-area handling. | Prevents mobile virtual keyboard from pushing chat window off-screen. |
| **`AnimatedCounter`** | 1.8s duration roll-up via GSAP on scroll. | **SIMPLIFIED:** 1.0s duration roll-up. | Faster settling keeps pace with quick mobile thumb scrolling. |
| **Route Transitions** | `translate3d(0, 6px, 0)` fade in 240ms. | **SAME:** Subtle 6px upward settle in 200ms. | Clean and lightweight; zero layout shift. |

---

### 5.2 Motion Tokens & Timing Adjustments

```js
// Mobile Motion Adjustments (Scoped below 1024px)
export const mobileMotionTokens = {
  duration: {
    instant: 0,
    fast: 120,      // Micro touch press / tap feedback
    base: 240,      // Sheet transitions, accordions
    slow: 380,      // Full-screen drawer entry
  },
  distance: {
    micro: 2,       // Active button depression
    subtle: 6,      // Badges
    reveal: 12,     // Mobile scroll reveals (reduced from 20px)
  },
  easing: {
    standard: 'cubic-bezier(0.22, 1, 0.36, 1)', // Smooth deceleration
    sheet: 'cubic-bezier(0.32, 0.72, 0, 1)',    // iOS-style sheet glide
  },
};
```

---

### 5.3 Touch Physics & Gesture Interactions

1. **Bottom Sheet Momentum & Dismissal:**
   - Drag handle bar at top of sheet (36px wide, 4px high, rounded pill, neutral-300).
   - Touch drag down by >80px or fast downward velocity triggers sheet close.
   - Smooth backdrop fade synchronized with sheet translateY.
2. **Tactile Active Feedback:**
   - Buttons and interactive cards feature `:active:scale-[0.98]` with `transition-transform duration-100`.
   - Subtle tactile confirmation when adding commodities to quote basket (`scale-125` badge bump).
3. **Scroll Momentum:**
   - All horizontal tracks use `-webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;`.

---

### 5.4 Scroll Triggers & Lenis Touch Deactivation

In `client/src/hooks/useSmoothScroll.js`:
```js
// Strict Mobile Enforcement: Disable Lenis on Touch & Mobile Viewports
const isTouchDevice = 
  typeof window !== 'undefined' && 
  ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);

if (isTouchDevice || isReducedMotion()) {
  return; // Completely bypass Lenis, restore 100% native hardware scrolling
}
```

---

### 5.5 Accessibility: Prefers-Reduced-Motion

When `prefers-reduced-motion: reduce` is detected:
- All transforms and transitions are zeroed (`duration: 0.01ms !important`).
- Bottom sheets and drawers snap into view instantly (`transform: none !important; opacity: 1 !important;`).
- Marquees and tickers are stopped; items wrap statically.

---

### 5.6 Performance Budget & 60FPS Guarantee

- **Compositor Properties Strictly:** Only `transform` and `opacity` are animated. Never animate `height`, `width`, `top`, `bottom`, `padding`, or `margin`.
- **GPU Layer Promotion:** Sheets and floating triggers use `transform-gpu` (`will-change: transform`).
- **Cumulative Layout Shift (CLS):** Pre-set aspect ratios on all media (`aspect-[4/3]`, `aspect-square`) ensure CLS remains **0.00**.
- **Frame Rate Target:** Solid 60FPS on mid-range Android (e.g. Snapdragon 680 / 4GB RAM) and 120FPS on ProMotion displays.

---

## 6. Images, Media and Performance on Mobile

### 6.1 Responsive Image Strategy

1. **Format:** WebP primary with AVIF progressive enhancement.
2. **Source Sizing (`srcset`):**
   ```html
   <img
     srcset="
       /images/turmeric-360.webp 360w,
       /images/turmeric-640.webp 640w,
       /images/turmeric-1024.webp 1024w
     "
     sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 33vw"
     src="/images/turmeric-640.webp"
     alt="Salem Turmeric Finger — HS 0910.30"
     loading="lazy"
     decoding="async"
     class="w-full h-full object-cover"
   />
   ```
3. **Aspect Ratio Preservation:** All image wrappers define explicit Tailwind aspect ratio containers (`aspect-[4/3]`) to prevent layout shifts during network loading.

### 6.2 Lazy Loading & Resource Preloading

- Hero background and critical brand wordmarks are loaded eagerly (`loading="eager"`, `fetchpriority="high"`).
- All catalogue product cards and gallery thumbnails below the fold load lazily (`loading="lazy"`, `decoding="async"`).

### 6.3 Core Web Vitals Targets on Mobile (Emulated 4G)

- **Largest Contentful Paint (LCP):** < 2.2 seconds.
- **Interaction to Next Paint (INP):** < 150 ms.
- **Cumulative Layout Shift (CLS):** < 0.05.
- **Lighthouse Mobile Score:** 90+ in Performance, 100 in Accessibility, 100 in Best Practices, 100 in SEO.

---

## 7. Accessibility & Device Diversity

### 7.1 WCAG 2.1 AA Compliance
- **Color Contrast:** Deep forest green (#0D2818) and charcoal (#111827) provide **14.2:1** contrast on white (WCAG AAA). Action amber gold (#D97706) text is paired with dark backgrounds or used with white text on amber button fills (contrast **4.8:1**, WCAG AA).
- **Interactive Element Labels:** All icon buttons (`ShoppingBag`, `X`, `Menu`, `Trash2`, `Plus`) possess descriptive `aria-label` tags.

### 7.2 Focus Trapping & ARIA for Drawers & Sheets
- When the Mobile Menu Drawer or Quote Basket Bottom Sheet opens:
  - Focus is trapped within the active dialog.
  - Pressing `Escape` or clicking the backdrop dismisses the dialog.
  - `aria-modal="true" role="dialog"` is declared on the container.
  - Background scrolling is locked cleanly (`document.body.style.overflow = 'hidden'`).

### 7.3 Device Quirks & OS Handling
1. **iOS Safari 100dvh Address Bar Resize:**
   Use `h-[100dvh]` (Dynamic Viewport Height) with `h-[100vh]` fallback so navigation bars do not jump when Safari's address bar collapses on scroll.
2. **iOS Safari Input Auto-Zoom:**
   Inputs strictly use `text-base` (16px) font-size on viewports `<1024px`.
3. **Android Chrome Pull-to-Refresh Conflict:**
   Sheets and full-screen drawers declare `overscroll-behavior: contain;`.

---

## 8. Step-by-Step Implementation Plan

### 8.1 Exact File Sequence & Scoping Boundaries

| Step | Scope & Description | Files to Create / Modify | Desktop Regression Prevention |
|---|---|---|---|
| **Step 1** | **Scroll & Core Touch Foundation**<br>Disable Lenis on touch; add mobile safe-area utilities & 16px input font rules. | • `client/src/hooks/useSmoothScroll.js`<br>• `client/src/styles/tailwind.css` | Touch deactivation only applies to touch/mobile pointers. Desktop Lenis remains 100% intact. |
| **Step 2** | **Mobile Header, Drawer & Category Accordion**<br>Add compact 64px mobile bar, 44px tap targets, full drawer with 8-division category accordion tree. | • `client/src/components/layout/Header.jsx`<br>• `client/src/components/layout/MobileMenuDrawer.jsx` *(new)* | Desktop navbar links and mega-menu are wrapped in `hidden lg:flex`. Zero desktop CSS touched. |
| **Step 3** | **Sticky Bottom Quote Bar & Coordinated Floating Desk**<br>Implement sticky quote bar with live item count; coordinate WhatsApp and ChatWidget positioning above sticky bar. | • `client/src/components/layout/StickyMobileQuoteBar.jsx` *(new)*<br>• `client/src/components/layout/WhatsAppButton.jsx`<br>• `client/src/components/ai/ChatWidget.jsx`<br>• `client/src/app/App.jsx` | Sticky quote bar has `lg:hidden`. WhatsApp and AI widget desktop coordinates unchanged (`lg:bottom-6`). |
| **Step 4** | **Quote Basket Bottom Sheet**<br>Refactor Quote Drawer into a mobile Bottom Sheet with pull handle, touch steppers, and safe-area padding. | • `client/src/components/rfq/QuoteDrawer.jsx` | On `lg:` screens, desktop slide-in drawer layout (`pl-10 max-w-md`) is strictly preserved. |
| **Step 5** | **Product Catalogue & Filter Bottom Sheet**<br>Extract `ProductFilters` into a mobile Bottom Sheet triggered by sticky "Filter & Sort" pill; fix 1-col card layout. | • `client/src/pages/Products/index.jsx`<br>• `client/src/components/product/ProductCard.jsx`<br>• `client/src/components/product/MobileFilterSheet.jsx` *(new)* | Desktop 4-column grid and sidebar filter remain exactly in place (`hidden lg:block`). |
| **Step 6** | **Product Detail Mobile Touch Experience**<br>Implement touch swipe carousel for gallery; stacked spec cards for tables; 16px form inputs with stepper. | • `client/src/pages/ProductDetail/index.jsx`<br>• `client/src/components/product/ProductGallery.jsx`<br>• `client/src/components/product/SpecTable.jsx` | Gallery click thumbnails and desktop HTML table are retained on `lg:` viewports. |
| **Step 7** | **Home Page Mobile Optimization**<br>Replace heavy SVG trade map with swipeable Destination Ports Carousel; simplify category wave track into CSS snap track. | • `client/src/pages/Home/index.jsx`<br>• `client/src/components/home/WorldTradeMap.jsx`<br>• `client/src/components/category/AntigravityWaveTrack.jsx` | Desktop World Trade Map SVG and 60fps wave track remain active on `lg:block`. |
| **Step 8** | **Conversion & Trust Pages Polish**<br>Reverse Contact page column order (form first); vertical timeline on Process; swipe carousel for Testimonials; stacked tables on Quality. | • `client/src/pages/Contact/index.jsx`<br>• `client/src/components/rfq/QuoteForm.jsx`<br>• `client/src/pages/ExportProcess/index.jsx`<br>• `client/src/pages/GlobalReach/index.jsx`<br>• `client/src/pages/Quality/index.jsx`<br>• `client/src/pages/SampleRequest/index.jsx` | Desktop 2-column layouts and tables retained via `lg:grid` and `lg:table`. |
| **Step 9** | **Mobile Admin & Final QA**<br>Responsive card shell for admin inquiries/quotes; comprehensive device testing & bundle check. | • `client/src/admin/components/AdminLayout.jsx`<br>• `client/src/admin/components/AdminTableShell.jsx` | Desktop admin command center and data tables completely unchanged. |

---

### 8.2 Comprehensive Test Plan

#### Test Devices & Viewports
- **360px × 740px** (Galaxy S8/S9, Android small)
- **390px × 844px** (iPhone 12/13/14/15, iOS Safari)
- **430px × 932px** (iPhone 14/15/16 Pro Max)
- **768px × 1024px** (iPad Mini / Portrait Tablet)
- **1024px × 768px** (Desktop Boundary Check)
- **1440px × 900px** (Desktop Baseline Verification)

#### Device & Browser Quirk Checks
- **iOS Safari:** Verify that focusing any input field does *not* trigger viewport auto-zoom (font-size ≥ 16px).
- **iOS Home Bar:** Verify sticky bottom bar clears `env(safe-area-inset-bottom)`.
- **Dynamic Address Bar:** Verify that scrolling up/down does not break full-height modal layouts (`100dvh`).
- **Touch Emulation:** Verify swipe gestures on gallery, testimonials, and category track.
- **Throttling:** Test on Chrome DevTools "Fast 4G" and 4× CPU slowdown; verify 60fps scrolling and LCP under 2.5s.
- **Reduced Motion:** Enable `prefers-reduced-motion` in browser; verify all transitions complete immediately with zero spatial motion.

---

### 8.3 "Done When..." Checklists per Step

#### Step 1: Core Foundation & Scroll
- [ ] Lenis is bypassed when pointer is coarse or viewport <1024px.
- [ ] Native momentum scroll operates smoothly with zero rubber-band jitter.
- [ ] Safe-area utility classes are available in Tailwind.
- [ ] Desktop smooth scroll at 1024px and 1440px operates identically to baseline.

#### Step 2: Header, Drawer & Category Accordion
- [ ] Header height is 64px on mobile, leaving more vertical reading room.
- [ ] Hamburger opens full-screen or slide drawer with smooth cubic-bezier easing.
- [ ] All 8 categories render with HS Chapter pills and expandable sub-categories.
- [ ] Tap targets for menu, basket, and category items are ≥44px.
- [ ] Body scroll locks when drawer is active.
- [ ] Desktop header and mega-menu are 100% unchanged at 1024px and 1440px.

#### Step 3: Sticky Bottom Quote Bar & Coordinated Floating Desk
- [ ] Sticky bottom quote bar appears at viewport bottom on mobile screens.
- [ ] Item count badge updates reactively when adding products.
- [ ] WhatsApp and Chat Assistant floating buttons sit cleanly above the sticky bar.
- [ ] No button overlap occurs at 360px width.
- [ ] Sticky bar is hidden (`lg:hidden`) on desktop (≥1024px).

#### Step 4: Quote Basket Bottom Sheet
- [ ] Basket opens smoothly from bottom with backdrop blur.
- [ ] Drag handle bar is visible and touch-responsive.
- [ ] Items feature thumb-friendly `+` and `-` quantity steppers.
- [ ] "Proceed to RFQ Form" button is pinned to sheet bottom above safe-area inset.
- [ ] Desktop quote drawer at 1024px and 1440px retains its original right slide-in format.

#### Step 5: Product Catalogue & Filter Bottom Sheet
- [ ] Filter sidebar is moved into a Bottom Sheet on viewports <1024px.
- [ ] Product grid starts immediately below the search/filter trigger bar.
- [ ] Filter count badge reflects active categories and sort parameters.
- [ ] Product cards render cleanly on 360px without truncated button text.
- [ ] Desktop sidebar filter at 1024px and 1440px remains visible beside the grid.

#### Step 6: Product Detail Mobile Touch Experience
- [ ] Product gallery supports horizontal touch swipe with momentum and pagination dots.
- [ ] Spec table displays stacked key-value cards with clear parameter labels.
- [ ] Commercial order box inputs have 16px font-size (no iOS zoom).
- [ ] Sticky bottom bar provides 1-tap "Add to Quote Basket".
- [ ] Desktop gallery thumbnails and HTML spec table remain unchanged at ≥1024px.

#### Step 7: Home Page Mobile Optimization
- [ ] Hero headline wraps cleanly with balanced typography at 360px.
- [ ] World Trade Section features swipeable Destination Ports Carousel on mobile.
- [ ] `AntigravityWaveTrack` runs lightweight CSS touch track below 1024px.
- [ ] Accreditations marquee supports touch-to-pause.
- [ ] Desktop World Trade Map SVG and 60fps wave track remain active at ≥1024px.

#### Step 8: Conversion & Trust Pages Polish
- [ ] On `/contact`, RFQ form appears above corporate office text.
- [ ] Form inputs include `inputMode`, `autoComplete`, and 16px font size.
- [ ] Process timeline displays vertical connecting spine with step badges.
- [ ] Testimonials on `/global-reach` feature 1-card touch swipe carousel.
- [ ] Testing parameters on `/quality` stack cleanly into cards.
- [ ] Desktop 2-column layouts at 1024px and 1440px are completely untouched.

#### Step 9: Mobile Admin & Final QA
- [ ] Admin panel navigation drawer opens smoothly on phone.
- [ ] Data tables adapt to responsive card format on mobile viewports.
- [ ] Zero console errors, zero layout shifts, zero regressions on desktop.

---

### 8.4 Desktop Regression Verification Checklist (1024px & 1440px)

Before concluding any step, verify each of the following:

- [ ] **1440px Check:** Header logo, mega-menu dropdown on hover, desktop utility bar, and layout margins are identical to original.
- [ ] **1440px Check:** Hero port gateway unveil animation, world trade map SVG, and 60fps wave track run as originally approved.
- [ ] **1440px Check:** Catalogue 4-column grid and left sidebar filter match original layout.
- [ ] **1440px Check:** Product Detail gallery thumbnail bar, HTML spec table, and order box match original layout.
- [ ] **1024px Check:** iPad Pro landscape breakpoint retains full desktop layout without rendering mobile sticky bars or bottom sheets.
- [ ] **General Check:** No desktop CSS files, shared utility tokens, or global wrappers have been altered without mobile breakpoint scoping.

---

## Assumptions and Open Questions

### Assumptions
1. **Desktop Baseline Integrity:** The current desktop UI code in `client/src` represents the approved, golden standard. We will not touch or refactor any desktop styling.
2. **Category Hierarchy:** The 8 categories defined in `database-design.md` §6 and populated in the backend seed data serve as the exact categories displayed in the mobile navigation accordion tree.
3. **No Online Payment:** All CTAs drive to Request a Quote (RFQ) or Sample Request. No shopping cart, checkout, or public prices are introduced.
4. **Touch Device Detection:** Touch devices are scoped using `@media (hover: none) and (pointer: coarse)` and viewport `<1024px`.

### Open Questions for Client / Lead Review
1. **WhatsApp & Trade Assistant Stacking Preference:** We have designed the Sticky Bottom Quote Bar with the WhatsApp FAB and Trade Assistant AI FAB positioned neatly above it on the right. Is this stacked layout preferred, or would you like WhatsApp integrated directly inside the Sticky Bottom Bar alongside the "Request a Quote" CTA?
2. **Mobile Admin Scope:** While the public buyer experience is top priority, we have included mobile card adaptations for the Admin Trade Desk (`/admin/*`) so sales officers can manage inquiries on phones. Is this acceptable, or should admin remain strictly desktop-focused?
