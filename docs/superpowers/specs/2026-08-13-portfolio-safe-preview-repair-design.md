# Portfolio Safe-Preview Repair Design

**Status:** Approved in chat on 2026-08-13

## Context

The current Next.js export builds and lints successfully, but it exports only the home page and the framework not-found page. The rendered home page links to research, project, note, CV, and paper routes that do not exist. It also exposes unresolved placeholder markers in visible copy and structured metadata, and uses an invalid placeholder origin for canonical and Open Graph URLs.

The missing publication facts, profile URLs, public email address, production origin, and CV PDF cannot be inferred safely. The repair must therefore complete the application architecture without fabricating owner-supplied facts.

## Goals

- Export working `/research/`, `/projects/`, `/notes/`, and `/cv/` pages.
- Implement reusable dynamic paper and note routes for publishable content.
- Ensure every user-visible internal link resolves in the static export.
- Keep draft or placeholder-bearing entries out of rendered lists, navigation data, static parameters, metadata, and the sitemap.
- Keep preview builds non-indexable until the minimum launch-readiness checks pass.
- Emit structured metadata only from valid values.
- Add an automated export verifier that catches the failures found in the audit.
- Preserve the current typography, record-grid layout, accessibility treatment, and verified wording.
- Document the actual content and deployment workflow in the README.

## Non-goals

- Inventing or researching missing paper titles, authors, abstracts, metrics, links, affiliations, or contact details.
- Generating a substitute CV PDF.
- Redesigning the visual system.
- Adding a CMS, API, database, analytics, contact form, or runtime server.
- Deploying the site.

## Chosen Approach

Complete the static site architecture now and place a single publishability boundary between raw MDX files and public routes. This is preferred over hiding the unfinished architecture because the routes and metadata would remain untested, and over rendering placeholders because that would publish misleading content.

The static export remains the source of truth for release readiness. A build may succeed in preview mode, but the export verifier must reject missing base routes, broken links, leaked placeholder markers, invalid placeholder origins, missing SEO artifacts, server-function output, or active middleware matchers.

## Architecture

### 1. Site configuration and launch readiness

The production origin comes from `NEXT_PUBLIC_SITE_URL`; it is no longer hardcoded. A missing value means preview mode. A present value must be an absolute HTTPS URL with a public hostname or the build fails with a descriptive configuration error.

Site identity remains centralized in `src/lib/site.ts`. Helper functions expose only usable email and profile URLs. Placeholder-bearing or malformed values are omitted from rendered links and JSON-LD.

The site becomes indexable only when all of the following are true:

1. The production origin is valid.
2. The public email and all five required profile URLs are valid.
3. At least one paper passes the publishability gate.
4. `public/cv.pdf` exists.

Before that point, pages emit `noindex, nofollow`, `robots.txt` disallows crawling, and the sitemap contains no public URLs. Valid canonical and Open Graph URLs may be emitted when a valid origin exists, but they do not override the preview indexing block.

### 2. Publishability boundary

All three content schemas gain an explicit `draft` boolean. An entry is public only when `draft` is `false` and all fields used by its public view are free of unresolved placeholder markers.

- Papers require complete frontmatter. Their optional long-form MDX body is rendered only when non-empty and placeholder-free; an unfinished optional body does not hide otherwise complete paper metadata.
- Projects require complete frontmatter. Their MDX body remains unused because projects have no detail route.
- Notes require complete frontmatter and a non-empty, placeholder-free MDX body because the body is the note detail page.

The sample paper, project, and note files are explicitly marked as drafts. Public collection functions return only publishable entries and preserve their existing sort rules. Dynamic lookups use the same filtered collections, so an unfinished slug cannot be exported accidentally.

### 3. Routes and UI behavior

All pages use the existing record-grid components and type system.

