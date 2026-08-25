# Research Constellation Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a homepage-only, scroll-driven research journey that feels like travelling between five research stations while preserving readable HTML, the existing editorial routes, and static-export safety.

**Architecture:** Keep `src/app/page.tsx` as the server-owned content boundary and pass five serializable station records into a focused client experience. A pure TypeScript motion model calculates scroll and camera geometry, `ResearchFlight` owns progressive enhancement and semantic interaction, and `ResearchFlightCanvas` renders only decorative research-specific spatial objects. The unenhanced server render is the complete static fallback.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Canvas 2D, Node test runner, existing static-export scripts.

**Spec:** `docs/superpowers/specs/2026-08-26-research-constellation-homepage-design.md`

## Global Constraints

- Limit the spatial experience to the homepage; Research, Projects, Notes, CV, and record-detail routes keep the current editorial presentation.
- Add no runtime dependency and do not import Three.js, React Three Fiber, GSAP, or another animation runtime.
- Use native document scrolling; never intercept wheel, touch, keyboard, or scrollbar input.
- Keep all meaningful content and controls in semantic HTML; the canvas is decorative and `aria-hidden="true"`.
- Preserve exactly one homepage `h1`, the global skip link, landmarks, navigation, publishing gates, static route pruning, metadata, robots, sitemap, and JSON-LD.
- Source the canonical name, positioning, biography, affiliation, location, and validated email from `src/lib/site.ts`; do not invent research claims, metrics, URLs, employers, venues, or outcomes.
- Render the existing publishable `PaperList` and honest empty state without changing `getPapers()`.
- Cap canvas device pixel ratio at `1.5`, use a bounded particle set, and animate only while the journey intersects the viewport and motion is allowed.
- Under reduced motion or failed enhancement, hide canvas, disable sticky/long-scroll behavior, show all stations in document order, and use immediate scrolling.
- Verify responsive behavior at 320, 375, 736, 1024, and 1440 pixels and preserve usability at 200-percent text scaling.

---

### Task 1: Deterministic flight model

**Files:**
- Create: `src/components/home/flight-model.ts`
- Create: `tests/unit/flight-model.test.mjs`

**Interfaces:**
- Consumes: numeric scroll geometry and the immutable `FLIGHT_GEOMETRY` station list.
- Produces: `FlightStationContent`, `FlightStationGeometry`, `FlightFrame`, `clamp01(value)`, `easeInOutCubic(value)`, `getScrollProgress(input)`, `getStationScrollTop(input)`, and `sampleFlightPath(stationProgress, lateralScale?)`.

- [ ] **Step 1: Write the failing pure-model tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FLIGHT_GEOMETRY,
  clamp01,
  easeInOutCubic,
  getScrollProgress,
  getStationScrollTop,
  sampleFlightPath,
} from '../../src/components/home/flight-model.ts';

test('clamps scroll progress to the usable sticky range', () => {
  const input = { sectionTop: 400, sectionHeight: 5000, viewportHeight: 1000 };
  assert.equal(getScrollProgress({ ...input, scrollY: 0 }), 0);
  assert.equal(getScrollProgress({ ...input, scrollY: 2400 }), 0.5);
  assert.equal(getScrollProgress({ ...input, scrollY: 6000 }), 1);
  assert.equal(getScrollProgress({ ...input, sectionHeight: 1000, scrollY: 900 }), 0);
});

test('maps station buttons to real document positions', () => {
  const input = { sectionTop: 400, sectionHeight: 5000, viewportHeight: 1000 };
  assert.equal(getStationScrollTop({ ...input, stationIndex: 0, stationCount: 5 }), 400);
  assert.equal(getStationScrollTop({ ...input, stationIndex: 2, stationCount: 5 }), 2400);
  assert.equal(getStationScrollTop({ ...input, stationIndex: 4, stationCount: 5 }), 4400);
});

test('uses stable cubic easing and five immutable station coordinates', () => {
  assert.equal(FLIGHT_GEOMETRY.length, 5);
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(1), 1);
});

