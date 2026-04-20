# nareshbabu.me — Site Specification

> **Repo:** `https://github.com/naresh182k1/nareshbabu_me_blog.git`
> **Local path:** `/Users/naresh1/nareshbabu_me_blog`
> **Live URL:** `https://nareshbabu.me`
> **Framework:** Astro 6.x (static output) + Tailwind CSS 4.x
> **Hosting:** Cloudflare Pages (auto-deploys on push to `main`)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 6.1+ with MDX |
| Styling | Tailwind CSS 4.x via `@tailwindcss/vite` |
| Content | MDX files with Zod-validated frontmatter |
| Fonts | Google Fonts — Inter (primary), Fraunces + DM Sans + JetBrains Mono (InfiniAI decks) |
| Sitemap | `@astrojs/sitemap` (auto-generated) |
| RSS | `@astrojs/rss` at `/rss.xml` |
| CMS | Decap CMS (formerly Netlify CMS) at `/admin` with GitHub OAuth |
| Build | `npm run build` → static HTML in `dist/` |
| Deploy | Cloudflare Pages, auto-deploy on push to `main` |

---

## Directory Structure

```
nareshbabu_me_blog/
├── public/
│   ├── admin/
│   │   ├── config.yml          # Decap CMS collection definitions
│   │   └── index.html          # CMS admin interface
│   ├── images/                  # Static images (blog, reports, decks, etc.)
│   ├── favicon.svg
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Header.astro         # Site-wide nav bar (sticky, mobile responsive)
│   │   ├── Footer.astro         # Newsletter signup + links
│   │   ├── BlogCard.astro       # Reusable blog post card
│   │   ├── ChatbotWidget.astro  # Floating chat widget (placeholder)
│   │   └── VideoEmbed.astro     # Video embed component
│   ├── content/
│   │   ├── blog/                # Blog post MDX files
│   │   ├── insights/            # Case study / insight MDX files
│   │   ├── reports/             # Industry report MDX files
│   │   └── decks/               # Pitch deck MDX files
│   │       ├── personal/        # Personal brand decks
│   │       ├── infiniai/        # InfiniAI brand decks
│   │       └── mobilelive/      # MobileLive brand decks
│   ├── layouts/
│   │   ├── BaseLayout.astro     # Root HTML shell (SEO, OG tags, JSON-LD)
│   │   ├── BlogLayout.astro     # Blog post layout (extends BaseLayout)
│   │   └── DeckLayout.astro     # Full-screen slide presentation layout
│   ├── pages/
│   │   ├── index.astro          # Homepage (hero, services, featured posts)
│   │   ├── expertise.astro      # Services / expertise page
│   │   ├── contact.astro        # Contact form page
│   │   ├── reports.astro        # Reports listing (with download modal)
│   │   ├── rss.xml.ts           # RSS feed generator
│   │   ├── blog/
│   │   │   ├── index.astro      # Blog listing (filterable by category/tag)
│   │   │   └── [...slug].astro  # Dynamic blog post route
│   │   ├── insights/
│   │   │   ├── index.astro      # Insights listing
│   │   │   └── [...slug].astro  # Dynamic insight route
│   │   └── decks/
│   │       ├── index.astro      # Deck listing (grid with brand badges)
│   │       └── [...slug].astro  # Dynamic deck route (slide presentation)
│   ├── styles/
│   │   └── global.css           # Tailwind config, prose styles, deck CSS
│   └── content.config.ts        # Content collection schemas (Zod)
├── astro.config.mjs             # Astro configuration
├── wrangler.toml                # Cloudflare Pages config
├── package.json
└── spec.md                      # This file
```

---

## Content Collections

All content is MDX with validated frontmatter. Defined in `src/content.config.ts`.

### Blog (`src/content/blog/`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| description | string | Yes | SEO description, < 160 chars |
| pubDate | string | Yes | Format: `YYYY-MM-DD` |
| updatedDate | string | No | |
| heroImage | string | No | Path like `/images/blog/...` |
| category | string | No | e.g. "AI & ML", "Data Engineering" |
| tags | string[] | No | Array of tags |
| author | string | No | Default: "Naresh Babu" |
| readingTime | string | No | e.g. "14 min read" |

**URL pattern:** `/blog/[filename-without-extension]`
**Layout:** `BlogLayout.astro` → `BaseLayout.astro`

### Insights (`src/content/insights/`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| description | string | Yes | |
| pubDate | string | Yes | |
| heroImage | string | No | |
| category | string | No | |
| client | string | No | Client name (can be anonymized) |
| industry | string | No | |
| tags | string[] | No | |

**URL pattern:** `/insights/[filename-without-extension]`

### Reports (`src/content/reports/`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| description | string | Yes | |
| pubDate | string | Yes | |
| coverImage | string | No | |
| source | string | Yes | e.g. "Gartner", "McKinsey" |
| category | string | No | |
| fileUrl | string | No | Link to PDF or external source |
| tags | string[] | No | |

**URL pattern:** `/reports` (single listing page, no individual pages)
**Note:** Reports use a download modal that collects user details before providing access.

### Pitch Decks (`src/content/decks/`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| description | string | Yes | |
| pubDate | string | Yes | |
| coverImage | string | No | |
| client | string | No | Client or audience |
| brand | enum | No | `personal` (default), `infiniai`, `mobilelive` |
| category | string | No | |
| tags | string[] | No | |
| author | string | No | Default: "Naresh Babu" |

