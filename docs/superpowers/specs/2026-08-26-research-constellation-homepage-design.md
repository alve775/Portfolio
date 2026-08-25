# Research Constellation Homepage Design

## Objective

Replace the current static homepage opening with an immersive, scroll-driven research journey that expresses the owner's work across low-resource Bangla NLP, biometric-model security, and deployment engineering. The experience must feel like travelling between research stations rather than watching content zoom toward the viewer.

The spatial experience is limited to the homepage. Research, project, note, CV, and record-detail routes retain the existing quiet technical editorial interface. Static export, content validation, publishing gates, metadata, robots, sitemap, and route pruning remain unchanged.

## Experience boundary

The homepage contains two consecutive modes:

1. A full-width dark spatial journey with five stations: Identity, Language, Security, Systems, and Contact.
2. The existing light editorial Selected Research and Profile sections.

The global header remains the site's route navigation. On the homepage it receives a dark, translucent treatment and stays visible while the spatial section is active. Research-station controls live inside the journey and do not replace the global Research, Projects, Notes, CV, or Email links.

The spatial section uses native document scrolling. It never prevents wheel, touch, keyboard, or scrollbar input. The scene is sticky while the surrounding section provides the scroll distance; after the final station, the document continues naturally into the editorial content.

## Chosen implementation

Use a custom Canvas 2D renderer with semantic HTML overlays and no new animation or 3D dependency.

This choice provides the required curved camera path and depth parallax while keeping the static-export build small and avoiding Three.js, React Three Fiber, WebGL compatibility concerns, and a second animation runtime. Canvas is decorative only; all meaningful content and controls remain HTML.

Rejected alternatives:

- Three.js or React Three Fiber would provide richer 3D primitives but add bundle weight, GPU complexity, and a larger failure surface than this homepage requires.
- CSS-only layers would be lighter but would not convincingly express a curved path through multiple research environments.

## Information architecture and copy

The five stations use only verified identity and research facts already present in `src/lib/site.ts`:

1. **Identity** — the owner's canonical name, RUET affiliation, Bangladesh location, and existing positioning sentence.
2. **Language** — low-resource Bangla NLP and the existing description of comparative work on monolingual and multilingual transformers for Bangla.
3. **Security** — the existing description of the undergraduate thesis on adversarial robustness in fingerprint presentation attack detection.
4. **Systems** — the existing statement that the owner builds and deploys inference systems that put the models in front of users.
5. **Contact** — the validated public email action when one exists.

Short station labels and navigation instructions may be newly written, but they must not introduce a publication claim, metric, venue, status, project outcome, URL, employer, or biographical fact. The canonical name and positioning remain sourced from `site.ts` rather than duplicated in components.

Selected Research continues to use `getPapers()` and the existing `PaperList`. Production therefore displays only publishable records. If none qualify, the existing honest empty state remains. The Profile section continues to display the owner-supplied biography unchanged.

## Interaction model

### Native scroll progression

The enhanced spatial section spans five viewport-height intervals. Its sticky viewport sits below the homepage header. Scroll progress is calculated from the section's real document position and usable scroll range:

```text
progress = clamp((scrollY - sectionTop) / (sectionHeight - viewportHeight), 0, 1)
stationProgress = progress * (stationCount - 1)
```

The integer portion identifies the current segment. The fractional portion is eased with a cubic ease-in-out curve and interpolates the camera between adjacent station coordinates.

The camera follows a curved path by interpolating x, y, and z while adding a small perpendicular arc within each segment. The scene moves; HTML copy never scales. Active copy stays at scale 1 and uses only a short horizontal translation and opacity crossfade.

### Station controls

The five station controls are native buttons with `aria-pressed`, `aria-controls`, visible focus, and at least a 44-pixel target. Activating one scrolls the document to that station's real position. Scrolling behavior is immediate under reduced motion and smooth otherwise.

Manual station changes may update a polite status line after arrival. Passive scrolling must not produce repeated live-region announcements.

### Visual language

The dark environment uses the existing ink-green and signal-green identity with a restrained cobalt coordinate accent. It does not use a literal galaxy, stock space imagery, astronaut imagery, neon cyberpunk, glassmorphism, or the reference site's blue-on-navy star-field treatment.

Spatial objects are tied to the research:

- Language: Bengali glyph fragments and token-like connections.
- Security: fingerprint-ridge arcs and restrained perturbation markers.
- Systems: inference nodes and deployment paths.
- Identity: a quiet origin signal.
- Contact: the three research paths converging into one channel.

Particles provide depth and orientation rather than decoration. The renderer caps device pixel ratio and particle count to keep the scene inexpensive.

## Component architecture

### `src/app/page.tsx`

Remains a server component. It loads publishable papers and passes serializable, verified station content to the client experience. It renders:

1. `ResearchFlight`
2. the existing Selected Research or honest empty state
3. the existing Profile section

### `src/components/home/ResearchFlight.tsx`

A focused client component responsible for:

- semantic station markup;
- native scroll-progress measurement;
- station-button behavior;
- active-station and enhancement state;
- reduced-motion detection;
- canvas-failure fallback;
- pausing work when the scene is outside the viewport.

It does not contain the drawing implementation.

