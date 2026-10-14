# Portfolio redesign: "Constellation, upgraded"

Design handoff for **Kamruzzaman Khan Alve's portfolio** (Next.js App Router, static export, deployed on Vercel).
This README is the single source of truth for behaviour and content. `screenshots/` is the visual target, `designs/` holds a live, openable prototype of every page, and `tools/compare.mjs` screenshots the real site for comparison.

The visual direction keeps the current site's identity (dark green-black, mint accent, numbered "stations", a constellation motif) and adds motion, a site-wide starfield, and a stronger content hierarchy (numbers first, caveats second).

---

## 1. How to use this package

1. Put this folder, unchanged, in the root of the portfolio repo so the path is `./portfolio-redesign/README.md`. It is not deployed: a static export only ships `app/` and `public/`.
2. Open the coding agent (Claude Code, Codex or similar) in the repo and give it the prompts from **section 12**, one step at a time.
3. After each step, compare the agent's screenshots in `compare/` with `screenshots/` yourself before allowing the next step.

---

## 2. The visual target (read this before writing any code)

**The screenshots are the target. Match them.** This README explains behaviour, tokens and content mapping; where this text and a screenshot disagree about how something looks, the screenshot wins.

### 2.1 Screenshots (`screenshots/`)

Every page at desktop (1440 px wide) and mobile (390 px wide), full page:

