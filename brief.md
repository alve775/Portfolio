# Build Brief: Personal Research and Engineering Portfolio (Next.js)

You are building a static personal website with Next.js. Read this entire brief before writing any code. Work through the phases in order and stop at each checkpoint marked **STOP**.

---

## 0. Non-negotiable rules

1. **Never invent facts.** Paper titles, author lists, venues, dates, metrics, and links come from section 12 or from the owner directly. Anywhere a fact is missing, emit the literal placeholder token `{{TODO: description}}` and continue. Do not guess, do not fill with plausible-looking text, do not generate example publications or fabricate metrics.
2. **No lorem ipsum.** Use `{{TODO}}` tokens so missing content fails visibly.
3. **Static export only.** `output: 'export'` in `next.config.mjs`. The build must emit a fully static `out/` directory with zero serverless functions and zero middleware.
4. **No browser storage APIs** (`localStorage`, `sessionStorage`). Not needed here.
5. **Verify package status before installing.** Parts of the Next.js MDX ecosystem move fast and some once-standard packages are now unmaintained. Check the npm page and last publish date for every content-layer dependency before adding it, and report what you found.
6. Commit after every completed phase. Small, descriptive commits.

---

## 1. Context

**Owner:** Kamruzzaman Khan Alve. Canonical name string, byte-identical everywhere on the site. Final-semester B.Sc. CSE, Rajshahi University of Engineering and Technology (RUET), Bangladesh. Targeting AI engineering and research roles now, graduate programs later.

**Audience, in priority order:**
1. A professor or research scientist scanning for 40 seconds, looking for publications and evidence of research taste.
2. A hiring manager checking whether the candidate ships working systems.
3. The owner, citing stable URLs in applications.

**The site's job:** be the canonical narrative tying together artifacts already scattered across GitHub, Google Scholar, and HuggingFace. Not a blog. Not a design showcase.

**Positioning:** the intersection of native Bangla fluency and research-grade NLP, plus biometric security (fingerprint presentation attack detection), plus deployment engineering.

---

## 2. Stack

- **Next.js**, latest stable, **App Router**, TypeScript strict, ESLint on.
- **Tailwind CSS**.
- **Static export**: `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: true`.
- **Content**: MDX files on disk, read at build time, validated with **zod**.
- **Fonts**: `next/font/local`, self-hosted and subset. No render-blocking third-party font requests.
- **Deployment**: Vercel, auto-detected.

**Trade-off you are accepting with `output: 'export'` (stated so you do not try to work around it):** no `next/image` optimization, no ISR, no route handlers, no middleware. All are irrelevant for a content site with a handful of images, and static export buys guaranteed zero-function deploys plus full portability off Vercel. Do not add an adapter, a server, or a database.

**Content layer.** Primary approach, chosen for zero dependency risk:

```
gray-matter        parse frontmatter
zod                validate frontmatter against schemas
next-mdx-remote    compile MDX body in a server component (/rsc entrypoint)
```

Before installing, verify `next-mdx-remote` is current and its RSC entrypoint supports the installed Next.js major version. If it is stale, report that and propose one alternative rather than silently substituting. A dedicated content-layer library is acceptable if it provides zod schema validation and is actively maintained, but plain filesystem reads are the default and are sufficient.

Scaffold:

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

---

## 3. Information architecture

```
/                          Home
/research                  Publication and thesis index
/research/[slug]           One page per paper. Stable citable URL.
/projects                  Engineering project index
/notes                     Technical notes index
/notes/[slug]              One page per note
/cv                        HTML CV plus PDF download
```

No contact page. Contact links live in the footer and in one row on the home page.

```
src/
  app/
    layout.tsx
    page.tsx
    research/page.tsx
    research/[slug]/page.tsx
    projects/page.tsx
    notes/page.tsx
    notes/[slug]/page.tsx
    cv/page.tsx
    sitemap.ts
    robots.ts
    opengraph-image.tsx
  components/
  lib/
    content.ts        filesystem reads + zod validation
    schemas.ts        zod schemas
    site.ts           single source of truth for name, URLs, socials
  content/
    papers/*.mdx
    projects/*.mdx
    notes/*.mdx
public/
  cv.pdf
  fonts/
README.md
```

