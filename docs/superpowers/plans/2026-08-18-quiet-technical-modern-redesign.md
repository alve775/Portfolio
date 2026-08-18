# Quiet Technical Modern Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the current paper-themed interface with a coherent quiet-technical portfolio built around an accessible vertical research index.

**Architecture:** Keep the existing static Next.js content and publishing architecture intact. Change only self-hosted typography, design tokens, shared presentational components, and route markup; expose stable `data-*` hooks so the export suite can verify the intended information architecture without coupling tests to Tailwind utility strings.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, Tailwind CSS 4, `next/font/local`, filesystem MDX, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-18-quiet-technical-modern-redesign.md`

## Global Constraints

- Preserve `output: 'export'`, trailing-slash routes, static `generateStaticParams`, metadata, JSON-LD, robots, sitemap, and route pruning.
- Preserve every owner-supplied content value; do not invent or rewrite publication facts, metrics, links, profile information, or CV content.
- Keep development-only draft visibility and production publishability filtering unchanged.
- Use no gradients, ornamental backgrounds, scroll effects, counters, proficiency graphics, or runtime font requests.
- Keep one `h1` per route, sequential heading levels, visible keyboard focus, text contrast of at least 4.5:1, and 44-pixel interaction targets.
- Preserve exact paper author order and text status labels.
- The UI/UX Pro Max searches confirmed Minimalism/Swiss Style, a neutral surface system, subtle motion, 65–75-character line lengths, balanced headings with natural fallback, and Instrument Sans variable support. The returned generic landing-page and storytelling patterns were rejected because they conflict with the approved research-record information architecture.

---

### Task 1: Lock the presentation contract and self-hosted font foundation

**Files:**
- Create: `tests/unit/presentation.test.mjs`
- Create: `public/fonts/instrument-sans-variable.ttf`
- Create: `public/fonts/INSTRUMENT-SANS-LICENSE.txt`
- Modify: `src/lib/fonts.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: existing `fontVariables: string` imported by `src/app/layout.tsx`.
- Produces: `instrumentSans` from `src/lib/fonts.ts`, CSS variables `--font-sans`, `--canvas`, `--surface`, `--ink`, `--muted`, `--line`, `--signal`, and `--signal-soft`.

- [x] **Step 1: Write the failing presentation-foundation test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const fonts = await readFile('src/lib/fonts.ts', 'utf8');
const css = await readFile('src/app/globals.css', 'utf8');