test('samples station boundaries exactly and adds a curved lateral arc between them', () => {
  const start = sampleFlightPath(0);
  const boundary = sampleFlightPath(1);
  const midpoint = sampleFlightPath(0.5);
  assert.deepEqual(start.camera, FLIGHT_GEOMETRY[0].camera);
  assert.deepEqual(boundary.camera, FLIGHT_GEOMETRY[1].camera);
  assert.equal(start.activeIndex, 0);
  assert.equal(boundary.activeIndex, 1);
  assert.notEqual(midpoint.camera.x, (start.camera.x + boundary.camera.x) / 2);
});
```

- [ ] **Step 2: Run the test and confirm the module is missing**

Run: `node --disable-warning=ExperimentalWarning --test tests/unit/flight-model.test.mjs`

Expected: FAIL because `src/components/home/flight-model.ts` does not exist.

- [ ] **Step 3: Implement the typed geometry and pure helpers**

Use these exact public shapes and geometry. `sampleFlightPath` must clamp progress to `0..4`, ease the local segment, interpolate x/y/z, and add `sin(pi * localProgress)` along the segment perpendicular so the boundary coordinates remain exact.

```ts
export type FlightStationId = 'identity' | 'language' | 'security' | 'systems' | 'contact';
export type FlightVisual = 'origin' | 'language' | 'security' | 'systems' | 'contact';
export type FlightPoint = Readonly<{ x: number; y: number; z: number }>;

export type FlightStationContent = Readonly<{
  id: FlightStationId;
  label: string;
  marker: string;
  title: string;
  body: string;
  meta?: string;
  action?: Readonly<{ label: string; href: string }>;
}>;

export type FlightStationGeometry = Readonly<{
  id: FlightStationId;
  visual: FlightVisual;
  anchor: FlightPoint;
  camera: FlightPoint;
}>;

export type FlightFrame = Readonly<{
  activeIndex: number;
  segmentIndex: number;
  localProgress: number;
  camera: FlightPoint;
}>;