`src/lib/site.ts` holds the canonical name, tagline, email, and every social URL as a single exported object. Every component imports from it. This is the mechanism that guarantees the name renders identically everywhere.

Every dynamic route implements `generateStaticParams` so the export enumerates all pages. A missing `generateStaticParams` will fail the export; treat that failure as a bug in your code, not a reason to abandon static export.

---

## 4. Content schemas

Zod schemas in `src/lib/schemas.ts`. Content loading in `src/lib/content.ts` must call `schema.parse()`, not `safeParse()`, so a malformed entry throws and breaks the build. That is intentional.

**papers**

| field | type | required |
|---|---|---|
| `title` | string | yes |
| `authors` | string[], exact publication order | yes |
| `venue` | string | yes |
| `year` | number | yes |
| `status` | enum: `published`, `accepted`, `in-progress` | yes |
| `role` | enum: `lead-author`, `co-author` | yes |
| `abstract` | string | yes |
| `pdfUrl` | string url | no |
| `codeUrl` | string url | no |
| `bibtex` | string | no |
| `takeaway` | string, 2 sentences | yes |
| `order` | number | yes |

`takeaway` is the differentiator: the owner's plain statement of what the work actually shows, in his own voice, not a restatement of the abstract. Drafts are in section 12. Never generate a new one.

**projects**
`title`, `problem` (one line), `approach` (one line), `result` (one quantified line), `stack` (string[]), `repoUrl`, `liveUrl` (optional), `status` (enum: `live`, `archived`, `wip`), `order`.

**notes**
`title`, `date`, `summary` (one line), `draft` (boolean, excluded from the build when true).

---

## 5. Design direction

The brief pins these axes. Do not spend creativity overriding them.

**Constraints:**
- Content column max width roughly 680px. Body line height around 1.65.
- Banned: scroll animations, parallax, particle backgrounds, gradient blobs, skill-proficiency bars, animated counters, testimonial sections. These read as junior and directly harm the primary audience.
- Motion budget: link and card hover states only. Respect `prefers-reduced-motion`.
- Dark mode optional. If implemented, `prefers-color-scheme` media query only, no toggle UI.

**Free axes, where you should make a deliberate choice rather than reach for a default:**
- Typography carries the entire personality, since ornament is banned. Pair a characteristic display face with a highly readable body face and set a real type scale with intentional weights and spacing. Avoid the current AI-design cluster: warm cream background with high-contrast serif and terracotta accent; near-black with a single acid-green or vermilion accent; broadsheet hairline-rule pastiche. Ground the choice in the subject instead: technical research writing, monospace as legitimate texture, the visual language of papers and terminals rather than marketing pages.
- One accent color, used sparingly and consistently.
- Signature element: the per-paper page is the most-visited destination on this site. Make its layout the memorable thing, not the home page hero.

**Before writing CSS,** produce a token plan: 4 to 6 named hex values, the typefaces and their roles, a one-sentence layout concept, and the signature element. Review it against the constraints, revise anything that reads as a generic default, and say what you changed and why. **STOP** and show the owner the plan before building.

---

## 6. Page requirements

**Home.** Above the fold: name, one-sentence positioning statement, the bio, and one row of links (GitHub, Google Scholar, HuggingFace, ORCID, LinkedIn, email). Below: three linked proof points (two papers plus the thesis). Nothing else.

**/research.** Publications first, grouped by status, newest first. Each entry: title, authors with the owner's name emphasized, venue, year, links. The thesis sits in its own clearly labeled in-progress section so nothing implies it is published.

**/research/[slug].** Title, full author list, venue, status badge, abstract, the `takeaway` block visually distinguished from the abstract, links, and a copyable BibTeX block.

**/projects.** Cards with problem, approach, quantified result, stack tags, repo link, status. Five entries maximum; render the first five by `order` and leave the rest as drafts.

