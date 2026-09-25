# Research and Engineering Portfolio

A fully static Next.js portfolio for research records, engineering projects, technical notes, and a curriculum vitae. Unfinished owner content stays in source files as explicit placeholders but is withheld from public output until it passes the publishing gate.

## Stack

- Next.js 16 App Router and React 19
- TypeScript in strict mode
- Tailwind CSS 4
- Filesystem MDX parsed with `gray-matter` and rendered with `next-mdx-remote/rsc`
- Zod frontmatter validation
- Node's built-in test runner
- Static export to `out/`

The site has no runtime server, middleware, database, CMS, analytics, or browser storage. The build intentionally uses Next.js's supported webpack mode because Turbopack's CSS worker cannot bind its local port in some restricted build environments.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Before committing or deploying, run:

```bash
npm run lint
npm test
```

`npm test` runs helper unit tests, a normal preview export, a production fixture export that exercises dynamic MDX routes, and a preview deployment export with a configured origin. It restores the normal local preview after fixture checks.

To preview the production export locally, run `npm run build` followed by `npm start`,
then open `http://127.0.0.1:4173`. The preview command needs Python 3. This project
uses static export, so `next start` is not a supported way to serve it.

## Content model

Content lives under `src/content/`. Each `.mdx` filename becomes its stable public slug, so renaming a published file changes its URL.

### Papers

Directory: `src/content/papers/`

Required frontmatter: `title`, `authors` in exact publication order, `venue`, `year`, `status`, `role`, `abstract`, `takeaway`, `draft`, and `order`.

Optional frontmatter: `pdfUrl`, `codeUrl`, `bibtex`, and `abstractLabel` (`as submitted` by default, or `summary`).

`status` is `published`, `accepted`, `in-progress`, or `thesis`. A thesis is grouped separately from publications and uses dissertation-institution metadata rather than conference metadata. `role` is `lead-author` or `co-author`. Takeaways must remain supported by the source material. The MDX body is optional and appears only when it is non-empty and contains no unresolved placeholder.

### Projects

Directory: `src/content/projects/`

Required frontmatter: `title`, `problem`, `approach`, `result`, `stack`, `repoUrl`, `status`, `draft`, and `order`. `liveUrl` is optional. `status` is `live`, `complete`, `archived`, or `wip`. Use `complete` for a finished source-code project without a hosted demo. Results describe verified functionality; performance numbers need a named dataset and evaluation protocol.

The project index renders at most the first five public records by `order`. Project MDX bodies are not rendered.

### Notes

Directory: `src/content/notes/`

Required frontmatter: `title`, ISO date `date`, `summary`, and `draft`. A note also requires a non-empty, placeholder-free MDX body. Public notes are sorted newest first.

## Publishing content

An entry becomes public only when:

1. `draft` is explicitly `false`.
2. Every frontmatter value used by its public view is complete and contains no unresolved placeholder marker.
3. For a note, the MDX body is also non-empty and complete.

Malformed frontmatter still fails the build with the offending filename. Draft or incomplete records are excluded from lists, navigation data, detail routes, metadata, and the sitemap. Keep unresolved owner facts in their source files; do not replace them with plausible guesses.

To add content, use a record under `tests/fixtures/content/` as a schema example, choose a stable lowercase filename, complete the schema, leave `draft: true` while editing, and switch it to `false` only after checking every claim and link. Never publish the fixture text itself. Paper author arrays are never reordered. Notes are currently empty and omitted from navigation.

Projects may include an `image` object (local `src`, `alt`, `caption`, `width`, `height`) and a `caseStudy` object (`contribution`, `decision`, `limitation`). Images appear on the homepage and Projects page; the longer case-study text appears on Projects. The two JPEGs under `public/images/projects/` were captured from the deployed Resume Evaluator and TextLabRUET classifier on 8 September 2026. The resume score is the app's landing-page illustration; the classifier image shows one real Bangla prediction. Neither image establishes benchmark performance.

## Site identity, CV, and production origin

The canonical name, positioning, bio, public email, and profile destinations live in `src/lib/site.ts`. Profiles are optional individually, including ORCID; use `null` for an omitted destination. Placeholder-bearing or malformed contact values are omitted from links and JSON-LD.

Set the final origin at build time:

```bash
NEXT_PUBLIC_SITE_URL="$YOUR_FINAL_HTTPS_ORIGIN" npm run build
```

The configured value must be an absolute HTTPS URL with a public hostname. A missing value creates a safe preview. An invalid configured value fails the build.

Place the owner-supplied PDF at `public/cv.pdf`. The HTML CV always exists; its download action appears only when that file exists.