| File | Shows |
|---|---|
| `01-home-hero--desktop.png`, `--mobile.png` | Home, first screen (station 01) |
| `01-home-hero--station-01.png` … `--station-05.png` | Home hero on each of the five stations: which constellation nodes light up, copy per station |
| `02-home-sections--desktop.png`, `--mobile.png` | Home below the hero (`#selected-work` onwards) |
| `03-projects--desktop.png`, `--mobile.png` | `/projects` (Resume Evaluator's engineering notes open) |
| `03-projects--filter-mobile.png` | `/projects` with the MOBILE filter chip active |
| `04-research--*.png` | `/research` |
| `05-research-detail--*.png` | `/research/bangla-sentence-type-classification` |
| `06-cv--*.png` | `/cv` |
| `07-not-found--*.png` | 404 |

On the real site the home page is one route: the hero (01) followed directly by the sections (02).

### 2.2 Live designs (`designs/`)

Open any `designs/*.dc.html` file directly in a browser (double-click, or `open designs/01-home-hero.dc.html`). Keep `support.js` next to them. They run with their animations and interactions: the hero auto-advances, stations and filter chips are clickable, the BibTeX copy button works, mobile layout responds to the window width. Use them to check timing and behaviour that a screenshot cannot show.

`support.js` is a small preview runtime (Preact plus a template interpreter). **It is not production code. Do not copy it, its template syntax, or `.dc.html` files into the site.** Rebuild each page as normal Next.js components.

### 2.3 Reading the source of a design file

| In the file | Meaning |
|---|---|
| Inline `style="..."` | Exact sizes, colors, spacing, layout. Translate to Tailwind utilities or tokens with the same values. |
| `<helmet>` | Fonts, `@keyframes` and media queries used by that page. |
| `{{name}}` | A value from `renderVals()` in the `<script type="text/x-dc">` block at the bottom. |
| `<sc-for list="{{items}}" as="item">` | A loop (`items.map(...)`). |
| `<sc-if value="{{cond}}">` | A conditional (`cond && ...`). |
| `class Component extends DCLogic` | Prototype state and data: `constructor` (state, data), `renderVals()` (derived values), `componentDidMount` (timers). |
| `href="#"` | Placeholder. Real routes and URLs are in section 4. |

Data inside the prototypes mirrors the live site. **In the real code, content stays in `src/content/*.mdx` and `src/lib/site.ts`** (mapping in section 9); never hardcode copy from the prototypes into JSX. Every number in the prototypes is sourced (section 10).

### 2.4 Checking your work against the target (required after every step)

1. `npm run build && npm start` (serves the export at `http://127.0.0.1:4173`).
2. `node portfolio-redesign/tools/compare.mjs http://127.0.0.1:4173` writes the same set of screenshots of the real site to `portfolio-redesign/compare/` and reports horizontal overflow and JavaScript errors. If `playwright` is missing: `npm i -D playwright && npx playwright install chromium`.
3. Open each `compare/` image next to its `screenshots/` counterpart and list every visible difference: layout, spacing, font size or weight, color, missing or extra elements, mobile wrapping.
4. Fix the differences and repeat until none remain that matter. **Do not commit a step while known visual differences remain**; if one cannot be fixed, say which and why.
5. `compare/` is a working folder; add it to `.gitignore`.

---

## 3. Page map

| Route | Design file | Notes |
|---|---|---|
| `/` (top) | `designs/01-home-hero.dc.html` | Station hero with animated constellation. Interactive. |
| `/` (below hero) | `designs/02-home-sections.dc.html` | `#selected-work`: 3 projects, 3 research records, profile, footer. |
| `/projects/` | `designs/03-projects.dc.html` | All 5 projects, filter chips, expandable engineering notes. Interactive. |
| `/research/` | `designs/04-research.dc.html` | Published (2) and Undergraduate thesis (1). |
| `/research/[slug]/` | `designs/05-research-detail.dc.html` | Template, shown with the QPAIN paper. Copy-BibTeX button. Applies to all 3 slugs. |
| `/cv/` | `designs/06-cv.dc.html` | Web CV with PDF download (`/cv.pdf`). |
| 404 (`src/app/not-found.tsx`) | `designs/07-not-found.dc.html` | "Off the map" with a drifting node. |

Research slugs on the live site: `bangla-sentence-type-classification`, `vocabulary-difficulty-prediction`, `leakage-safe-adhd-eeg-framework`. The thesis detail page has no "Paper" link and no metric strip from a paper; show its **Overview** and **Notes** (supervisor line, "separate from the subsequent five-arm journal rerun") in the same layout as Abstract. Prev/next record links cycle through the three slugs.

---

## 4. Real links (replace every `href="#"`)

| Label | URL |
|---|---|
| Email | `mailto:kamruzzamanalve@gmail.com` (**not** the Gmail web-compose URL used today; source: `src/lib/site.ts`) |
| GitHub | https://github.com/alve775 |
| Google Scholar | https://scholar.google.com/citations?user=Zr2KjyMAAAAJ&hl=en |
| Hugging Face | https://huggingface.co/alveKamruzzaman |
| LinkedIn | https://www.linkedin.com/in/kamruzzaman-khan-alve-10a055227 |
| CV PDF | `/cv.pdf` |
| Classifier (live) | https://huggingface.co/spaces/TextLabRUET/Multilingual-Sentence-Classifier |
| Classifier (repo) | https://huggingface.co/spaces/TextLabRUET/Multilingual-Sentence-Classifier/tree/main |
| Resume Evaluator | repo https://github.com/alve775/Resume-Evaluator · live https://resume-evaluator-v2.vercel.app |
| Web-RAG | https://github.com/alve775/web-rag |
| Grocery Shopping Tracker | https://github.com/alve775/grocery-tracker |
| NoorTime | https://github.com/alve775/NoorTime |
| QPAIN paper | https://doi.org/10.1109/QPAIN69676.2026.11546339 |

External links open in a new tab with `rel="noopener noreferrer"` and keep the `↗` glyph.

---

## 5. Design tokens

Define as CSS custom properties in the global stylesheet (or the Tailwind theme, matching whatever the repo already uses).

### Color

| Token | Value | Use |
|---|---|---|
| `--bg` | `#121715` | Page background |
| `--bg-deep` | `#0E1311` | Media frames, code blocks |
| `--surface` | `rgba(18,23,21,0.88)` | Cards (translucent so stars faintly show) |
| `--surface-hover` | `#151C19` | Card hover |
| `--grid-line` | `#18201D` | 64px background grid |
| `--border-subtle` | `#252C29` | Section rules, nav bottom border |
| `--border` | `#2E3633` | Card borders |
| `--border-strong` | `#3A4440` | Secondary buttons |
| `--border-hover` | `#5E7A6F` | Card hover border |
| `--text` | `#E8ECEA` | Headings, primary text |
| `--text-2` | `#B7C0BC` | Body text |
| `--text-3` | `#8A9490` | Labels, meta. **Smallest readable tone.** |
| `--text-4` | `#6E7A75` | Decorative only. In the designs it appears on dim constellation node labels; **use `--text-3` for any text a visitor needs to read** (4.5:1 contrast). |
| `--accent` | `#A9D9C6` | Mint: primary buttons, active states, lit nodes, metrics |
| `--accent-hover` | `#CDEDE0` | Link hover |
| `--warm` | `#D9A06A` | Secondary accent: venues, dates, headline facts, "in development", the 404 stray node |
| `--warm-border` | `#5A4630` | "In development" badge border |
| `--star` | `#CFE9DE` | Starfield dots |
| `--node-dim` | `#4C5A55` | Unlit constellation nodes |
| `--edge-dim` | `#27302C` | Unlit constellation edges |
| `--ring` | `#3F4A46` | Static ring around the constellation core |

Primary button text on mint uses `--bg` (`#121715`).

### Typography

Load with `next/font/google`: **Manrope** (400, 500, 600) and **IBM Plex Mono** (400, 500).

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| Display H1 (home) | Manrope | 66 / 500 | letter-spacing −0.025em, line-height 1.02 |
| Page H1 | Manrope | 64 / 500 (CV 60, research detail 44) | same tracking |
| Section H2 (home) | Manrope | 44 / 500 | −0.02em |
| Section H2 (inner) | Manrope | 26–28 / 500 | |
| Card title | Manrope | 30 (projects) / 22 (research) / 500 | |
| Lead paragraph | Manrope | 20 / 400, line-height 1.5 | `--text-2` |
| Body | Manrope | 15–17, line-height 1.55–1.7 | |
| Card body | Manrope | 14, line-height 1.5 | |
| Label | IBM Plex Mono | 11 / 400, uppercase, letter-spacing 0.12–0.14em | `--text-3` |
| Metric | IBM Plex Mono | 22–40 / 400 | `--accent` or `--warm` |

Below 640px wide, scale display sizes down to about 0.65× (use `clamp()`).

### Shape and spacing

* Radius: pills and buttons 22–24px; cards 4px; badges 12px; tags 2px.
* Card padding 24px (18–20px for small cards). Section gap 48–112px. Page side gutter `clamp(20px, 5vw, 56px)`. Content max-width 1160px.
* Touch targets at least 44px tall.
* Background: `--bg` plus a 64px grid of 1px `--grid-line` lines on every page.

---

## 6. Global layers (in `src/app/layout.tsx`)

### 6.1 Starfield (every page)

* One component rendered once in the root layout: `position: fixed; inset: 0; z-index: -1` (or behind content), `pointer-events: none`, `aria-hidden="true"`.
* Pure CSS. Each star is a 2px (20%: 3px) round `--star` dot animated with a twinkle keyframe.
* **Deterministic positions**, not `Math.random()`, so the static export and hydration match. The prototypes use this seeded generator:

```js
let seed = 11;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
// for each star: x = rnd()*100 (%), y = rnd()*100 (%), size = rnd() < 0.8 ? 2 : 3,
// duration = 3 + rnd()*3 (s), delay = rnd()*4 (s)
```

* Two intensities:
  * **Home hero and 404:** 34 stars, `twinkle` opacity 0.15 → 0.9, duration 2.5–5.5s.
  * **All other pages and below the home hero:** 40 stars, `twinkleSoft` opacity 0.08 → 0.5, duration 3–6s.
  * Simplest implementation: the layout renders the soft field everywhere; the home hero and 404 render the stronger field inside their own section.

### 6.2 Nav

* Left: glowing mint dot (`glow` keyframe) + full name, links to `/`.
* Right: Projects, Research, CV, Email ↗. Active route: `--accent` text, 1px `--accent` underline, `aria-current="page"`.
* Background `rgba(18,23,21,0.7)`, bottom border `--border-subtle`. Wraps on small screens.
* Keep the existing "Skip to content" link.

### 6.3 Footer (every page, the owner's existing design)

* Top border `--border-subtle`, 36px top padding, same max-width container as the page.
* Left: full name (Manrope 20 / 600, `--text`) above `RUET · RAJSHAHI, BANGLADESH` (IBM Plex Mono 12px, uppercase, letter-spacing 0.14em, `--text-3`).
* Right: GitHub, Google Scholar, HuggingFace, LinkedIn, Email as plain `--accent` text links (16px, 28px apart, 12px vertical padding for a 44px tap target). Email is `mailto:`.
* Wraps to two stacked rows on small screens.
* Because the footer carries all social links, the home "Let's talk" block shows only the email, not a second row of link buttons.

---

## 7. Components

### 7.1 Station hero (home only, client component)

* Five stations: 01 IDENTITY, 02 PROJECTS, 03 AI/ML, 04 RESEARCH, 05 CONTACT. Copy for each is in `01-home-hero.dc.html`.
* **Auto-advances every 5s.** The active station button shows a 2px mint progress bar filling over 5s (`fill` keyframe). Clicking a station jumps to it and restarts the timer.
* Content panel cross-fades by remounting the station block: label `fadein` 600ms, heading `rise` 800ms, paragraph and CTAs `rise` with 200–600ms delays.
* **Accessibility (required, WCAG 2.2.2):**
  * Auto-advance pauses while the hero is hovered or has keyboard focus.
  * Add a small pause/play button next to the `01 / 05` counter.
  * Stop auto-advance entirely under `prefers-reduced-motion: reduce`.
  * Stations are real `<button>`s; the active one has `aria-current="true"`.
* Counter strip bottom right: `0N / 05`, a 120px progress line, and "SCROLL, OR CHOOSE A STATION."
* **Below 720 px wide** (see `01-home-hero--mobile.png`): the five station buttons become one horizontally scrollable row above the content; the constellation scales to 68% and hides its node labels; the "SCROLL, OR CHOOSE A STATION." hint is hidden. Display headings use `clamp()` so they never overflow (home H1 `clamp(40px, 10vw, 66px)`, station H2 `clamp(36px, 9vw, 60px)`, page H1 `clamp(40px, 10vw, 64px)`, CV H1 `clamp(34px, 9vw, 60px)`, research detail H1 `clamp(28px, 7vw, 44px)`).
* Mouse glow: a 520px radial gradient of `rgba(169,217,198,0.08)` that follows the pointer, updated with `requestAnimationFrame`. Only on `(pointer: fine)`; hero only.
* Scan line: a 120px soft band moving top to bottom over 9s (`scan`). Hero only.

### 7.2 Constellation (home hero)

* Box 480×420 (scale down to fit on mobile). Core at (240, 210): glowing white center, static ring, three expanding `ring` pulses 1s apart, and a warm dot orbiting at 48px radius (`orbit`, 7s).
* Nodes (x, y within the box) and which stations light them:

| Node | x, y | Lit on stations |
|---|---|---|
| RESUME EVALUATOR | 100, 80 | Identity, Projects |
| WEB-RAG | 60, 240 | Identity, Projects |
| BANGLA CLASSIFIER | 170, 360 | Identity, Projects, AI/ML |
| IEEE QPAIN 2026 | 380, 70 | Identity, AI/ML, Research |
| BEA 2026 · ACL | 420, 230 | Identity, Research |
| EEG THESIS | 340, 360 | Identity, Research |

* Edges: core → every node, plus Classifier → QPAIN, QPAIN → BEA, BEA → Thesis. An edge is lit when both ends are lit (the core always counts as lit).
* Lit node: 12px mint dot with `glow`, label `--text`. Dim node: 8px `--node-dim`, label `--text-3`.
* Lit edge: 1px mint gradient line that **draws itself** with `grow` (scaleX 0 → 1 from its origin, 900ms) when it becomes lit. Dim edge: `--edge-dim`.
* Contact station: no nodes lit, core only.
* Implementation choice is free (absolutely positioned divs as in the prototype, or SVG with `stroke-dashoffset`). The whole constellation is decorative: `aria-hidden="true"`.
* Optional enhancement: Grocery Tracker and NoorTime could be added as two more Projects nodes.

### 7.3 Page header (inner pages)

Station label (mono 11px) → H1 → lead paragraph → optional links, each with `rise` in sequence (0, 80, 200, 320ms). Projects and Research headers carry a small decorative element on the right (mini constellation or a three-number stat strip).

### 7.4 Project card

* Layout: media frame left (16:10, `--bg-deep`, mint corner brackets), text right. Wraps to one column under about 860px.
* Order: stack (mono label) + status badge → title → **headline fact** (mono 22px `--warm`) + note → Problem / Approach / Result in three columns (auto-fit, min 150px) → buttons.
* Status badges: **LIVE** (mint text and border, pulsing dot `blip`), **COMPLETE** (`--text-2`), **IN DEVELOPMENT** (`--warm`).
* Buttons: "Repository ↗" (secondary), "Open live ↗" (primary, only when live).
* **Engineering notes** (projects page only, when the record has them): a text button "ENGINEERING NOTES +" / "HIDE ENGINEERING NOTES −" with `aria-expanded`, revealing My contribution / Key decision / Limitation (Limitation label in `--warm`), animated with `open` (fade and 6px slide, 350ms).
* A vertical mint line runs down the left of the list, with a glowing node beside each card.
* Hover: border `--border-hover`, background `--surface-hover`, lift 2px, 300ms.

### 7.5 Project filters (projects page, client component)

Chips: ALL · LIVE · AI & NLP · WEB · MOBILE, each with its count. Active chip is filled mint, `aria-pressed="true"`. The list and the "N OF 5 RECORDS" counter update immediately. Tags: Resume Evaluator = live, ai, web; Web-RAG = ai; Classifier = live, ai; Grocery = mobile; NoorTime = mobile.

### 7.6 Research card

Field tag (LANGUAGE mint / EEG warm) · venue and role (`--warm`) · status → title (links to the detail page, `→`) → authors → "WHAT THIS SHOWS" + text. Right column, separated by a 1px border: **big metric** (mono 30px mint) + note.

### 7.7 Research detail

* "← ALL RESEARCH" back link → meta row → H1 (44px) → authors with Alve in bold.
* Metric panel on the right: big metric + supporting stats (25,500 sentences, 6 encoders).
* "WHAT THIS SHOWS" callout: mint-tinted background `rgba(169,217,198,0.06)` with `#3D5249` border.
* Abstract ("AS SUBMITTED"), then **Cite**: BibTeX in a `<pre>` (horizontal scroll) with a "COPY BIBTEX" button that writes to the clipboard and shows "COPIED ✓" for 1.8s (`pop` keyframe).
* Sidebar: Links (paper DOI primary, related project secondary) and, for QPAIN, the six models compared.
* Prev/next record navigation at the bottom.

### 7.8 CV

* Header: "CURRICULUM VITAE" label, name, title line in `--warm` mono, "Download PDF ↓" primary button.
* **Single column, no sidebar.** Directly under the header, one row of three equal-height cards that wrap on small screens: **Profile** (wider, flex 2; location line pinned to the bottom), **Education** (degree, RUET 2022–2026, CGPA 3.71 as a big mint metric pinned to the bottom), **Links** (GitHub, Google Scholar, Hugging Face, LinkedIn as rows with ↗, then the email).
* Then full-width sections, 56px apart: Technical skills as **four rows** (group label in a 190px mint mono column, chip tags wrapping to the right, 1px rules between rows), Experience (vertical timeline with glowing nodes; role, org, dates in `--warm`), Publications (linked rows), Selected projects (three small cards).

### 7.9 404

Shown automatically when a visitor opens a URL that does not exist (a typo, an old or broken link). It is not linked from the nav. Next.js serves it from `src/app/not-found.tsx`; the live site already has one with this copy. Its job is to keep the visitor on the site instead of a blank error. Large outlined "404" behind a small constellation; one warm node labelled "YOU?" drifts away on a dashed, animated line (`stray` 5s, `dash` 1.2s, `flicker`). Copy keeps the current wording. Buttons: Back to the constellation (primary), Projects, Research. Uses the strong starfield and the shared footer.

---

## 8. Motion spec

All motion uses `transform` and `opacity` only (plus a short `filter: blur` on entrance). Everything is disabled under `prefers-reduced-motion: reduce`: no auto-advance, no loops, content appears in its final state.

| Keyframe | Effect | Duration / easing | Used on |
|---|---|---|---|
| `rise` | opacity 0 → 1, translateY 24–28px → 0, blur 5–6px → 0 | 800ms `cubic-bezier(.2,.7,.2,1)`, staggered | Headings and leads on page load and station change |
| `fadein` | opacity 0 → 1 | 500–700ms ease-out | Labels, node labels |
| `reveal` | opacity 0 → 1, translateY 32–40px → 0 | scroll-linked | Cards as they enter the viewport |
| `grow` | scaleX 0 → 1 | 900ms | Constellation edges lighting up |
| `fill` | scaleX 0 → 1 | 5s linear | Active station progress bar |
| `ring` | scale 0.4 → 2.6, opacity 0.9 → 0 | 3s ease-out, infinite, 3 staggered | Constellation core |
| `orbit` | rotate 360° | 7s linear infinite | Orbiting warm dot |
| `glow` | pulsing mint box-shadow | 2.4s infinite | Nav dot, lit nodes, timeline nodes |
| `blip` | opacity 1 → 0.35 | 1.6s infinite | LIVE badge dot |
| `twinkle` / `twinkleSoft` | opacity pulse | 2.5–6s infinite | Starfield |
| `scan` | translateY −100% → 900% | 9s linear infinite | Home hero only |
| `open` | opacity + 6px slide | 350ms | Engineering notes |
| `pop` | scale 0.9 → 1 | 250ms | "Copied" state |

**Scroll reveal:** the prototypes use CSS scroll-driven animations (`animation-timeline: view(); animation-range: entry 0% cover 25–28%`). Ship it with a fallback: `@supports (animation-timeline: view())` for the CSS version, otherwise a small `IntersectionObserver` hook that adds an `is-visible` class once (threshold about 0.15) and never re-hides. Content must be visible with JavaScript disabled.

**Performance budget:** at most about 50 continuously animated elements per page; no layout-affecting animation; pause the hero interval when `document.hidden`. Test on a low-end Android phone and keep Lighthouse performance at 90 or above on mobile.

---

## 9. Implementation notes (this repo: Next.js 16, React 19, Tailwind CSS 4, MDX, static export)

Read the repo's own top-level `README.md` first. It documents the content model, the publishing gate and the launch checks; this redesign must not weaken any of them.

**Styling**
* Tailwind CSS 4: put the tokens from section 5 in the CSS `@theme` block (colors, fonts, radii) and the keyframes in the global stylesheet, so utilities like `bg-bg`, `text-accent`, `animate-rise` exist. Keep one source of truth for every value.
* Fonts via `next/font/google` (Manrope, IBM Plex Mono), exposed as CSS variables to `@theme`.
* No browser storage, no analytics, no runtime server: the design needs none of them.

**Components (server by default, client only where state is needed)**
* Client: station hero + constellation, project filters + engineering-notes toggle, copy-BibTeX button, mouse glow.
* Server: Starfield (deterministic positions, pure CSS), Nav, Footer, PageHeader, ProjectCard, ResearchCard, StatusBadge, Metric, Button, Chip.
* Keep the existing reduced-motion fallback, station labels, skip link and focus behaviour that the current tests and QA already cover.

**Content mapping (keep everything in `src/content/*.mdx` and `src/lib/site.ts`; never hardcode copy)**

| Design element | Existing source |
|---|---|
| Project Problem / Approach / Result | `problem`, `approach`, `result` frontmatter |
| Project stack label | `stack` |
| Project media frame | `image` (`src`, `alt`, `caption`, `width`, `height`) |
| Engineering notes | `caseStudy` (`contribution`, `decision`, `limitation`) |
| Status badge | `status`: `live` → LIVE, `complete` → COMPLETE, `wip` → IN DEVELOPMENT, `archived` → ARCHIVED (styled like COMPLETE) |
| Repository / Open live | `repoUrl`, `liveUrl` |
| Research "WHAT THIS SHOWS" | paper `takeaway` |
| Abstract / Overview label | `abstract` + `abstractLabel` (`as submitted` or `summary`) |
| Cite block | `bibtex` |
| Paper links | `pdfUrl`, `codeUrl` (DOI link for QPAIN) |
| Venue, role, status, grouping | `venue`, `year`, `role`, `status` (`thesis` is grouped separately) |
| Name, bio, email, profile links, footer | `src/lib/site.ts` |
| CV education, experience, skills | maintained in `src/app/cv/page.tsx` (publications and selected projects come from MDX) |

**New fields the design needs**
* Add **optional** `metric` and `metricNote` (strings) to the project and paper Zod schemas, and optional `tags` (array of `ai`, `web`, `mobile`) to projects for the filter chips. LIVE is derived from `status`, not a tag.
* A card renders its metric block **only when both fields are present**. Leave them out of a record until the owner supplies a verified value.
* **Never put a placeholder into these fields.** The publishing gate withholds any record whose public fields contain an unresolved placeholder, so a placeholder metric would hide the whole record. Omitting the field is the safe default.
* Follow the repo rule that performance numbers need a named dataset and evaluation protocol: a metric note must say what it was measured on (for example "best test accuracy · 25,500-sentence five-class Bangla benchmark").
* Metrics supported by verified sources, to add now:
  * QPAIN: `97.61%`, note "best test accuracy (BanglaBERT) · 6 encoders · 5,100-sentence test split".
  * BEA: `3 / 3`, note "L1 groups above the official closed-track baseline".
  * Thesis: `121`, note "children in a public cohort · participant-level nested CV".
* Research detail for QPAIN also shows a "Test accuracy by model" list (design file 05). Add it as an optional `results` array (`model`, `group`, `accuracy`) on the paper schema, rendered only when present.

**Routes not in the designs**
* Notes (`src/content/notes/`) are currently empty and hidden from navigation. Keep that behaviour; when notes appear, style the note page like the research detail page (header, body column, footer).

**Images**
* The two existing JPEGs in `public/images/projects/` stay as they are. Projects without an `image` show the empty media frame only if that looks intentional; otherwise collapse the card to a single text column.

**Tests**
* `npm run lint` and `npm test` (unit tests plus export tests) must pass after every step. Update a test only when the design intentionally changes the behaviour it checks, and say which test and why in the commit message.

---

## 10. Content to fill in or verify (owner: Alve)

* **Resolved: QPAIN accuracy.** Source: camera-ready paper (Table V, test split of 5,100 sentences, 1,020 per class; same hyperparameters for all models). BanglaBERT 97.61, XLM-RoBERTa Base 97.57, SahajBERT 97.55, RemBERT Base 97.53, BanglaBERT Base 96.86, mBERT Base 96.43 (accuracy, %; F1 equal to accuracy at two decimals for every model). The deployed Space uses XLM-R (97.57%), so never label 97.61% as the deployed model's score.
* Media for Web-RAG (suggested: a small architecture diagram), Grocery Tracker and NoorTime (phone screenshots), added through each record's `image` field.
* Web-RAG note "queries go to Ollama, not a cloud LLM", Grocery Tracker "integer money" and NoorTime "on-device": confirm before adding as metrics.
* LangChain (CV) vs LlamaIndex (Web-RAG code) is already documented in the repo README as intentional; no change needed.

---

## 11. Launch items (mostly configuration, not code)

1. **Indexing, `robots.txt`, sitemap and the Open Graph image are already handled by the repo's launch gate.** The live site blocks crawlers on purpose because the gate is not yet satisfied. Do **not** change `robots.txt` or the gate. To go live: set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin in Vercel's **Production** environment and deploy a production (not preview) build. The other four conditions (valid email and profile, a public paper, `public/cv.pdf`) already appear to pass per the repo README.
2. **Email links:** switch the email destination built from `src/lib/site.ts` from the Gmail web-compose URL to `mailto:` everywhere (nav, footer, contact station, CV), keeping its validation.
3. **Domain:** choose the final origin first (a renamed Vercel project such as `<name>.vercel.app`, or a custom domain), because item 1 depends on it.
4. Optional: an "Open to ML / NLP engineering roles" line in the home Identity station, sourced from `src/lib/site.ts`.

---

## 12. Prompts for the coding agent (one step per message)

Send these one at a time. Wait for each to finish and review its `compare/` screenshots before sending the next.

**Step 1**
> Read the repo's `README.md`, then `portfolio-redesign/README.md` fully. Look at every image in `portfolio-redesign/screenshots/`; those are the exact visual target. We will implement this redesign one step at a time in this Next.js 16 / Tailwind 4 / MDX project, keeping static export, the content model, the publishing gate and the launch checks exactly as they work today.
>
> Do only step 1 now: Tailwind `@theme` tokens, fonts, keyframes, Starfield, Nav and Footer in the root layout (README sections 5, 6 and 8). Then follow README section 2.4: build, run `compare.mjs`, compare the nav, footer, background grid and stars with the screenshots, and fix differences. Run `npm run lint` and `npm test`, commit, and summarize what you changed and any remaining differences.
>
> Rules for every step: all copy comes from `src/content/` and `src/lib/site.ts`; never add placeholder text or invented metrics; do not modify `robots.txt` logic or the launch gate; respect `prefers-reduced-motion`; do not copy `support.js` or `.dc.html` template code into the site.

**Step 2**
> Do step 2: schema additions from README section 9 (optional `metric`, `metricNote`, `tags`, `results`) with tests, and add the sourced metric values listed there. Lint, test, commit, summarize.

**Step 3**
> Do step 3: the home page. Match `01-home-hero--*.png`, all five `01-home-hero--station-0N.png` and `02-home-sections--*.png` (README 7.1, 7.2, 7.4, 7.6). Include the pause control for the auto-advancing hero and the mobile layout below 720 px. Follow README section 2.4 until the home screenshots match at both sizes. Lint, test, commit, summarize remaining differences.

**Step 4**
> Do step 4: `/projects`, `/research`, `/research/[slug]`, `/cv` and the 404 page, one page at a time, each matched against its screenshots at both sizes using README section 2.4. Lint, test, commit after each page.

**Step 5**
> Do step 5: switch email links to `mailto:` (README section 11, item 2). Then run the full section 2.4 check for every page and list anything that still differs from the screenshots.

---

## 13. Acceptance checklist

- [ ] Every `compare/` screenshot matches its `screenshots/` counterpart at 1440 px and 390 px; `compare.mjs` reports no horizontal overflow and no JavaScript errors.
- [ ] Starfield on every page; strong on home hero and 404, soft elsewhere; identical positions on every load.
- [ ] Hero auto-advances every 5s, pauses on hover/focus, has a pause button, and is static with reduced motion.
- [ ] Constellation lights the right nodes per station and edges draw in.
- [ ] Project filters and engineering notes work with keyboard only.
- [ ] Copy BibTeX works and announces the copied state.
- [ ] Cards reveal on scroll and are visible without JavaScript.
- [ ] No `href="#"` left; email uses `mailto:`.
- [ ] Publishing gate and launch checks unchanged; `npm run lint` and `npm test` pass.
- [ ] Lighthouse mobile: performance ≥ 90, accessibility ≥ 95.