test('uses the approved self-hosted quiet-technical foundation', () => {
  assert.match(fonts, /export const instrumentSans/);
  assert.match(fonts, /instrument-sans-variable\.ttf/);
  assert.doesNotMatch(fonts, /export const charis/);
  assert.match(css, /--canvas:\s*#f6f7f4/i);
  assert.match(css, /--signal:\s*#0d6b57/i);
  assert.match(css, /font-family:\s*var\(--font-sans\)/);
});
```

- [x] **Step 2: Run the unit test and verify the expected failure**

Run: `node --disable-warning=ExperimentalWarning --test tests/unit/presentation.test.mjs`

Expected: FAIL because `instrumentSans`, `instrument-sans-variable.ttf`, and the new tokens do not exist.

- [x] **Step 3: Add Instrument Sans and its license from the Google Fonts source**

Use the upstream OFL files from `google/fonts/ofl/instrumentsans`:

```bash
curl -L 'https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentsans/InstrumentSans%5Bwdth,wght%5D.ttf' -o public/fonts/instrument-sans-variable.ttf
curl -L 'https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentsans/OFL.txt' -o public/fonts/INSTRUMENT-SANS-LICENSE.txt
```

Verify both files are non-empty and the license begins with the SIL Open Font License heading.

- [x] **Step 4: Replace Charis with Instrument Sans in the font interface**

Implement this shape in `src/lib/fonts.ts` while keeping Fira Mono and the conditional Bengali font:

```ts
export const instrumentSans = localFont({
  src: '../../public/fonts/instrument-sans-variable.ttf',
  variable: '--font-instrument-sans',
  display: 'swap',
  weight: '400 700',
  style: 'normal',
  fallback: ['Inter', 'Avenir Next', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const fontVariables = `${instrumentSans.variable} ${firaMono.variable} ${notoSerifBengali.variable}`;
```

- [x] **Step 5: Establish the approved light and dark token mappings**

Replace the old paper/card/bar token group with the approved semantic roles. The light block must include:

```css
:root {
  --canvas: #f6f7f4;
  --surface: #ffffff;
  --ink: #141a17;
  --muted: #5f6963;
  --line: #d9dfda;
  --signal: #0d6b57;
  --signal-soft: #dcede7;
  --font-sans: var(--font-instrument-sans), var(--font-bengali), Inter,
    "Avenir Next", "Helvetica Neue", Arial, sans-serif;
}
```

Map dark mode to canvas `#0F1411`, surface `#151C18`, ink `#EEF3EF`, muted `#A7B1AA`, line `#2A342E`, signal `#73D5BB`, and signal-soft `#18362E`.

- [x] **Step 6: Run the presentation test and the existing unit suite**

Run: `node --disable-warning=ExperimentalWarning --test tests/unit/presentation.test.mjs`

Expected: PASS.

Run: `npm run test:unit`

Expected: all unit tests PASS.

### Task 2: Rebuild the global shell, home hero, and research index

**Files:**
- Modify: `tests/export.test.mjs`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/research/page.tsx`
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/Nav.tsx`
- Modify: `src/components/SiteFooter.tsx`
- Modify: `src/components/PageHeader.tsx`
- Modify: `src/components/ProfileLinks.tsx`
- Modify: `src/components/RecordCard.tsx`
- Modify: `src/components/PaperList.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `getPapers()`, `site`, `publicEmail`, `usableProfiles`, and existing `Entry<Paper>` records.
- Produces: root marker `data-design="quiet-technical"`, `data-home-hero`, `data-research-index`, and `data-research-entry` in exported HTML.

- [x] **Step 1: Add failing export assertions for the new information architecture**

Inside the fixture export test, after loading `rootHtml` and `researchHtml`, add:

```js
assert.match(rootHtml, /data-design="quiet-technical"/);
assert.match(rootHtml, /data-home-hero/);
assert.match(rootHtml, /data-research-index/);
assert.match(researchHtml, /data-research-index/);
assert.match(researchHtml, /data-research-entry/);
```

- [x] **Step 2: Run the fixture export test and verify the expected failure**

Run: `node --test --test-name-pattern="exports complete fixture" tests/export.test.mjs`

Expected: FAIL on the first missing `data-design` assertion.

- [x] **Step 3: Rebuild the shell and navigation**

Apply `data-design="quiet-technical"` to `<body>`. Replace the dark header with a light ruled header, sentence-case navigation, and an email action sourced from `publicEmail`. Keep `aria-current="page"` and use a visible signal-colored active marker. Ensure the navigation remains usable when Notes is omitted.

The shell must use a `72rem` maximum width, `1.25rem` mobile gutters, `2rem` tablet gutters, and `scroll-padding-top` so focused links cannot be obscured.

- [x] **Step 4: Recompose the home page around a thesis hero**

The opening markup must have `data-home-hero` and this semantic order:

```tsx
<section data-home-hero aria-labelledby="home-title">
  <p>{site.affiliationShort} · {site.location}</p>
  <h1 id="home-title">{site.name}</h1>
  <p>{site.positioning}</p>
  <ProfileLinks />
</section>
```

Use the existing text without rewriting it. Place selected research before the unchanged bio.

- [x] **Step 5: Convert record cards into the vertical research index**

`PaperList` owns `data-research-index`; each `RecordCard` becomes a borderless row with `data-research-entry`, a meaningful domain label derived only from verified record metadata, title, exact author order, takeaway, venue/year, and text status. Use a continuous signal rail on the list and one node per entry. Do not restore arbitrary sequence numbers.

If a precise domain cannot be derived without inventing a claim, label the rail node `Research` rather than guessing.

- [x] **Step 6: Complete the global CSS system**

Define these stable component classes and responsive behavior in `globals.css`:

```css
.site-shell { width: min(100% - 2.5rem, 72rem); margin-inline: auto; }
.hero-grid { display: grid; gap: 2rem; }
.research-index { position: relative; }
.research-entry { position: relative; border-top: 1px solid var(--line); }
.research-entry::before { content: ""; position: absolute; border-radius: 999px; }
```

At `48rem`, use the approved asymmetrical grid. Keep body line length at `68ch`, title wrapping natural with `text-wrap: balance`, and transitions between 160–220ms. Under reduced motion, reduce transition duration to `0.01ms`.

- [x] **Step 7: Run the export test and unit suite**

Run: `npm run test:unit`

Expected: PASS.

Run: `npm run test:export`

Expected: all export tests PASS, including the new structural assertions.

### Task 3: Recompose research details and supporting routes

**Files:**
- Modify: `tests/export.test.mjs`
- Modify: `src/app/research/[slug]/page.tsx`
- Modify: `src/app/projects/page.tsx`
- Modify: `src/app/notes/page.tsx`
- Modify: `src/app/notes/[slug]/page.tsx`
- Modify: `src/app/cv/page.tsx`
- Modify: `src/components/Field.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: unchanged paper, project, note, CV, metadata, and publishability interfaces.
- Produces: `data-research-detail`, `data-project-index`, `data-note-index`, and `data-cv-grid` hooks in fixture or base-route exports.

- [x] **Step 1: Add failing route-structure assertions**

In the fixture export test add:

```js
assert.match(paperHtml, /data-research-detail/);
assert.match(projectHtml, /data-project-index/);
assert.match(notesHtml, /data-note-index/);
```

Load `cv/index.html` and assert:

```js
assert.match(cvHtml, /data-cv-grid/);
```

- [x] **Step 2: Run the fixture export test and verify the expected failure**

Run: `node --test --test-name-pattern="exports complete fixture" tests/export.test.mjs`

Expected: FAIL on the missing `data-research-detail` assertion.

- [x] **Step 3: Recompose the research detail page**

Add `data-research-detail` to the article. Keep the title, exact authors, text status, venue/year, and takeaway in the opening grid. Keep the takeaway before the abstract. Render abstract, links, BibTeX, and optional notes through the existing `Field` API with a clean narrow-label/wide-content grid. Preserve every metadata export and MDX rendering branch.

- [x] **Step 4: Recompose projects as case-study rows**

Wrap the verified project list with `data-project-index`. Each row must keep title, problem, approach, result, stack, status, repository, and optional live link. At desktop widths, problem/approach/result form three equal columns; below `48rem`, they stack with visible labels.

- [x] **Step 5: Recompose notes and CV**

Add `data-note-index` to the notes list or empty-state container. Keep notes reverse chronological. Add `data-cv-grid` to the CV content grid and preserve the conditional PDF link exactly as controlled by `hasCvPdf()`.

- [x] **Step 6: Run all automated tests**

Run: `npm test`

Expected: unit and export suites PASS; fixture routes still render author metadata in exact order.

### Task 4: Visual and accessibility QA

**Files:**
- Modify as required by observed defects: `src/app/globals.css` and the route/component file responsible for the defect.

**Interfaces:**
- Consumes: the completed static export and local development server.
- Produces: verified responsive, keyboard-accessible light and dark interfaces with no runtime third-party assets.

- [x] **Step 1: Start the development server with draft content visible**

Run: `npm run dev`

Inspect `/`, `/research/`, `/research/bangla-sentence-type-classification/`, `/projects/`, `/notes/`, and `/cv/`.

- [x] **Step 2: Capture desktop and mobile screenshots**

Capture the home page and research detail at `1440×1000` and `375×812`. Inspect typography, whitespace, vertical-rail continuity, title wrapping, status distinction, and whether the single signature element dominates appropriately.

- [x] **Step 3: Verify responsive and accessibility behavior**

At `320`, `375`, `768`, and `1280` CSS pixels, verify `document.documentElement.scrollWidth === document.documentElement.clientWidth`. Verify one `h1`, semantic header/nav/main/footer, keyboard order, visible focus, 44-pixel link targets, and no focus obscured by the header.

Emulate `prefers-color-scheme: dark` and `prefers-reduced-motion: reduce`; confirm readable contrast and effectively disabled transitions.

- [x] **Step 4: Verify runtime resource discipline**

Confirm font and CSS requests are same-origin and that Latin-only pages do not request the Bengali font. Confirm there are no Google Fonts, analytics, or other third-party requests.

- [x] **Step 5: Fix each observed defect and repeat its exact check**

For a behavioral defect, add a failing automated assertion before the fix. For a purely visual defect, record the failing viewport and computed-style observation, apply the smallest CSS correction, and capture the same viewport again.

### Task 5: Final verification and handoff

**Files:**
- Verify only; no planned source changes.

**Interfaces:**
- Consumes: completed implementation.
- Produces: fresh evidence for every completion claim.

- [x] **Step 1: Run the complete verification suite**

Run:

```bash
npm run test:unit
npm run lint
npm test
git diff --check
```

Expected: every command exits `0` with no test, lint, build, or whitespace errors.

- [x] **Step 2: Verify production safety directly**

Search `out/` for unresolved markers and confirm there are no draft detail routes. Read `out/robots.txt` and `out/sitemap.xml`; while launch inputs remain incomplete, robots must disallow `/` and the sitemap must contain no `<url>` element.

- [x] **Step 3: Review the final diff against the design specification**

Confirm every modified file belongs to presentation, tests, or local font assets. Confirm content schemas, content records, publishing logic, readiness logic, SEO generation, and static-export configuration are unchanged.

- [x] **Step 4: Commit the implementation checkpoint**

```bash
git add src public/fonts tests docs/superpowers/plans/2026-08-18-quiet-technical-modern-redesign.md
git commit -m "feat: redesign portfolio interface"
```