**/notes.** Reverse-chronological: title, date, one-line summary. No empty-state marketing copy. If there are no published notes, do not link the section from the header.

**/cv.** Semantic HTML rendering plus a prominent download button for `/cv.pdf`.

---

## 7. Technical requirements

- **Metadata API**, not manual `<head>` tags. Root `metadata` export with `metadataBase` and a title template; `generateMetadata` on every dynamic route.
- **`app/sitemap.ts`** and **`app/robots.ts`** generated from the content collections, not hardcoded.
- **`app/opengraph-image.tsx`** using `next/og`. Verify it renders under static export; if it does not in the installed version, fall back to a static `public/og.png` and say so.
- **JSON-LD `Person`** in the root layout: `name`, `url`, `affiliation`, `email`, and a `sameAs` array of GitHub, Scholar, ORCID, HuggingFace, LinkedIn. Inject as a `<script type="application/ld+json">` with `dangerouslySetInnerHTML` and `JSON.stringify`. Use `{{TODO}}` for any URL not supplied.
- **Google Scholar indexing** on paper pages: `citation_title`, `citation_author` (repeated once per author, in order), `citation_publication_date`, `citation_conference_title`. Emit these through the Metadata API's `other` field, then **verify in the built HTML** that repeated `citation_author` tags actually render as separate elements. If the API collapses them, emit them manually in the page component instead.
- **Accessibility floor:** semantic landmarks, one `h1` per page, visible keyboard focus rings, 4.5:1 contrast for body text, alt text on every image, skip-to-content link.
- **Performance floor:** Lighthouse performance above 95, accessibility 100, on the deployed build.
- **`README.md`** at the repo root, one file: stack, local dev commands, content schema reference, how to add a paper or project or note, deploy pipeline. No separate docs directory.

---

## 8. Phases and checkpoints

**Phase A. Scaffold.** `create-next-app`, configure `output: 'export'`, build the directory tree, write `schemas.ts`, `content.ts`, and `site.ts`, create one `{{TODO}}`-filled sample entry per collection, ship a bare `page.tsx` with an `h1`. Verify `npm run build` produces `out/` with zero functions. **STOP** and confirm the Vercel deploy is live before continuing.

**Phase B. Design plan.** Token plan from section 5. **STOP** for approval.

**Phase C. Root layout and home.** Layout, header, footer, metadata, JSON-LD, fonts. Then the home page using the content in section 12. Commit.

**Phase D. Research.** Index plus dynamic paper route with `generateStaticParams`, `generateMetadata`, and the Scholar citation tags. Commit.

**Phase E. Projects.** Index only, no detail routes. Commit.

**Phase F. Notes and CV.** Both routes. Commit.

**Phase G. Audit.** Run section 9 and report pass or fail per item as a table. Fix failures. Commit.

---

## 9. Acceptance checklist

Report each as pass or fail. Do not mark pass without verifying.

- [ ] `npm run build` succeeds with zero warnings
- [ ] `out/` contains no `.func` directories; if Next.js emits a client middleware manifest, its matcher list is empty
- [ ] Every route in section 3 exists in `out/` as an HTML file
- [ ] Zero broken internal links
- [ ] Every remaining `{{TODO}}` token listed in the final report with file and line
- [ ] Owner's name renders identically on every page, byte for byte, sourced from `site.ts`
- [ ] Author lists render in the exact order supplied, no reordering
- [ ] Repeated `citation_author` tags verified present in built HTML
- [ ] Every paper has a unique, stable, human-readable slug
- [ ] `sitemap.xml` and `robots.txt` present in `out/` and include all routes
- [ ] JSON-LD validates as a `Person` object
- [ ] Open Graph tags present and unique per page
- [ ] Lighthouse performance above 95, accessibility 100
- [ ] Renders at 375px width with no horizontal scroll
- [ ] Keyboard navigation reaches every interactive element with a visible focus ring
- [ ] `prefers-reduced-motion` honored
- [ ] `README.md` covers all five required topics

---

## 10. Out of scope