- `/`: renders the verified identity copy, usable profile links, and up to three publishable paper proof points. The unresolved lab-affiliation sentence is withheld; the surrounding supplied sentences remain unchanged.
- `/research/`: groups public papers by finished work and in-progress work. If none are public, it renders a short factual empty state.
- `/research/[slug]/`: exports one page per public paper with title, authors in source order, status, venue when appropriate, abstract, takeaway, optional links, optional BibTeX, and safe optional MDX notes. Missing or private slugs resolve through `notFound()`.
- `/projects/`: renders at most the first five public projects by order with problem, approach, result, stack, status, and usable links. An empty collection gets a factual empty state.
- `/notes/`: renders public notes newest first. The header continues to omit the Notes link when this collection is empty.
- `/notes/[slug]/`: exports public note bodies through the MDX RSC renderer and uses `notFound()` for missing or private slugs.
- `/cv/`: renders a minimal semantic HTML CV from already verified identity, education, and research-positioning data. The PDF download appears only when `public/cv.pdf` exists.

The Research, Projects, and CV section links remain in the header because their base pages now exist and provide honest states. Individual incomplete entries never appear. The Notes section remains content-dependent as required by the original brief.

`ProfileLinks` renders only validated destinations and returns no list when none are available. It never turns a placeholder marker into an `href`.

### 4. Metadata and discoverability

Root metadata derives its indexing policy from launch readiness and conditionally includes origin-dependent values. Each index route provides a unique title and description. Dynamic paper and note routes implement `generateMetadata`, and paper routes emit Google Scholar citation fields from verified frontmatter only.

The Person JSON-LD object always contains the verified name and university affiliation. `url`, `email`, and `sameAs` are added only when their values validate; empty or placeholder-bearing fields are absent rather than serialized.

`app/sitemap.ts` generates base and dynamic URLs from the configured origin and public collections when launch-ready. `app/robots.ts` allows crawling and references the sitemap only when launch-ready; otherwise it disallows all paths. `app/opengraph-image.tsx` statically renders the verified name and positioning sentence with `next/og`.

### 5. Error handling

- Zod continues to fail the build with the offending content filename when frontmatter is malformed.
- A configured but invalid production origin fails the build rather than silently producing invalid canonical URLs.
- Draft or incomplete content is withheld safely instead of failing preview builds.
- Dynamic routes call `notFound()` for any slug not returned by the public collection.
- A missing CV PDF removes only the download action and keeps the HTML CV route usable.

### 6. Automated testing

Testing uses Node's built-in test runner and the real static export, with no new test dependency.

The first regression test builds the current application and must fail against the audited state. After implementation, it verifies:

- required base route HTML files exist;
- `robots.txt`, `sitemap.xml`, and the Open Graph image exist;
- exported HTML contains no unresolved placeholder marker or invalid placeholder origin;
- every root-relative rendered link resolves to an exported page or asset;
- preview pages contain a no-index directive;
- JSON-LD blocks parse as JSON and contain no invalid values;
- no server-function directories exist;
- any emitted client middleware manifest has an empty matcher list.

The regular verification sequence is `npm test`, `npm run lint`, and `npm run build`, followed by in-app Browser checks at desktop and 375-pixel mobile widths. Browser QA covers page identity, meaningful DOM, absence of framework overlays, console health, screenshots, and navigation from the home page to a formerly broken section route.

## README and authoring contract

The scaffold README is replaced with project-specific documentation covering:

- stack and static-export constraints;
- local development, lint, test, and build commands;
- paper, project, and note schemas;
- the explicit draft-plus-completeness publishing rule;
- how to add each content type;
- how to supply the production origin and CV PDF;
- the launch-readiness/indexing behavior;
- the Vercel static deployment pipeline.

## Acceptance Criteria

- `npm test`, `npm run lint`, and `npm run build` exit successfully without warnings.
- The route table includes the four base section routes and the home page.
- The export verifier reports no broken internal links or leaked placeholders.
- Clicking Research from the home page renders the Research page instead of a 404.
- Preview output is non-indexable and contains no invalid canonical, Open Graph, or JSON-LD values.
- At 1280 and 375 pixels, tested pages have no horizontal overflow or relevant console errors.
- No owner fact has been added beyond the supplied brief and existing verified configuration.