The site becomes indexable only when all five launch conditions pass:

1. A valid production origin exists.
2. The public email and at least one profile URL validate.
3. At least one paper is public.
4. `public/cv.pdf` exists.
5. The build is not a Vercel preview (`VERCEL_ENV=preview`).

Until then, pages emit `noindex, nofollow`, `robots.txt` disallows crawling, and `sitemap.xml` contains no public URL entries. The static `public/opengraph-image.png` fallback is linked only when a valid production origin exists.

## Testing overrides

The export suite uses two build-time overrides for controlled fixtures:

- `PORTFOLIO_CONTENT_DIR` selects a test-only content root.
- `PORTFOLIO_CV_PATH` selects a test-only CV path.

Do not set these in production deployment settings.

## Deployment

Connect the repository to Vercel and use `npm run build`. Next.js writes the portable site to `out/`; there are no server functions or middleware matchers. Vercel preview deployments always remain crawl-blocked, even if a production origin is available. On another preview host, set `VERCEL_ENV=preview` explicitly or leave the production origin unset.

The same `out/` directory can be served by any static host that preserves directory indexes and trailing-slash routes.

The verified GitHub repository is [alve775/Portfolio](https://github.com/alve775/Portfolio).
Its repository homepage field still points to an older Vercel address; do not use
that field as a confirmed production origin. No deployment was performed during
the September 8 content-completion pass.

For Vercel deployment and diagnostics, installing the CLI with `npm i -g vercel`
is recommended; it enables `vercel env pull`, `vercel deploy`, and `vercel logs`.

## Content verification — September 8, 2026

| Content | Source and scope |
| --- | --- |
| Identity, education, experience, skills, four profiles | Owner-supplied `Kamruzzaman_Khan_Alve_Junior_ML_Engineer_CV.pdf`; `public/cv.pdf` is an unchanged copy. |
| QPAIN paper | [Registered DOI](https://doi.org/10.1109/QPAIN69676.2026.11546339), publisher-deposited Crossref metadata, existing submitted abstract, and owner CV. Verified full title, author order, 2026 publication, pages, and DOI. No superiority claim from the tiny reported model gap. |
| BEA paper | [ACL Anthology](https://aclanthology.org/2026.bea-1.73/) and its BibTeX export. Preserves the full published title, including the team name “Failure,” and the exact two-author order. |
| Undergraduate thesis | Local RUET thesis `document.tex`, `chapters/i_cover.tex`, and `chapters/iv_abstract.tex`. Supervisor is credited separately from authorship. The overview is labelled a summary, and the subsequent five-arm journal rerun is not presented as a published result. |
| Resume Evaluator | [Repository](https://github.com/alve775/Resume-Evaluator) and public app homepage. Homepage availability was checked; resume processing was not tested in this pass. |
| Web-RAG | [Repository README and source tree](https://github.com/alve775/web-rag). Current code uses LlamaIndex; the supplied CV refers to LangChain. The original CV is unchanged. |
| Bangla Sentence Classifier | Owner CV plus [TextLab RUET Space source](https://huggingface.co/spaces/TextLabRUET/Multilingual-Sentence-Classifier/tree/main). Public Space was sleeping when checked; inference was not run. |
| Grocery Shopping Tracker | [Repository](https://github.com/alve775/grocery-tracker). Kept labelled in development; no new live database or native-app verification is claimed. |
| NoorTime | [Repository](https://github.com/alve775/NoorTime). README and prayer-calculation, location, and notification services checked; native builds and notification delivery were not run in this pass. |

The PDF SHA-256 is `40947b64a1bb103935b804530e17db05fe239d53f74454158ec03ed7649a456f`.

Remaining owner input: the final HTTPS production origin (`NEXT_PUBLIC_SITE_URL`).
ORCID is optional. Until the origin is set and the launch checks pass, the export
deliberately remains `noindex, nofollow`. Local verification
does not establish deployed Lighthouse scores or a live portfolio deployment.

Verification for the content and navigation improvements: lint, production export,
all 21 unit tests and 10 export tests passed. These cover internal links, local
project images, citation-author order, the unchanged CV download, indexable
production output without ORCID, and crawl-blocked previews even with an origin.
Browser checks covered the updated homepage and Projects page at 1440, 768, 375,
and 320 px, including visible station labels, the Projects action, image loading,
case-study text, reduced-motion fallback, and keyboard focus at the selected-work
skip destination. No horizontal overflow or JavaScript exceptions were observed.
Chromium emitted font-preload timing warnings during repeated navigation; no
deployed Lighthouse or full accessibility audit is claimed. QA screenshots are in
`output/playwright/` (git-ignored).