Do not build these, even if they seem useful:

- Live model demos or inference endpoints. Later, separate task, via HuggingFace Spaces embeds.
- Contact form or any backend.
- Analytics. Added separately after launch.
- CMS or admin interface.
- Comments, newsletter signup.
- A blog with a posting cadence. Notes are a small permanent set, not a stream.
- `vercel.json` security headers. Deferred, because the configuration interacts with future demo iframes.

---

## 11. First action

Confirm you have read this brief, list any ambiguity you found, then begin Phase A.

---

## 12. Content

**Provenance note:** the drafts below are starting points written for the owner to edit, not verified facts. Every number, author list, and date is marked `{{TODO}}` and must be supplied by the owner. Use this text as written. Do not extend it, do not fill the placeholders, do not "improve" the phrasing.

### 12.1 Positioning sentence

Five drafts. The owner selects one. Use draft 3 as the working default until told otherwise; leave the others as a comment in `site.ts`.

1. AI engineer and researcher working on low-resource Bangla NLP and adversarial robustness in biometric systems.
2. Final-year CSE student at RUET publishing on multilingual language models and building the systems that deploy them.
3. I work on low-resource Bangla NLP and the security of biometric models, and I ship the deployment code as well as the papers.
4. Researcher in low-resource language modeling and presentation attack detection, with published work at ACL and IEEE venues.
5. Bangla NLP and biometric security research, plus the unglamorous engineering that gets a model into production.

### 12.2 Bio

Third person, for the home page. Roughly 90 words.

> Kamruzzaman Khan Alve is a final-semester Computer Science and Engineering student at Rajshahi University of Engineering and Technology, Bangladesh. His research sits at the intersection of low-resource language modeling and the security of learned systems: comparative work on monolingual and multilingual transformers for Bangla, and an undergraduate thesis on adversarial robustness in fingerprint presentation attack detection. He is affiliated with {{TODO: confirm lab affiliations to list, e.g. Young Learners Research Lab, TextLab RUET}}. Alongside research he builds and deploys the inference systems that put these models in front of users.

### 12.3 Paper takeaways

Two sentences each. First person. States what the work shows, not what it did.

**Paper 1, lead author, IEEE QPAIN 2026.** Title: `{{TODO: confirm exact title as it appears in the accepted version}}`. Author list: `{{TODO: exact, in publication order}}`.

> Takeaway draft:
> A monolingual Bangla encoder outperforms multilingual models on grammatical sentence-type classification, which suggests that for this task the bottleneck is language-specific syntactic representation rather than model scale or cross-lingual transfer. {{TODO: add the concrete margin, e.g. "The gap was X points of macro-F1 over mBERT and Y over XLM-R"}}

**Paper 2, co-author, BEA 2026 Shared Task at ACL.** Title: `{{TODO: confirm exact title}}`. Author list: `{{TODO: exact, in publication order}}`.

> Takeaway draft:
> A single language-agnostic pipeline can predict vocabulary difficulty across three different first-language backgrounds without per-language modeling, which matters because per-L1 systems do not scale to the long tail of learner populations. {{TODO: add the result and the shared-task placement, and state honestly what the unified approach cost relative to a tuned per-language system}}

**Thesis, in progress.** Fingerprint presentation attack detection.

> Takeaway draft:
> Liveness detectors that report high accuracy on LivDet benchmarks can be flipped by small gradient-based perturbations, so I evaluate under adversarial conditions and use Grad-CAM++ to check whether the model attends to the regions a presentation attack actually alters. {{TODO: state the clean vs. adversarial performance gap, and whether adversarial training closed it}}
>
> Frontmatter: `status: in-progress`. Do not render a venue. Do not imply acceptance.

### 12.4 Metric reporting rule

If the owner supplies a headline metric, render it with the metric name, the dataset, and the protocol, never a bare percentage. Balanced accuracy on LivDet2015 under a stated protocol is a claim; "97% accuracy" is not. Where the protocol is unknown, use `{{TODO: protocol}}` rather than dropping it.
