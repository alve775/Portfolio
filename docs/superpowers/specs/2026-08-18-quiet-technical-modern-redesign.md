# Quiet Technical Modern Redesign

## Objective

Redesign the portfolio so it reads as a confident contemporary research-and-engineering profile rather than a paper-themed template. Preserve the static-export architecture, content schemas, development-only draft visibility, production publishing gates, SEO readiness checks, and all owner-supplied wording.

The primary audience remains a professor or research scientist scanning for evidence of research taste, followed by a technical hiring manager looking for shipped systems.

## Visual direction

The design is **quiet technical modern**: an open light canvas, contemporary sans-serif typography, strong hierarchy, generous asymmetrical spacing, and precise structural details. It should feel closer to a carefully designed research lab profile than an academic journal or generic developer portfolio.

The one deliberate aesthetic risk is a vertical research index. Research records are arranged along a slim signal-colored rail and identified by meaningful domains such as language, security, and systems. The rail communicates the relationship between the owner's areas of work; it does not use decorative sequence numbers.

The interface must not use gradients, ornamental backgrounds, scroll effects, proficiency graphics, animated counters, or decorative badges. Motion is limited to purposeful hover and focus feedback and must respect reduced-motion preferences.

## Design system

### Color

- Canvas — `#F6F7F4`: quiet neutral page background.
- Surface — `#FFFFFF`: raised or focused content regions.
- Ink — `#141A17`: primary text with a slight green cast.
- Muted — `#5F6963`: secondary text and metadata.
- Line — `#D9DFDA`: dividers and low-emphasis boundaries.
- Signal — `#0D6B57`: research rail, links, and interactive emphasis.
- Signal soft — `#DCEDE7`: takeaway and selected-state background.

Dark mode will map the same roles to deep neutral-green surfaces while retaining accessible contrast. Color must never be the only indicator of status.

### Typography

- Display and body: Instrument Sans, self-hosted, with a system sans-serif fallback. The family is modern and human without the geometric stiffness of a startup landing page.
- Utility and metadata: the existing self-hosted Fira Mono, used sparingly for dates, venues, and compact labels.
- Bengali fallback: the existing self-hosted Noto Serif Bengali remains available only for Bengali glyph coverage.

Large type is reserved for the home thesis and page titles. Long research titles use a responsive mid-size scale and must wrap naturally. Body copy stays between 16 and 18 pixels with a readable line length.

### Layout

The site uses a wide but controlled shell, with a 12-column desktop grid that collapses to a single column on small screens. Pages gain more whitespace and fewer containers. Dividers establish alignment; boxes are used only when a bounded surface materially improves comprehension.

Desktop home structure:

```text
+------------------------------------------------------------------+
| Name                                  Research Projects CV Email  |
+------------------------------------------------------------------+
| RUET / Bangladesh     | I work where language, security, and      |
|                       | deployed systems meet.                    |
|                       | Short positioning and contact action.     |
+------------------------------------------------------------------+
| Selected research     | domain rail | title, takeaway, metadata  |
|                       | domain rail | title, takeaway, metadata  |
|                       | domain rail | title, takeaway, metadata  |
+------------------------------------------------------------------+
| Short profile         | Profile destinations / location          |
+------------------------------------------------------------------+
```

Mobile keeps the same reading order: identity, positioning, primary contact, research index, then profile information. Navigation wraps without horizontal overflow and every interactive target remains at least 44 pixels high.

## Page behavior

### Global shell

Replace the dark utility bar with a light, spacious header separated by a fine rule. The owner's name acts as the home link. Navigation uses clear sentence-case labels, and email is the final direct action when available. The footer becomes a restrained two-column closing block rather than a repeat of the header.

### Home

The hero is a thesis, not a giant name. It combines the existing positioning statement with the owner's research domains and a compact institutional marker. The existing bio remains unchanged but moves below selected work so proof appears earlier.

Selected research uses the vertical domain index. Each entry exposes its title, takeaway, status, venue, and year without a surrounding card. Draft entries remain visibly marked during development.

### Research index

Use the same research-index language as the home page, grouped by completed and in-progress status. Author order remains exact, and the owner's name remains visually identifiable without a yellow highlighter effect.

### Research detail

Retain the takeaway-first information hierarchy. The title and metadata occupy the opening grid; the takeaway becomes a calm signal-tinted panel. Abstract, links, BibTeX, and optional notes use a clean label-and-content grid with no card framing.

### Projects

Present projects as stacked case-study rows. Problem, approach, and result form a three-column desktop strip and a labelled mobile stack. Technology, status, repository, and live links remain explicit. Production still exposes at most five verified projects.

### Notes

Present notes as a compact chronological list with clear title, date, and summary. The header only links Notes when publishable notes exist in the current environment.

### CV

Use an editorial CV grid with a narrow section label and wider content column. Preserve the existing verified profile and education content. The PDF action appears only when `public/cv.pdf` exists.

## Component and code changes

- Rework global tokens, typography, shell sizing, focus states, responsive rules, and dark-mode mappings in `src/app/globals.css`.
- Update `SiteHeader`, `Nav`, `SiteFooter`, `PageHeader`, `ProfileLinks`, `RecordCard`, `PaperList`, and `Field` to express the new system.
- Restructure the home, projects, notes, CV, and research-detail page markup where the new hierarchy requires it.
- Keep content loading, validation, route generation, metadata, JSON-LD, readiness evaluation, robots, sitemap, and pruning behavior unchanged unless markup integration exposes a verified regression.
- Reuse the existing self-hosted Fira Mono and Bengali assets. Add and license the Instrument Sans font files locally; do not introduce runtime font requests.

## Content and publishing safety

No factual copy will be invented or rewritten. Unresolved owner data remains in the source files. Development may render draft entries with visible draft treatment, while production continues to omit incomplete entries and placeholder values.

The redesign must not make an in-progress thesis look published, expose unfinished social URLs, create links to removed dynamic routes, display a CV download without the PDF, or change the conditions that control indexing.

Empty production sections remain honest and concise. Visual polish must not disguise missing content as completed work.

## Accessibility and responsive requirements

- One `h1` per route and preserved semantic landmarks.
- Visible focus states with at least 3:1 focus-indicator contrast.
- Body text contrast of at least 4.5:1 in light and dark modes.
- Minimum 44-by-44-pixel interactive targets where practical.
- No horizontal scrolling at 320, 375, 768, or 1280 pixels.
- Content order remains logical without CSS.
- Reduced motion disables all nonessential transitions.
- Status is always represented with text, not color alone.

## Verification

After implementation:

1. Run unit and export tests, lint, production build, and `git diff --check`.
2. Verify that the production export contains no unresolved placeholder text and no draft detail routes.
3. Inspect home, research, projects, notes, CV, and one development draft detail page at desktop and mobile widths.
4. Check light and dark modes, keyboard order, visible focus, one `h1`, semantic landmarks, and horizontal overflow.
5. Confirm robots and sitemap remain blocked while launch-readiness requirements are incomplete.
6. Confirm no third-party font or asset requests occur at runtime.

## Acceptance criteria

The redesign is complete when the interface consistently expresses the quiet technical modern direction across all routes, the research index is the single memorable signature, desktop and mobile layouts feel intentionally composed, and all existing publishing and accessibility safeguards continue to pass.