export const FLIGHT_GEOMETRY = [
  { id: 'identity', visual: 'origin', anchor: { x: 0, y: 0, z: 0 }, camera: { x: 0, y: 0, z: 44 } },
  { id: 'language', visual: 'language', anchor: { x: -18, y: -4, z: -72 }, camera: { x: -18, y: -4, z: -28 } },
  { id: 'security', visual: 'security', anchor: { x: 15, y: 7, z: -144 }, camera: { x: 15, y: 7, z: -100 } },
  { id: 'systems', visual: 'systems', anchor: { x: -12, y: -8, z: -216 }, camera: { x: -12, y: -8, z: -172 } },
  { id: 'contact', visual: 'contact', anchor: { x: 8, y: 0, z: -288 }, camera: { x: 8, y: 0, z: -244 } },
] as const satisfies readonly FlightStationGeometry[];
```

For scroll helpers, use `usableRange = Math.max(sectionHeight - viewportHeight, 0)`, return zero when the usable range is zero, normalize station indices by `Math.max(stationCount - 1, 1)`, and round only the `activeIndex`.

- [ ] **Step 4: Run the focused and complete unit suites**

Run: `node --disable-warning=ExperimentalWarning --test tests/unit/flight-model.test.mjs`

Expected: 4 passing tests.

Run: `npm run test:unit`

Expected: all unit tests pass.

- [ ] **Step 5: Commit the pure motion model**

```bash
git add src/components/home/flight-model.ts tests/unit/flight-model.test.mjs
git commit -m "feat: add research flight motion model"
```

---

### Task 2: Semantic journey controller and decorative canvas

**Files:**
- Create: `src/components/home/ResearchFlight.tsx`
- Create: `src/components/home/ResearchFlightCanvas.tsx`
- Modify: `tests/unit/presentation.test.mjs`

**Interfaces:**
- Consumes: `readonly FlightStationContent[]`, `FLIGHT_GEOMETRY`, `getScrollProgress`, `getStationScrollTop`, and `sampleFlightPath` from Task 1.
- Produces: `ResearchFlight({ stations })`, a static-first semantic section with `data-research-flight`, and `ResearchFlightCanvas({ progressRef, enabled, visible, lateralScale, onReady, onFailure })`.

- [ ] **Step 1: Extend presentation tests before adding components**

Read `src/components/home/ResearchFlight.tsx`, `src/components/home/ResearchFlightCanvas.tsx`, and the CSS module as strings. Assert that the controller is a client component, renders `data-research-flight`, maps native `<button>` elements with `aria-pressed` and `aria-controls`, and does not call `preventDefault`. Assert that the canvas has `aria-hidden="true"`, caps DPR with `Math.min(window.devicePixelRatio || 1, 1.5)`, uses both observers, cancels animation frames, and imports no forbidden 3D or animation package.

```js
assert.match(flight, /^'use client';/);
assert.match(flight, /data-research-flight/);
assert.match(flight, /aria-pressed=/);
assert.match(flight, /aria-controls=/);
assert.doesNotMatch(flight, /preventDefault\(/);
assert.match(canvas, /aria-hidden="true"/);
assert.match(canvas, /Math\.min\(window\.devicePixelRatio \|\| 1, 1\.5\)/);
assert.match(canvas, /ResizeObserver/);
assert.match(flight, /IntersectionObserver/);
assert.match(canvas, /cancelAnimationFrame/);
assert.doesNotMatch(`${flight}\n${canvas}`, /three|@react-three|gsap/i);
```

- [ ] **Step 2: Run the presentation test and confirm the component files are missing**

Run: `node --test tests/unit/presentation.test.mjs`

Expected: FAIL while reading the missing Research Flight component files.

- [ ] **Step 3: Implement `ResearchFlight` as static-first progressive enhancement**

The public entry point is:

```ts
type ResearchFlightProps = Readonly<{
  stations: readonly FlightStationContent[];
}>;

export function ResearchFlight({ stations }: ResearchFlightProps): React.JSX.Element;
```

Initialize `enhanced` and `reducedMotion` so the server render remains the static sequence. In an effect, require `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `requestAnimationFrame`, and a canvas context before enhancement. Observe the journey, maintain `visible`, set or remove `document.body.dataset.flightActive`, and remove the body attribute on cleanup.

Use one passive scroll listener and one passive resize listener. Schedule measurement through one requestAnimationFrame, write continuous progress to `progressRef.current`, and call `setActiveIndex` only when `Math.round(progress * (stations.length - 1))` changes. Measure using `section.getBoundingClientRect().top + window.scrollY`, `section.offsetHeight`, and `window.innerHeight`.

Each station remains in DOM order and uses this semantic pattern:

```tsx
<article
  id={`flight-station-${station.id}`}
  className={styles.station}
  data-active={activeIndex === index ? 'true' : 'false'}
  aria-hidden={enhanced && activeIndex !== index ? true : undefined}
>
  <p className={styles.marker}>{station.marker} / {station.label}</p>
  {index === 0 ? <h1 id="home-title">{station.title}</h1> : <h2>{station.title}</h2>}
  {station.meta ? <p className={styles.meta}>{station.meta}</p> : null}
  <p className={styles.body}>{station.body}</p>
  {station.action ? <a href={station.action.href}>{station.action.label}<span aria-hidden="true"> ↗</span></a> : null}
</article>
```

Station buttons call `getStationScrollTop` and `window.scrollTo`. Use `behavior: reducedMotion ? 'auto' : 'smooth'` when enhanced; in the static fallback call the article's `scrollIntoView({ behavior: 'auto', block: 'start' })`.

- [ ] **Step 4: Implement `ResearchFlightCanvas` with bounded, research-specific drawing**

Use a `canvasRef`, a deterministic 72-particle array created once, `ResizeObserver` for backing-store size, and one animation loop gated by `enabled && visible`. Project a world point with `depth = camera.z - point.z`, reject depth outside `2..380`, and use `focalLength = Math.min(width, height) * 1.05`.

The draw order is: solid ink-green background, quiet coordinate grid, projected flight path, bounded particles, then five research objects. The five object functions are `drawOrigin`, `drawLanguage`, `drawSecurity`, `drawSystems`, and `drawContact`; they render respectively concentric origin rings, Bengali glyph fragments joined by token lines, fingerprint-ridge arcs with perturbation crosses, inference nodes with deployment paths, and three paths converging at one contact node. Canvas text is decorative and never substitutes for HTML copy.

Size the backing store using:

```ts
const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
canvas.width = Math.max(1, Math.round(rect.width * dpr));
canvas.height = Math.max(1, Math.round(rect.height * dpr));
context.setTransform(dpr, 0, 0, dpr, 0, 0);
```

On every cleanup, disconnect `ResizeObserver` and call `cancelAnimationFrame(frameId)`. Call `onReady()` only after a valid context and first successful draw; catch initialization/drawing errors, cancel work, and call `onFailure()` so the controller remains static.

- [ ] **Step 5: Run unit tests and lint**

Run: `npm run test:unit`

Expected: all model, presentation, content, and validation unit tests pass.

Run: `npm run lint`

Expected: zero ESLint errors.

- [ ] **Step 6: Commit the client experience**

```bash
git add src/components/home/ResearchFlight.tsx src/components/home/ResearchFlightCanvas.tsx tests/unit/presentation.test.mjs
git commit -m "feat: add semantic research flight experience"
```

---

### Task 3: Homepage content, isolated styling, and global integration

**Files:**
- Create: `src/components/home/research-flight.module.css`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/export.test.mjs`
- Modify: `tests/unit/presentation.test.mjs`

**Interfaces:**
- Consumes: `ResearchFlight`, `FlightStationContent`, `site`, `publicEmail`, `getPapers()`, and existing `PaperList`.
- Produces: five factual station records, a full-bleed dark journey, a sticky home header while the journey intersects, and the unchanged light Selected Research/Profile continuation.

- [ ] **Step 1: Replace obsolete hero assertions with flight integration assertions**

Assert that `page.tsx` imports `ResearchFlight`, creates exactly five station ids in order, sources identity strings from `site`, passes `stations`, retains `getPapers().slice(0, 3)`, retains `PaperList`, and preserves the honest empty-state sentence. In the export test, replace the `data-home-hero` assertion with `data-research-flight`, `flight-station-identity`, and `flight-station-contact`, while retaining the one-`h1` and safe-content checks.

- [ ] **Step 2: Run focused tests and confirm they fail against the old homepage**

Run: `node --test tests/unit/presentation.test.mjs`

Expected: FAIL because `page.tsx` still renders `home-hero`.

- [ ] **Step 3: Build the five station records in the server page**

Use `satisfies readonly FlightStationContent[]` and this content boundary:

```ts
const stations = [
  {
    id: 'identity',
    label: 'Identity',
    marker: 'Station 01',
    title: site.name,
    meta: `${site.affiliation} · ${site.location}`,
    body: site.positioning,
  },
  {
    id: 'language',
    label: 'Language',
    marker: 'Station 02',
    title: 'Language systems for Bangla',
    body: 'Comparative work on monolingual and multilingual transformers for Bangla.',
  },
  {
    id: 'security',
    label: 'Security',
    marker: 'Station 03',
    title: 'Security under perturbation',
    body: 'An undergraduate thesis on adversarial robustness in fingerprint presentation attack detection.',
  },
  {
    id: 'systems',
    label: 'Systems',
    marker: 'Station 04',
    title: 'Models in front of users',
    body: 'Alongside research he builds and deploys the inference systems that put these models in front of users.',
  },
  {
    id: 'contact',
    label: 'Contact',
    marker: 'Station 05',
    title: 'Continue the conversation',
    body: 'For research, engineering, and collaboration.',
    ...(publicEmail ? { action: { label: publicEmail, href: `mailto:${publicEmail}` } } : {}),
  },
] satisfies readonly FlightStationContent[];
```

Render `<ResearchFlight stations={stations} />`, then wrap the existing publishable Selected Research/empty-state branch and Profile section in `<div className="home-editorial">`.

- [ ] **Step 4: Add isolated static, enhanced, responsive, and reduced-motion CSS**

The CSS module must define a complete readable static `.root` with dark ink-green background, five normal-flow `.station` cards, high-contrast type, and 44-pixel controls. Only `[data-enhanced="true"]` activates a `500svh` track, sticky viewport below `--flight-header-height`, absolute station overlays, stable `scale: 1`, and opacity plus short x-translation transitions. Active copy uses `[data-active="true"]`; inactive copy cannot receive pointer events.

Desktop uses a left control rail and a readable content column no wider than `42rem`. At `max-width: 47.99rem`, controls become a bottom row and content aligns above them. At `max-height: 42rem`, `max-width: 22rem`, and `prefers-reduced-motion: reduce`, force the static sequence, hide canvas, and show every station without opacity or absolute positioning.

In `globals.css`, add only these homepage integration concerns:

```css
body:has([data-research-flight]) .main-content { padding-top: 0; }
body:has([data-research-flight]) .site-header { position: sticky; top: 0; z-index: 40; }
body[data-flight-active="true"] .site-header {
  border-color: rgb(190 255 229 / 14%);
  background: rgb(6 18 14 / 88%);
  color: #effbf5;
  backdrop-filter: blur(14px);
}
.home-editorial { padding-top: clamp(1rem, 3vw, 2rem); }
```

Also override muted navigation and contact colors under `body[data-flight-active="true"]`, and restore existing variables after the journey by limiting every override to the body attribute.

- [ ] **Step 5: Run unit, lint, and static-export verification**

Run: `npm run test:unit`

Expected: all unit tests pass.

Run: `npm run lint`

Expected: zero ESLint errors.

Run: `npm run build`

Expected: Next.js static export succeeds and the pruning script completes.

Run: `node --test --test-concurrency=1 tests/export.test.mjs`

Expected: all export assertions pass, including homepage flight structure and exclusion of incomplete content/routes.

- [ ] **Step 6: Commit the integrated homepage**

```bash
git add src/app/page.tsx src/app/globals.css src/components/home/research-flight.module.css tests/unit/presentation.test.mjs tests/export.test.mjs
git commit -m "feat: launch research constellation homepage"
```

---

### Task 4: Browser, accessibility, and lifecycle verification

**Files:**
- Modify if a defect is found: `src/components/home/ResearchFlight.tsx`
- Modify if a defect is found: `src/components/home/ResearchFlightCanvas.tsx`
- Modify if a defect is found: `src/components/home/research-flight.module.css`
- Modify if a defect is found: `src/app/globals.css`

**Interfaces:**
- Consumes: production `out/` from Task 3.
- Produces: verified responsive screenshots and evidence that native scroll, fallbacks, routes, and lifecycle behavior satisfy the design spec.

- [ ] **Step 1: Run the full automated gate from a clean production export**

Run: `npm test`

Expected: all unit and export tests pass after a fresh production build.

Run: `npm run lint`

Expected: zero ESLint errors.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 2: Serve the static export locally**

Run: `python3 -m http.server 4173 --directory out --bind 127.0.0.1`

Expected: the server responds on `http://127.0.0.1:4173/`.

- [ ] **Step 3: Verify desktop and tablet journey behavior**

At 1440, 1024, and 736 pixels, inspect the top, each of the five station positions, and the transition into Selected Research. Confirm the camera follows a lateral curved path, copy never scales, controls move to real scroll positions, native wheel/keyboard scrolling works, the header is dark only while the journey intersects, and no console or hydration error appears.

- [ ] **Step 4: Verify narrow layouts and accessibility**

At 375 and 320 pixels, confirm no horizontal overflow, no clipped header/control/copy, all interactive targets are at least 44 by 44 pixels, and station controls retain accessible names. Check Tab/Shift+Tab order, visible focus, exactly one `h1`, semantic header/nav/main/footer, working skip link, and readable contrast.

- [ ] **Step 5: Verify fallbacks and route isolation**

Emulate `prefers-reduced-motion: reduce` and confirm all five stations appear in normal flow with no canvas, sticky track, crossfade, or smooth scroll. Disable JavaScript and confirm the same complete static station sequence renders. At 200-percent text scaling, confirm CSS selects the static layout when the enhanced viewport cannot fit. Recheck `/research/`, `/projects/`, `/notes/` when published, `/cv/`, and one available research detail route to confirm their editorial layout and publishing gates did not change.

- [ ] **Step 6: Inspect runtime work and network boundaries**

While the flight is outside the viewport, confirm its requestAnimationFrame loop is cancelled. Confirm no third-party request, Three.js bundle, layout shift, or repeated live-region announcement occurs. Confirm canvas DPR never exceeds `1.5` and the DOM retains all meaningful station copy.

- [ ] **Step 7: Correct verified defects, rerun affected checks, and commit**

For each concrete defect, first add or tighten the smallest regression assertion, reproduce the failure, patch the responsible focused file, and rerun the focused check followed by `npm test`, `npm run lint`, and `git diff --check`.

```bash
git add src tests
git commit -m "fix: harden research flight experience"
```

If browser verification finds no defect, do not create an empty commit.