### `src/components/home/ResearchFlightCanvas.tsx`

A decorative client canvas responsible for:

- resize-aware drawing;
- curved camera interpolation;
- depth projection;
- research-specific station objects;
- low-cost background particles;
- requestAnimationFrame lifecycle and cleanup.

It receives progress and station geometry as inputs. It exposes no navigation or content semantics.

### `src/components/home/flight-model.ts`

Contains shared station types, immutable coordinates, clamp/easing/interpolation helpers, and the deterministic camera-path calculation. Keeping the motion model separate makes the renderer and interaction layer independently understandable and testable.

### `src/components/home/research-flight.module.css`

Owns the isolated spatial layout, dark palette, sticky enhancement, station controls, semantic overlays, responsive behavior, and reduced-motion fallback. Existing global CSS changes are limited to the homepage-aware header treatment, full-bleed integration, and transition back to the editorial sections.

## Enhancement and fallback behavior

The server-rendered default is a readable static sequence of the five stations. Canvas and sticky spatial layout activate only after hydration confirms all required browser capabilities.

If JavaScript is unavailable, canvas context creation fails, observers are unavailable, or initialization throws, the component remains in the static sequence. Failure must never leave an empty fixed viewport or hide the station content.

For `prefers-reduced-motion: reduce`:

- the long scroll track and sticky behavior are disabled;
- the canvas is hidden;
- all five stations appear in normal document order;
- smooth scrolling, crossfades, and particle animation are disabled.

The canvas is `aria-hidden="true"`. Research meaning must not depend on canvas glyphs, color, or motion.

## Responsive behavior

Desktop and tablet use the sticky spatial journey. The content overlay occupies a controlled readable column while the active research object remains visible in the remaining scene.

Small screens retain the same native-scroll journey with compressed lateral camera movement and a bottom-aligned content block. Station controls become compact numbered controls while keeping accessible names. The design must not clip the header, controls, copy, or progress indicator at 320 and 375 pixels.

Text scaling to 200 percent must remain usable. When the spatial layout can no longer fit without overlap, CSS switches to the static sequence rather than shrinking text or introducing internal scrolling.

## Performance and lifecycle

- Add no runtime dependency.
- Cap canvas device pixel ratio at 1.5.
- Use a bounded particle set and reuse objects between frames.
- Use one requestAnimationFrame loop only while the scene intersects the viewport and motion is allowed.
- Use `ResizeObserver` and `IntersectionObserver` when available, with safe static fallback when they are not.
- Cancel animation frames, observers, timers, and event listeners on unmount.
- Avoid state updates for every animation frame; scroll progress is stored in refs and drawing occurs directly on canvas.
- Reserve the scene's dimensions before hydration to avoid layout shift.

## Accessibility

- Preserve one `h1` on the homepage.
- Preserve the global skip link, landmarks, and header navigation.
- Use native station buttons with visible focus and 44-by-44-pixel targets.
- Keep station order logical in the DOM.
- Keep meaningful text outside canvas.
- Do not rely on hover, color, or motion alone.
- Do not trap wheel, touch, keyboard, or focus input.
- Disable the enhanced journey for reduced motion and layout conditions that cannot safely contain it.
- Maintain at least 4.5:1 text contrast and at least 3:1 focus-indicator contrast.

## Publishing and routing safety

The redesign must not modify content schemas, record validation, `getPapers()`, `getNotes()`, route generation, production readiness, robots, sitemap, JSON-LD, canonical metadata, or empty-route pruning.

Station controls are homepage interactions, not new routes. Existing deep links remain unchanged. The public email action renders only through the existing validated email value. Incomplete profiles, records, URLs, and CV assets remain governed by their current gates.

## Verification strategy

Automated verification:

1. Add unit coverage for the deterministic camera-path helpers and station boundaries.
2. Extend presentation tests to assert the homepage flight structure, stable-scale copy, reduced-motion fallback, and absence of Three.js dependencies.
3. Run all unit tests, export tests, ESLint, production build, and `git diff --check`.
4. Confirm the production export still excludes drafts, placeholders, and removed dynamic routes.

Browser verification:

1. Inspect the homepage at 320, 375, 736, 1024, and 1440 pixels.
2. Verify native scroll entry, all five station transitions, station buttons, exit into Selected Research, and back navigation.
3. Verify keyboard order, visible focus, one `h1`, semantic landmarks, and no horizontal overflow.
4. Verify reduced motion, JavaScript-disabled/static fallback, 200-percent text scaling, and dark/light operating-system settings.
5. Check for runtime errors, hydration warnings, third-party requests, excessive animation work outside the viewport, and layout shift.
6. Recheck Research, Projects, Notes, CV, and one research detail route to confirm the editorial interface and publishing gates are unchanged.

## Acceptance criteria

The redesign is complete when:

- homepage scrolling feels like travelling along a curved research path rather than content zooming toward the viewer;
- Language, Security, and Systems are represented through research-specific spatial objects;
- HTML copy remains stable, readable, and factual;
- the scene degrades to a complete static sequence without motion or canvas;
- non-home routes retain their existing editorial behavior;
- static export, content safety, accessibility, responsive, and automated checks pass;
- no new animation or 3D dependency is introduced.
