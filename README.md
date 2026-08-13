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
npm run build
```

`npm test` runs helper unit tests, a normal preview export, a controlled fixture export that exercises dynamic MDX routes, and a final restored preview export.

## Content model

Content lives under `src/content/`. Each `.mdx` filename becomes its stable public slug, so renaming a published file changes its URL.

### Papers

Directory: `src/content/papers/`

Required frontmatter: `title`, `authors` in exact publication order, `venue`, `year`, `status`, `role`, `abstract`, `takeaway`, `draft`, and `order`.

Optional frontmatter: `pdfUrl`, `codeUrl`, and `bibtex`.

`status` is `published`, `accepted`, or `in-progress`. `role` is `lead-author` or `co-author`. The takeaway should be the owner's two-sentence interpretation, not generated filler. The MDX body is optional and appears only when it is non-empty and contains no unresolved placeholder.

### Projects

Directory: `src/content/projects/`

Required frontmatter: `title`, `problem`, `approach`, `result`, `stack`, `repoUrl`, `status`, `draft`, and `order`. `liveUrl` is optional. `status` is `live`, `archived`, or `wip`.

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

To add content, copy the matching sample, choose a stable lowercase filename, complete the schema, leave `draft: true` while editing, and switch it to `false` only after checking every claim and link. Paper author arrays are never reordered.

## Site identity, CV, and production origin

The canonical name, positioning, bio, public email, and five profile destinations live in `src/lib/site.ts`. Placeholder-bearing or malformed contact values are omitted from links and JSON-LD.

Set the final origin at build time:

```bash
NEXT_PUBLIC_SITE_URL="$YOUR_FINAL_HTTPS_ORIGIN" npm run build
```

The configured value must be an absolute HTTPS URL with a public hostname. A missing value creates a safe preview. An invalid configured value fails the build.

Place the owner-supplied PDF at `public/cv.pdf`. The HTML CV always exists; its download action appears only when that file exists.

The site becomes indexable only when all four launch conditions pass:

1. A valid production origin exists.
2. The public email and all five profile URLs validate.
3. At least one paper is public.
4. `public/cv.pdf` exists.

Until then, pages emit `noindex, nofollow`, `robots.txt` disallows crawling, and `sitemap.xml` contains no public URL entries. The static `public/opengraph-image.png` fallback is linked only when a valid production origin exists.

## Testing overrides

The export suite uses two build-time overrides for controlled fixtures:

- `PORTFOLIO_CONTENT_DIR` selects a test-only content root.
- `PORTFOLIO_CV_PATH` selects a test-only CV path.

Do not set these in production deployment settings.

## Deployment

Connect the repository to Vercel and use `npm run build`. Next.js writes the portable site to `out/`; there are no server functions or middleware matchers. Preview deployments remain crawl-blocked until the launch-readiness inputs above are supplied.

The same `out/` directory can be served by any static host that preserves directory indexes and trailing-slash routes.