**URL pattern:** `/decks/[brand-folder]/[filename]`
**Layout:** `DeckLayout.astro` (standalone, does NOT use BaseLayout)

#### How slides work

- MDX content is written as normal markdown
- Use `---` (horizontal rule / `<hr>`) to separate slides
- Client-side JS splits the rendered HTML at `<hr>` elements into slide sections
- Each section becomes a full-screen navigable slide

#### Brand themes

| Brand | Background | Font | Accent |
|-------|-----------|------|--------|
| `personal` | Dark navy `#0f172a` | Inter | Blue `#1e3a5f` |
| `infiniai` | Warm white `#FAFAF2` | Fraunces + DM Sans | Green `#7A8A00` / Orange `#C67A10` |
| `mobilelive` | Dark indigo `#1a1a2e` | Inter | Orange `#e8913a` |

#### Slide navigation features

- Keyboard: Arrow keys, Space (next), Home/End, F (fullscreen)
- Touch: Swipe left/right
- Hash-based deep linking: `#slide-2`, `#slide-3`, etc.
- Print-to-PDF: Cmd+P renders each slide on a separate page
- Progress bar at bottom, slide counter in nav controls
- "Presented by" watermark (brand-aware)

---

## Layouts

### BaseLayout.astro
Root HTML layout used by all standard pages. Provides:
- SEO meta tags (title, description, keywords)
- Open Graph + Twitter Card tags
- JSON-LD structured data (WebSite or BlogPosting)
- Google Fonts preconnect
- Header, Footer, ChatbotWidget
- RSS feed link

### BlogLayout.astro
Wraps BaseLayout for blog posts. Adds:
- Article metadata bar (date, author, reading time, category)
- Hero image
- Tag badges
- Prose-formatted content area

### DeckLayout.astro
Standalone full-screen layout (does NOT include Header/Footer). Provides:
- Minimal top bar with back link, title, client badge, brand label
- Slide viewport with JS-powered navigation
- Bottom nav controls (prev/next, slide counter)
- Progress bar
- Brand-aware watermark

---

## Navigation

Defined in `Header.astro`:

```
Home → /
Blog → /blog
Expertise → /expertise
Insights → /insights
Reports → /reports
Decks → /decks
Contact → /contact
```

Mobile: hamburger menu with same links.
Search icon links to `/blog#search`.

---

## Styling

`src/styles/global.css` uses Tailwind CSS 4 with `@theme` for design tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#1e3a5f` | Nav, buttons, links |
| `--color-primary-light` | `#2d5a8e` | Hover states |
| `--color-primary-dark` | `#0f1f33` | Footer, gradients |
| `--color-secondary` | `#e8913a` | CTAs, highlights |
| `--color-accent` | `#2ecc71` | Success states |
| `--color-surface` | `#f8fafc` | Card backgrounds |
| `--color-text` | `#334155` | Body text |
| `--color-border` | `#e2e8f0` | Dividers |

Prose styles (`.prose`) handle all MDX content rendering.
Deck styles (`.deck-*`) are scoped to the presentation layout.

---

## Deployment

### Cloudflare Pages

- **Project name:** `nareshbabu`
- **GitHub repo:** `naresh182k1/nareshbabu_me_blog`
- **Branch:** `main`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 22.x (set in `package.json` engines)
- **`wrangler.toml`:** configures `pages_build_output_dir = "./dist"`

Pushing to `main` triggers automatic build + deploy (~2 minutes).

### Planned subdomains

| Subdomain | Maps to |
|-----------|---------|
| `infiniai.nareshbabu.me` | `/decks/infiniai/` |
| `mobilelive.nareshbabu.me` | `/decks/mobilelive/` |

Setup requires in Cloudflare Dashboard:
1. DNS CNAME records for `infiniai` and `mobilelive` → Pages project hostname
2. Custom domains added to the Pages project
3. Redirect rules to map subdomain requests to the correct paths

---

## Decap CMS

Accessible at `/admin`. Configured in `public/admin/config.yml`.

- **Backend:** GitHub OAuth via Cloudflare Pages Functions
- **Repo:** `naresh182k1/nareshbabu_me_blog`
- **Branch:** `main`
- **Publish mode:** Editorial workflow (draft → review → publish)
- **Media:** Uploaded to `public/images/`, served from `/images/`

### Collections in CMS

1. **Blog Posts** — full markdown editor
2. **Insights** — with client and industry fields
3. **Reports** — with source and file URL fields
4. **Pitch Decks** — with brand dropdown (Personal / InfiniAI / MobileLive), hint about `---` slide separators

---

## How to Add Content

### New blog post
1. Create `src/content/blog/my-post-slug.mdx` with frontmatter
2. Or use Decap CMS at `/admin`

### New pitch deck
1. Create file in the appropriate brand folder:
   - `src/content/decks/personal/my-deck.mdx`
   - `src/content/decks/infiniai/my-deck.mdx`
   - `src/content/decks/mobilelive/my-deck.mdx`
2. Set `brand` field in frontmatter to match the folder
3. Write content with `---` between slides
4. Push to `main`

### New insight or report
Same pattern — create MDX in the relevant `src/content/` folder.

---

## Key Commands

```bash
npm run dev       # Start dev server (localhost:4321)
npm run build     # Build static site to dist/
npm run preview   # Preview built site locally
```
