# Portfolio Safe-Preview Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the static portfolio routes while ensuring unfinished owner content cannot leak into pages, links, metadata, or indexing outputs.

**Architecture:** Raw MDX remains the authoring source, but public collection functions apply an explicit draft-and-completeness boundary before routes see entries. Independent validation and launch-readiness helpers control links, structured metadata, robots, and sitemap behavior. Node integration tests inspect the real `out/` export and a test-only fixture build.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript strict mode, MDX through `next-mdx-remote/rsc`, Zod 4, Tailwind CSS 4, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-13-portfolio-safe-preview-repair-design.md`

## Global Constraints

- Keep `output: 'export'`, `images: { unoptimized: true }`, and `trailingSlash: true`.
- Do not invent publication facts, links, metrics, affiliations, contact details, or a CV PDF.
- Preserve the current typography, record-grid layout, accessibility treatment, and verified wording.
- Add no runtime server, API route, middleware, CMS, database, analytics, or browser storage.
- A public content entry requires `draft: false` and complete public fields.
- Missing production configuration must produce a safe, non-indexable preview build.
- A configured production origin must be a public absolute HTTPS URL or fail the build.
- Use no new test dependency; tests run against real TypeScript helpers and static exports.
- Use Next.js's supported webpack build mode because this execution environment blocks the local worker port Turbopack opens during CSS processing.

## File Map

- `src/lib/publishability.ts`: recursive unresolved-marker detection and paper/project/note public predicates.
- `src/lib/site-validation.ts`: production-origin, profile-URL, and email validation.
- `src/lib/site.ts`: verified identity source plus validated public contact selectors.
- `src/lib/cv.ts`: build-time CV PDF presence check with a test-only path override.
- `src/lib/readiness-core.ts`: pure launch-readiness evaluation.
- `src/lib/readiness.ts`: server-only live project readiness assembly.
- `src/lib/seo.ts`: origin-aware canonical URL and route metadata helpers.
- `src/lib/content.ts`: filesystem parsing plus public collection filtering.
- `scripts/prune-empty-routes.mjs`: remove build-only empty-collection sentinel output required by Next.js static export.
- `src/app/**`: base routes, dynamic routes, metadata, sitemap, robots, and Open Graph image.
- `tests/unit/*.test.mjs`: helper behavior exercised through Node type stripping.
- `tests/fixtures/content/**`: complete test-only MDX used to exercise dynamic static routes.
- `tests/export.test.mjs`: real-export route, link, metadata, and artifact verification.

---

### Task 1: Safe public data boundary and preview root

**Files:**
- Create: `src/lib/publishability.ts`
- Create: `src/lib/site-validation.ts`
- Create: `tests/unit/publishability.test.mjs`
- Create: `tests/unit/site-validation.test.mjs`
- Create: `tests/export.test.mjs`
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `src/lib/schemas.ts`
- Modify: `src/lib/content.ts`
- Create: `scripts/prune-empty-routes.mjs`
- Modify: `package.json`
- Modify: `src/lib/site.ts`
- Modify: `src/components/ProfileLinks.tsx`
- Modify: `src/components/PersonJsonLd.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/content/papers/bangla-sentence-type-classification.mdx`
- Modify: `src/content/papers/fingerprint-presentation-attack-detection.mdx`
- Modify: `src/content/papers/vocabulary-difficulty-prediction.mdx`
- Modify: `src/content/projects/sample-project.mdx`
- Modify: `src/content/notes/sample-note.mdx`

**Interfaces:**
- Produces: `containsUnresolved(value: unknown): boolean`
- Produces: `isPublishablePaper(entry: ContentRecord<Paper>): boolean`
- Produces: `isPublishableProject(entry: ContentRecord<Project>): boolean`
- Produces: `isPublishableNote(entry: ContentRecord<Note>): boolean`
- Produces: `safeOptionalBody(body: string): string | null`
- Produces: `resolveProductionOrigin(raw: string | undefined): URL | null`
- Produces: `asPublicHttpsUrl(value: string | undefined | null): string | null`
- Produces: `asPublicEmail(value: string | undefined | null): string | null`
- Produces: `productionOrigin: URL | null`, `publicEmail: string | null`, and `publicProfiles`
- Consumers: all later route, readiness, JSON-LD, and SEO tasks.

- [ ] **Step 1: Add unit tests for the public predicates and validators**

Create tests with independently derived inputs:

```js
// tests/unit/publishability.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  containsUnresolved,
  isPublishableNote,
  isPublishablePaper,
  isPublishableProject,
  safeOptionalBody,
} from '../../src/lib/publishability.ts';

const unresolved = ['{{', 'TO', 'DO: title}}'].join('');

test('finds unresolved markers inside nested values', () => {
  assert.equal(containsUnresolved({ authors: ['Ready', unresolved] }), true);
  assert.equal(containsUnresolved({ authors: ['Ready'] }), false);
});

test('publishes only explicit complete paper and project records', () => {
  assert.equal(isPublishablePaper({ frontmatter: { draft: false, title: 'Ready' }, body: '' }), true);
  assert.equal(isPublishablePaper({ frontmatter: { draft: true, title: 'Ready' }, body: '' }), false);
  assert.equal(isPublishableProject({ frontmatter: { draft: false, title: unresolved }, body: '' }), false);
});

test('requires a safe non-empty note body and safely omits optional bodies', () => {
  assert.equal(isPublishableNote({ frontmatter: { draft: false, title: 'Ready' }, body: 'Body' }), true);
  assert.equal(isPublishableNote({ frontmatter: { draft: false, title: 'Ready' }, body: unresolved }), false);
  assert.equal(safeOptionalBody(unresolved), null);
  assert.equal(safeOptionalBody('  Safe body.  '), 'Safe body.');
});
```

```js
// tests/unit/site-validation.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  asPublicEmail,
  asPublicHttpsUrl,
  resolveProductionOrigin,
} from '../../src/lib/site-validation.ts';

const unresolvedUrl = ['{{', 'TO', 'DO: profile URL}}'].join('');

test('accepts public HTTPS values and a conventional public email', () => {
  assert.equal(asPublicHttpsUrl('https://github.com/example'), 'https://github.com/example');
  assert.equal(asPublicEmail('person@example.org'), 'person@example.org');
});

test('omits unresolved and malformed contact values', () => {
  assert.equal(asPublicHttpsUrl(unresolvedUrl), null);
  assert.equal(asPublicHttpsUrl('https://todo.invalid'), null);
  assert.equal(asPublicHttpsUrl('javascript:alert(1)'), null);
  assert.equal(asPublicEmail('not-an-email'), null);
});

test('treats a missing origin as preview and rejects unsafe configured origins', () => {
  assert.equal(resolveProductionOrigin(undefined), null);
  assert.throws(() => resolveProductionOrigin('http://localhost:3000'), /public absolute HTTPS URL/);
  assert.throws(() => resolveProductionOrigin('https://127.0.0.1'), /public absolute HTTPS URL/);
  assert.equal(resolveProductionOrigin('https://portfolio.rfc-editor.org')?.origin, 'https://portfolio.rfc-editor.org');
});
```

- [ ] **Step 2: Add a failing root-export regression test and test scripts**

Add package scripts and ESM package mode:

```json
{
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint",
    "test:unit": "node --disable-warning=ExperimentalWarning --test tests/unit/*.test.mjs",
    "test:export": "npm run build && node --test --test-concurrency=1 tests/export.test.mjs",
    "test": "npm run test:unit && npm run test:export"
  }
}
```

Create the initial export test:

```js
// tests/export.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const out = path.join(root, 'out');
const unresolved = ['{{', 'TO', 'DO'].join('');

test('preview root contains no unresolved public values and is not indexable', async () => {
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  assert.equal(html.includes(unresolved), false, 'root HTML leaked an unresolved marker');
  assert.equal(html.includes('todo.invalid'), false, 'root HTML leaked the invalid placeholder origin');
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)) {
    assert.doesNotThrow(() => JSON.parse(match[1]));
  }
});
```

- [ ] **Step 3: Run the tests and verify the expected red state**

Run: `npm run test:unit`

Expected: FAIL because `src/lib/publishability.ts` and `src/lib/site-validation.ts` do not exist.

Run: `npm run test:export`

Expected: FAIL because `out/index.html` contains unresolved markers, `todo.invalid`, and indexable robots metadata.

- [ ] **Step 4: Implement validation and publishability helpers**

Use pure functions so tests exercise real production code:

```ts
// src/lib/publishability.ts
type ContentRecord<T> = { frontmatter: T; body: string };
type DraftRecord = { draft: boolean };

const unresolvedPrefix = ['{{', 'TO', 'DO'].join('');

export function containsUnresolved(value: unknown): boolean {
  if (typeof value === 'string') return value.includes(unresolvedPrefix);
  if (Array.isArray(value)) return value.some(containsUnresolved);
  if (value && typeof value === 'object') return Object.values(value).some(containsUnresolved);
  return false;
}

function hasPublicFrontmatter<T extends DraftRecord>(entry: ContentRecord<T>): boolean {
  return entry.frontmatter.draft === false && !containsUnresolved(entry.frontmatter);
}

export const isPublishablePaper = hasPublicFrontmatter;
export const isPublishableProject = hasPublicFrontmatter;

export function isPublishableNote<T extends DraftRecord>(entry: ContentRecord<T>): boolean {
  return hasPublicFrontmatter(entry) && safeOptionalBody(entry.body) !== null;
}

export function safeOptionalBody(body: string): string | null {
  const trimmed = body.trim();
  return trimmed && !containsUnresolved(trimmed) ? trimmed : null;
}
```

```ts
// src/lib/site-validation.ts
import { containsUnresolved } from './publishability.ts';

const reservedHosts = new Set(['localhost', 'example.com', 'example.net', 'example.org']);
const reservedSuffixes = ['.example.com', '.example.net', '.example.org'];

function isPublicHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host.includes('.')
    && !/^\d+(?:\.\d+){3}$/.test(host)
    && !host.includes(':')
    && !host.endsWith('.local')
    && !host.endsWith('.invalid')
    && !host.endsWith('.test')
    && !reservedSuffixes.some((suffix) => host.endsWith(suffix))
    && !reservedHosts.has(host);
}

export function asPublicHttpsUrl(value: string | undefined | null): string | null {
  if (!value || containsUnresolved(value)) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && isPublicHostname(url.hostname) && !url.username && !url.password
      ? url.href.replace(/\/$/, '')
      : null;
  } catch {
    return null;
  }
}

export function asPublicEmail(value: string | undefined | null): string | null {
  if (!value || containsUnresolved(value)) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

export function resolveProductionOrigin(raw: string | undefined): URL | null {
  if (!raw) return null;
  const normalized = asPublicHttpsUrl(raw);
  if (!normalized) throw new Error('NEXT_PUBLIC_SITE_URL must be a public absolute HTTPS URL.');
  const url = new URL(normalized);
  if (!isPublicHostname(url.hostname)) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a public absolute HTTPS URL.');
  }
  return new URL(url.origin);
}
```

Enable explicit TypeScript extensions for the pure module boundary Node exercises directly:

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true
  }
}
```

- [ ] **Step 5: Apply the public boundary to schemas and content**

Add required `draft: z.boolean()` fields to paper and project schemas, keep the existing note field, add `draft: true` to every current paper and project, and change the sample note to `draft: true`.

Filter public collections in `src/lib/content.ts`:

```ts
export function getPapers(): Entry<Paper>[] {
  return readCollection('papers', parseWith(paperSchema))
    .filter(isPublishablePaper)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getProjects(): Entry<Project>[] {
  return readCollection('projects', parseWith(projectSchema))
    .filter(isPublishableProject)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getNotes(): Entry<Note>[] {
  return readCollection('notes', parseWith(noteSchema))
    .filter(isPublishableNote)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}
```

- [ ] **Step 6: Sanitize site identity, links, JSON-LD, and root metadata**

In `site.ts`, replace the hardcoded origin with `resolveProductionOrigin(process.env.NEXT_PUBLIC_SITE_URL)`, export validated contacts, and keep the supplied bio sentences except the unresolved lab-affiliation sentence.

```ts
export const productionOrigin = resolveProductionOrigin(process.env.NEXT_PUBLIC_SITE_URL);

export const publicEmail = asPublicEmail(site.email);
export const publicProfiles = [
  ['GitHub', site.socials.github],
  ['Google Scholar', site.socials.scholar],
  ['HuggingFace', site.socials.huggingface],
  ['ORCID', site.socials.orcid],
  ['LinkedIn', site.socials.linkedin],
] as const;

export const usableProfiles = publicProfiles.flatMap(([label, raw]) => {
  const href = asPublicHttpsUrl(raw);
  return href ? [{ label, href }] : [];
});
```

Make `ProfileLinks` render `usableProfiles` plus the validated email and return `null` when the resulting list is empty. Build Person JSON-LD with conditional object spreads so `url`, `email`, and `sameAs` are absent when invalid. Change root metadata to omit origin-dependent values and emit `{ index: false, follow: false }` until Task 4 replaces this temporary preview-only rule with live readiness.

- [ ] **Step 7: Verify green and commit**

Run: `npm run test:unit`

Expected: PASS with six helper tests.

Run: `npm run test:export`

Expected: PASS for sanitized root output and preview robots metadata.

Run: `npm run lint`

Expected: PASS without warnings.

Commit:

```bash
git add package.json package-lock.json tsconfig.json src tests
git commit -m "feat: add safe preview content gates"
```

---

### Task 2: Base section routes and resolvable navigation

**Files:**
- Create: `src/lib/cv.ts`
- Create: `src/components/PaperList.tsx`
- Create: `src/app/research/page.tsx`
- Create: `src/app/projects/page.tsx`
- Create: `src/app/notes/page.tsx`
- Create: `src/app/cv/page.tsx`
- Modify: `tests/export.test.mjs`
- Verify: `src/components/SiteHeader.tsx`

**Interfaces:**
- Consumes: `getPapers()`, `getProjects()`, `getNotes()`, `site`, and `publicEmail` from Task 1.
- Produces: `hasCvPdf(): boolean` and `cvPdfPath: string`.
- Produces: `PaperList({ label, papers })` for ordered research-entry rendering.
- Produces: static `/research/`, `/projects/`, `/notes/`, and `/cv/` output.
- Consumers: launch readiness and final Browser QA.

- [ ] **Step 1: Extend the export test to require the base routes and resolve root-relative links**

Update the imports, then add these helpers and assertions:

```js
import { access, readFile, readdir } from 'node:fs/promises';

const requiredPages = [
  'index.html',
  'research/index.html',
  'projects/index.html',
  'notes/index.html',
  'cv/index.html',
];

function exportedTarget(href) {
  const pathname = href.split(/[?#]/, 1)[0];
  if (pathname === '/') return path.join(out, 'index.html');
  if (pathname.startsWith('/_next/') || path.extname(pathname)) return path.join(out, pathname.slice(1));
  return path.join(out, pathname.slice(1), 'index.html');
}

async function collectFiles(directory, accept) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(target, accept);
    return accept(target) ? [target] : [];
  }));
  return nested.flat();
}

test('exports base routes and resolves every rendered internal link', async () => {
  for (const relative of requiredPages) await assert.doesNotReject(access(path.join(out, relative)));
  const htmlFiles = await collectFiles(out, (name) => name.endsWith('.html'));
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      await assert.doesNotReject(access(exportedTarget(href)), `${file} links to missing ${href}`);
    }
  }
});
```

- [ ] **Step 2: Run the export test and verify the expected red state**

Run: `npm run test:export`

Expected: FAIL because the four section HTML files do not exist.

- [ ] **Step 3: Add CV presence detection**

```ts
// src/lib/cv.ts
import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

export const cvPdfPath = process.env.PORTFOLIO_CV_PATH
  ? path.resolve(process.env.PORTFOLIO_CV_PATH)
  : path.join(process.cwd(), 'public', 'cv.pdf');

export function hasCvPdf(): boolean {
  return fs.existsSync(cvPdfPath);
}
```

- [ ] **Step 4: Implement the four base routes using existing layout primitives**

Use unique metadata and factual empty states. The research route separates `status === 'in-progress'` from finished work; projects use `.slice(0, 5)`; notes retain newest-first collection order; CV renders only verified identity and education data.

Create the focused list component:

```tsx
// src/components/PaperList.tsx
import Link from 'next/link';

import { Field } from '@/components/Field';
import { recordLine } from '@/lib/paper';
import type { Entry } from '@/lib/content';
import type { Paper } from '@/lib/schemas';

export function PaperList({ label, papers }: { label: string; papers: Entry<Paper>[] }) {
  if (papers.length === 0) return null;
  return (
    <Field label={label}>
      <ul className="space-y-6">
        {papers.map((paper) => (
          <li key={paper.slug}>
            <Link className="link text-[1.3125rem] leading-[1.4]" href={`/research/${paper.slug}/`}>
              {paper.frontmatter.title}
            </Link>
            <p className="meta mt-2">{recordLine(paper.frontmatter)}</p>
          </li>
        ))}
      </ul>
    </Field>
  );
}
```

Representative research structure:

```tsx
export const metadata: Metadata = {
  title: 'Research',
  description: `Research by ${site.name}.`,
};

export default function ResearchPage() {
  const papers = getPapers();
  const finished = papers.filter(({ frontmatter }) => frontmatter.status !== 'in-progress');
  const inProgress = papers.filter(({ frontmatter }) => frontmatter.status === 'in-progress');

  return (
    <div className="record">
      <div className="unlabelled"><h1>Research</h1></div>
      {papers.length === 0 ? (
        <Field label="STATUS"><p>No verified research entries are published yet.</p></Field>
      ) : (
        <>
          <PaperList label="FINISHED WORK" papers={finished} />
          <PaperList label="IN PROGRESS" papers={inProgress} />
        </>
      )}
    </div>
  );
}
```

Use these exact empty-state sentences:

- Research: `No verified research entries are published yet.`
- Projects: `No verified projects are published yet.`
- Notes: `No notes are published yet.`

Implement Projects by mapping `getProjects().slice(0, 5)` inside one `Field`:

```tsx
const projects = getProjects().slice(0, 5);
return (
  <div className="record">
    <div className="unlabelled"><h1>Projects</h1></div>
    <Field label="WORK">
      {projects.length === 0 ? <p>No verified projects are published yet.</p> : (
        <ul className="space-y-8">
          {projects.map(({ slug, frontmatter }) => (
            <li key={slug}>
              <h2 className="text-[1.3125rem] leading-[1.4]">{frontmatter.title}</h2>
              <p className="mt-3">{frontmatter.problem}</p>
              <p className="mt-2">{frontmatter.approach}</p>
              <p className="mt-2">{frontmatter.result}</p>
              <p className="meta mt-3">{frontmatter.stack.join(' · ')} · {frontmatter.status}</p>
              <a className="link meta mt-2 inline-flex min-h-11 items-center" href={frontmatter.repoUrl}>Repository</a>
              {frontmatter.liveUrl ? <a className="link meta ml-5 inline-flex min-h-11 items-center" href={frontmatter.liveUrl}>Live</a> : null}
            </li>
          ))}
        </ul>
      )}
    </Field>
  </div>
);
```

Implement Notes as linked dated records:

```tsx
const notes = getNotes();
return (
  <div className="record">
    <div className="unlabelled"><h1>Notes</h1></div>
    <Field label="NOTES">
      {notes.length === 0 ? <p>No notes are published yet.</p> : (
        <ul className="space-y-6">
          {notes.map(({ slug, frontmatter }) => (
            <li key={slug}>
              <Link className="link text-[1.3125rem] leading-[1.4]" href={`/notes/${slug}/`}>{frontmatter.title}</Link>
              <p className="meta mt-2"><time dateTime={frontmatter.date}>{frontmatter.date}</time></p>
              <p className="mt-2">{frontmatter.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </Field>
  </div>
);
```

The CV page always exists. Render verified identity, focus, and education fields; include the PDF anchor only when `hasCvPdf()` is true:

```tsx
return (
  <div className="record">
    <div className="unlabelled">
      <h1>Curriculum vitae</h1>
      {hasCvPdf() ? <a className="link meta mt-4 inline-flex min-h-11 items-center" href="/cv.pdf" download>Download PDF</a> : null}
    </div>
    <Field label="PROFILE"><p>{site.positioning}</p></Field>
    <Field label="EDUCATION">
      <p>Computer Science and Engineering</p>
      <p className="meta mt-2">{site.affiliation} · {site.location}</p>
    </Field>
  </div>
);
```

- [ ] **Step 5: Confirm the header contract**

Keep Research, Projects, and CV links unconditional. Keep Notes conditional on `getNotes().length > 0`. No public paper links should render while all current papers remain drafts.

- [ ] **Step 6: Verify green and commit**

Run: `npm run test:export`

Expected: PASS for all base route files and every rendered internal link.

Run: `npm run lint`

Expected: PASS.

Commit:

```bash
git add src/app/research src/app/projects src/app/notes src/app/cv src/components/PaperList.tsx src/lib/cv.ts tests/export.test.mjs
git commit -m "feat: add portfolio section routes"
```

---

### Task 3: Dynamic paper and note routes with fixture export coverage

**Files:**
- Create: `src/app/research/[slug]/page.tsx`
- Create: `src/app/notes/[slug]/page.tsx`
- Create: `tests/fixtures/content/papers/fixture-study.mdx`
- Create: `tests/fixtures/content/projects/fixture-project.mdx`
- Create: `tests/fixtures/content/notes/fixture-note.mdx`
- Modify: `src/lib/content.ts`
- Modify: `tests/export.test.mjs`

**Interfaces:**
- Consumes: public content getters and `safeOptionalBody()` from Task 1.
- Produces: `generateStaticParams()` and `generateMetadata()` for both dynamic routes.
- Produces: repeated `citation_author` metadata in source order for papers.
- Produces: test-only `PORTFOLIO_CONTENT_DIR` override for the filesystem content root.

- [ ] **Step 1: Add complete test-only fixture content**

Create the complete paper fixture:

```mdx
---
title: 'Fixture Study'
authors:
  - 'Kamruzzaman Khan Alve'
  - 'Fixture Collaborator'
venue: 'Fixture Conference'
year: 2026
status: 'accepted'
role: 'lead-author'
draft: false
abstract: 'This complete fixture verifies the public paper route.'
takeaway: 'The first fixture sentence is complete. The second fixture sentence verifies the required two-sentence field.'
order: 1
---

This paper body verifies optional MDX rendering.
```

Create the complete project fixture:

```mdx
---
title: 'Fixture Project'
problem: 'A controlled project is needed to verify the public list.'
approach: 'Build the list from the test-only content root.'
result: 'One fixture project is rendered in the static export.'
stack:
  - 'TypeScript'
repoUrl: 'https://github.com/example/fixture'
status: 'archived'
draft: false
order: 1
---
```

Create the complete note fixture:

```mdx
---
title: 'Fixture Note'
date: '2026-08-13'
summary: 'A fixture used only by the export integration test.'
draft: false
---

This note verifies static MDX rendering.
```

- [ ] **Step 2: Extend the export test with a controlled fixture build**

Use a synchronous child build inside one sequential test and restore the normal build in `finally`:

```js
import { spawnSync } from 'node:child_process';

function runBuild(extraEnv = {}) {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

test('exports complete fixture paper and note details', { timeout: 60_000 }, async () => {
  try {
    runBuild({ PORTFOLIO_CONTENT_DIR: path.join(root, 'tests/fixtures/content') });
    const paperHtml = await readFile(path.join(out, 'research/fixture-study/index.html'), 'utf8');
    const noteHtml = await readFile(path.join(out, 'notes/fixture-note/index.html'), 'utf8');
    assert.match(paperHtml, /Fixture Study/);
    assert.match(noteHtml, /This note verifies static MDX rendering\./);
    assert.equal((paperHtml.match(/name="citation_author"/g) ?? []).length, 2);
    assert.ok(paperHtml.indexOf('Kamruzzaman Khan Alve') < paperHtml.indexOf('Fixture Collaborator'));
  } finally {
    runBuild();
  }
});
```

- [ ] **Step 3: Run the export test and verify the expected red state**

Run: `npm run test:export`

Expected: FAIL because `PORTFOLIO_CONTENT_DIR` is ignored and the two fixture detail files are absent.

- [ ] **Step 4: Add the content-root override**

```ts
const configuredContentDir = process.env.PORTFOLIO_CONTENT_DIR;
const CONTENT_DIR = configuredContentDir
  ? path.resolve(configuredContentDir)
  : path.join(process.cwd(), 'src', 'content');
```

Keep all parsing, filename-derived slugs, validation, filtering, and sorting identical across default and fixture roots.

Next.js 16 static export rejects a dynamic route whose `generateStaticParams()` returns an empty array. When a public collection is empty, return the reserved `__empty__` parameter so prerendering can call `notFound()`, then have the build script remove the two reserved output directories. The export test must assert neither reserved URL remains in `out/`. Fixture builds return only their real public slugs, so this compatibility path is unused when content exists.

- [ ] **Step 5: Implement the paper detail route**

Use `generateStaticParams()` from `getPapers()`. Both `generateMetadata()` and the page await `params`, look up through `getPaper(slug)`, and call `notFound()` when absent.

Metadata shape:

```ts
other: {
  citation_title: paper.frontmatter.title,
  citation_author: paper.frontmatter.authors,
  citation_publication_date: String(paper.frontmatter.year),
  ...(paper.frontmatter.status === 'in-progress'
    ? {}
    : { citation_conference_title: paper.frontmatter.venue }),
}
```

Use this route skeleton, then fill the stated fields with existing `Field` primitives:

```tsx
type PaperPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPapers().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PaperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = getPaper(slug);
  if (!paper) notFound();
  return {
    title: paper.frontmatter.title,
    description: paper.frontmatter.takeaway,
    other: {
      citation_title: paper.frontmatter.title,
      citation_author: paper.frontmatter.authors,
      citation_publication_date: String(paper.frontmatter.year),
      ...(paper.frontmatter.status === 'in-progress' ? {} : { citation_conference_title: paper.frontmatter.venue }),
    },
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const paper = getPaper(slug);
  if (!paper) notFound();
  const { frontmatter } = paper;
  const body = safeOptionalBody(paper.body);

  return (
    <article className="record">
      <div className="unlabelled"><h1>{frontmatter.title}</h1></div>
      <Field label="AUTHORS">
        <p>{frontmatter.authors.map((author, index) => (
          <Fragment key={`${author}-${index}`}>
            {index > 0 ? ', ' : null}
            <span className={author === site.name ? 'self' : undefined}>{author}</span>
          </Fragment>
        ))}</p>
      </Field>
      <Field label="STATUS"><p>{recordLine(frontmatter)}</p></Field>
      <Field label="ABSTRACT"><p>{frontmatter.abstract}</p></Field>
      <Field label="TAKEAWAY"><p className="bg-mark px-4 py-3">{frontmatter.takeaway}</p></Field>
      {frontmatter.pdfUrl || frontmatter.codeUrl ? <Field label="LINKS"><p className="flex gap-5">
        {frontmatter.pdfUrl ? <a className="link" href={frontmatter.pdfUrl}>Paper</a> : null}
        {frontmatter.codeUrl ? <a className="link" href={frontmatter.codeUrl}>Code</a> : null}
      </p></Field> : null}
      {frontmatter.bibtex ? <Field label="BIBTEX"><pre><code>{frontmatter.bibtex}</code></pre></Field> : null}
      {body ? <Field label="NOTES"><MDXRemote source={body} /></Field> : null}
    </article>
  );
}
```

The author map preserves source order and wraps only an exact match for `site.name` in `self`. `recordLine()` already suppresses the venue for in-progress work.

- [ ] **Step 6: Implement the note detail route**

Use `generateStaticParams()` from `getNotes()`, unique title/summary metadata, and this page shape:

```tsx
type NotePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getNotes().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const note = getNote((await params).slug);
  if (!note) notFound();
  return { title: note.frontmatter.title, description: note.frontmatter.summary };
}

export default async function NotePage({ params }: NotePageProps) {
  const note = getNote((await params).slug);
  if (!note) notFound();
  return (
    <article className="record">
      <div className="unlabelled">
        <h1>{note.frontmatter.title}</h1>
        <p className="meta mt-3"><time dateTime={note.frontmatter.date}>{note.frontmatter.date}</time></p>
      </div>
      <Field label="SUMMARY"><p>{note.frontmatter.summary}</p></Field>
      <Field label="NOTE"><MDXRemote source={note.body} /></Field>
    </article>
  );
}
```

- [ ] **Step 7: Verify green and commit**

Run: `npm run test:export`

Expected: PASS for normal preview restoration, both fixture dynamic routes, repeated author tags, and author order.

Run: `npm run lint`

Expected: PASS.

Commit:

```bash
git add src/app/research src/app/notes src/lib/content.ts tests
git commit -m "feat: add static content detail routes"
```

---

### Task 4: Launch readiness and static SEO artifacts

**Files:**
- Create: `src/lib/readiness-core.ts`
- Create: `src/lib/readiness.ts`
- Create: `src/lib/seo.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/opengraph-image.png/route.tsx`
- Create: `tests/unit/readiness.test.mjs`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/research/page.tsx`
- Modify: `src/app/projects/page.tsx`
- Modify: `src/app/notes/page.tsx`
- Modify: `src/app/cv/page.tsx`
- Modify: `src/app/research/[slug]/page.tsx`
- Modify: `src/app/notes/[slug]/page.tsx`
- Modify: `tests/export.test.mjs`

**Interfaces:**
- Consumes: `productionOrigin`, `publicEmail`, `usableProfiles`, `getPapers()`, and `hasCvPdf()`.
- Produces: `evaluateLaunchReadiness(input: ReadinessInput): boolean` from the pure core module.
- Produces: `getLaunchReadiness(): { isReady: boolean; origin: URL | null }`.
- Produces: `absoluteUrl(pathname: string): URL | undefined` and `routeMetadata(options): Metadata`.
- Produces: preview-safe `robots.txt`, `sitemap.xml`, and `/opengraph-image.png`.

- [ ] **Step 1: Add readiness unit tests and SEO artifact assertions**

```js
// tests/unit/readiness.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateLaunchReadiness } from '../../src/lib/readiness-core.ts';

const complete = {
  hasOrigin: true,
  hasEmail: true,
  profileCount: 5,
  paperCount: 1,
  hasCv: true,
};

test('requires every launch input', () => {
  assert.equal(evaluateLaunchReadiness(complete), true);
  for (const key of Object.keys(complete)) {
    const value = key === 'profileCount' || key === 'paperCount' ? 0 : false;
    assert.equal(evaluateLaunchReadiness({ ...complete, [key]: value }), false, key);
  }
});
```

Extend `tests/export.test.mjs` to require `robots.txt`, `sitemap.xml`, and `opengraph-image.png`; assert preview robots contains `Disallow: /`; assert the sitemap contains no `<url>` element.

- [ ] **Step 2: Run tests and verify the expected red state**

Run: `npm run test:unit`

Expected: FAIL because `src/lib/readiness-core.ts` does not exist.

Run: `npm run test:export`

Expected: FAIL because the three SEO artifacts do not exist.

- [ ] **Step 3: Implement readiness and metadata helpers**

```ts
// src/lib/readiness-core.ts
export type ReadinessInput = {
  hasOrigin: boolean;
  hasEmail: boolean;
  profileCount: number;
  paperCount: number;
  hasCv: boolean;
};

export function evaluateLaunchReadiness(input: ReadinessInput): boolean {
  return input.hasOrigin && input.hasEmail && input.profileCount === 5 && input.paperCount > 0 && input.hasCv;
}
```

Assemble live server state separately:

```ts
// src/lib/readiness.ts
import 'server-only';

import { getPapers } from './content';
import { hasCvPdf } from './cv';
import { evaluateLaunchReadiness } from './readiness-core';
import { productionOrigin, publicEmail, usableProfiles } from './site';

export function getLaunchReadiness() {
  const isReady = evaluateLaunchReadiness({
    hasOrigin: productionOrigin !== null,
    hasEmail: publicEmail !== null,
    profileCount: usableProfiles.length,
    paperCount: getPapers().length,
    hasCv: hasCvPdf(),
  });
  return { isReady, origin: productionOrigin };
}
```

```ts
// src/lib/seo.ts
import type { Metadata } from 'next';

import { productionOrigin } from './site';

export function absoluteUrl(pathname: string): URL | undefined {
  return productionOrigin ? new URL(pathname, productionOrigin) : undefined;
}

export function routeMetadata({ title, description, pathname }: {
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const canonical = absoluteUrl(pathname);
  return {
    title,
    description,
    ...(canonical ? {
      alternates: { canonical },
      openGraph: { title, description, url: canonical, images: [new URL('/opengraph-image.png', canonical)] },
      twitter: { card: 'summary_large_image', title, description, images: [new URL('/opengraph-image.png', canonical)] },
    } : {}),
  };
}
```

- [ ] **Step 4: Make root and route metadata readiness-aware**

Replace the static root metadata object with `generateMetadata()`. Preserve the title template and verified description; set `metadataBase`, authors URL, canonical, Open Graph URL/image, and Twitter image only when the origin exists. Use `{ index: isReady, follow: isReady }` for robots.

```ts
export function generateMetadata(): Metadata {
  const { isReady, origin } = getLaunchReadiness();
  const canonical = origin ? new URL('/', origin) : undefined;
  const image = origin ? new URL('/opengraph-image.png', origin) : undefined;
  return {
    ...(origin ? { metadataBase: origin } : {}),
    title: { default: site.name, template: `%s · ${site.name}` },
    description: site.positioning,
    authors: [{ name: site.name, ...(canonical ? { url: canonical } : {}) }],
    creator: site.name,
    robots: { index: isReady, follow: isReady },
    ...(canonical ? {
      alternates: { canonical },
      openGraph: { type: 'profile', siteName: site.name, locale: 'en_US', url: canonical, title: site.name, description: site.positioning, ...(image ? { images: [image] } : {}) },
      twitter: { card: 'summary_large_image', title: site.name, description: site.positioning, ...(image ? { images: [image] } : {}) },
    } : {}),
  };
}
```

Replace each base route's literal metadata with `routeMetadata(...)`. Keep dynamic Google Scholar fields while merging origin-aware title, description, and canonical values.

- [ ] **Step 5: Generate robots, sitemap, and Open Graph image**

Robots behavior:

```ts
export default function robots(): MetadataRoute.Robots {
  const { isReady, origin } = getLaunchReadiness();
  if (!isReady || !origin) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', origin).href,
  };
}
```

Sitemap returns `[]` unless ready. When ready, include base and dynamic paths:

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const { isReady, origin } = getLaunchReadiness();
  if (!isReady || !origin) return [];
  const paths = [
    '/', '/research/', '/projects/', '/notes/', '/cv/',
    ...getPapers().map(({ slug }) => `/research/${slug}/`),
    ...getNotes().map(({ slug }) => `/notes/${slug}/`),
  ];
  return paths.map((pathname) => ({ url: new URL(pathname, origin).href }));
}
```

Implement the Open Graph image as a force-static ordinary route handler at `/opengraph-image.png`, not through the metadata file convention. Next.js auto-injects convention images into preview metadata and otherwise falls back to a localhost `metadataBase`, which violates the origin-omission rule. The ordinary route keeps the asset available while root metadata links it only when a valid production origin exists. Render only verified values in the existing palette:

```tsx
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 84, background: '#f5f6f8', color: '#14181f' }}>
      <div style={{ fontSize: 68 }}>{site.name}</div>
      <div style={{ marginTop: 30, maxWidth: 940, fontSize: 34, lineHeight: 1.35 }}>{site.positioning}</div>
      <div style={{ marginTop: 48, fontSize: 24, color: '#1a3fa0' }}>{site.affiliationShort}</div>
    </div>,
    size,
  );
}
```

- [ ] **Step 6: Verify green and commit**

Run: `npm run test:unit`

Expected: PASS including readiness mutation cases.

Run: `npm run test:export`

Expected: PASS with all SEO artifacts and preview crawl blocking.

Run: `npm run lint`

Expected: PASS.

Commit:

```bash
git add src/app src/lib/readiness-core.ts src/lib/readiness.ts src/lib/seo.ts tests
git commit -m "feat: add launch-ready SEO outputs"
```

---

### Task 5: Complete export audit and project documentation

**Files:**
- Modify: `tests/export.test.mjs`
- Modify: `README.md`
- Modify: `brief.md`

**Interfaces:**
- Consumes: all normal and fixture exports from Tasks 1-4.
- Produces: a single `npm test` release gate and an accurate authoring/deployment contract.

- [ ] **Step 1: Add final export integrity assertions**

Extend the export test to:

```js
const allFiles = await collectFiles(out, () => true);
assert.equal(allFiles.some((file) => file.split(path.sep).some((part) => part.endsWith('.func'))), false);

for (const file of allFiles.filter((name) => name.endsWith('_clientMiddlewareManifest.js'))) {
  const source = await readFile(file, 'utf8');
  assert.match(source, /__MIDDLEWARE_MATCHERS\s*=\s*\[\]/);
}

for (const file of allFiles.filter((name) => name.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  assert.equal(html.includes(unresolved), false, `${file} leaked an unresolved marker`);
  assert.equal(html.includes('todo.invalid'), false, `${file} leaked an invalid origin`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)) {
    const value = JSON.parse(match[1]);
    assert.equal(JSON.stringify(value).includes(unresolved), false);
  }
}
```

Keep the base-route, dynamic-fixture, broken-link, no-index, robots, sitemap, and Scholar metadata assertions from earlier tasks.

- [ ] **Step 2: Run the full release gate**

Run: `npm test`

Expected: PASS with unit tests, normal preview build, fixture build, and restored normal build.

- [ ] **Step 3: Replace the scaffold README with the real project contract**

Use these sections and exact commands:

```markdown
# Research and Engineering Portfolio

## Stack
Next.js 16, React 19, TypeScript, Tailwind CSS 4, filesystem MDX, Zod, and a fully static export.

## Local development
`npm install`, `npm run dev`, `npm run lint`, `npm test`, and `npm run build`.

## Content model
Document every paper, project, and note field, including the required `draft` flag.

## Publishing content
An entry becomes public only after its required fields are complete and `draft` is set to `false`.

## CV and production origin
Place the owner-supplied PDF at `public/cv.pdf` and set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin.

## Deployment
Vercel runs `next build` and serves `out/`; preview output remains non-indexable until launch readiness passes.
```

Explain filename-derived stable slugs, exact author order, safe optional paper bodies, required note bodies, profile/email configuration, the four readiness conditions, and the test-only content/CV environment overrides.

- [ ] **Step 4: Correct the stale middleware acceptance wording in the brief**

Replace the requirement that no client middleware manifest exist with:

```markdown
- [ ] `out/` contains no `.func` directories; if Next.js emits a client middleware manifest, its matcher list is empty
```

- [ ] **Step 5: Verify documentation and commit**

Run: `npm test`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

Run: `git diff --check`

Expected: no output and exit code 0.

Commit:

```bash
git add README.md brief.md tests/export.test.mjs
git commit -m "test: verify static export and document publishing"
```

---

### Task 6: Production verification and rendered QA

**Files:**
- Modify only if a failing check produces a focused regression test and corresponding fix.

**Interfaces:**
- Consumes: the complete implementation and release gate.
- Produces: verified static output plus desktop/mobile and interaction evidence.

- [ ] **Step 1: Run fresh command-line verification**

Run in this order:

```bash
npm test
npm run lint
npm run build
git status --short --branch
```

Expected: all commands exit 0; the final build lists `/`, `/research/`, `/projects/`, `/notes/`, `/cv/`, `/robots.txt`, `/sitemap.xml`, and `/opengraph-image` output; only intended changes are present.

- [ ] **Step 2: Verify the target flow in the in-app Browser**

The flow under test is: home page loads -> Research navigation is activated -> Research page renders an honest non-404 state without runtime errors.

At 1280 by 720 and 375 by 812:

- verify URL and title;
- capture a fresh DOM snapshot;
- confirm no framework error overlay;
- inspect error and warning console logs;
- confirm `scrollWidth <= innerWidth`;
- capture viewport screenshots;
- click Research and verify the URL and Research heading.

- [ ] **Step 3: Fix only evidence-backed failures**

For any failure, add the smallest regression assertion that reproduces it, verify red, implement one focused correction, and rerun the same command or Browser interaction until green.

- [ ] **Step 4: Commit any final focused correction**

If Task 6 changes files:

```bash
git add <the exact regression test and fix files>
git commit -m "fix: resolve final portfolio audit findings"
```

If Task 6 changes no files, make no empty commit.
