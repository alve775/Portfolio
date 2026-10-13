import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const out = path.join(root, 'out');
const unresolved = ['{{', 'TO', 'DO'].join('');
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
  if (pathname.startsWith('/_next/') || path.extname(pathname)) {
    return path.join(out, pathname.slice(1));
  }
  return path.join(out, pathname.slice(1), 'index.html');
}

async function collectFiles(directory, accept) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(target, accept);
      return accept(target) ? [target] : [];
    }),
  );
  return nested.flat();
}

function runBuild(extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };
  for (const key of ['PORTFOLIO_CONTENT_DIR', 'PORTFOLIO_CV_PATH', 'PORTFOLIO_INCLUDE_DRAFTS', 'NEXT_PUBLIC_SITE_URL', 'VERCEL_ENV']) {
    if (!Object.hasOwn(extraEnv, key)) delete env[key];
  }

  const result = spawnSync('npm', ['run', 'build'], {
    cwd: root,
    env,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /metadataBase property .* is not set/);
}

test('preview root contains no unresolved public values and is not indexable', async () => {
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  assert.equal(html.includes(unresolved), false, 'root HTML leaked an unresolved marker');
  assert.equal(html.includes('todo.invalid'), false, 'root HTML leaked the invalid placeholder origin');
  assert.equal(html.includes('http://localhost'), false, 'root HTML leaked a fallback origin');
  assert.doesNotMatch(html, /property="og:image"/);
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);

  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
  )) {
    assert.doesNotThrow(() => JSON.parse(match[1]));
  }
});

test('exports the accessible station hero and real selected-work destinations', async () => {
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  const ids = ['identity', 'projects', 'ai', 'research', 'contact'];
  const positions = ids.map(id => html.indexOf(`id="station-${id}"`));
  assert.ok(positions.every(position => position >= 0));
  assert.deepEqual([...positions].sort((a,b)=>a-b), positions);
  assert.match(html, /data-station-hero/);
  assert.match(html, /starfield-strong/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  assert.match(html, /Pause automatic station changes/);
  assert.match(html, /<noscript>/);
  assert.match(html, /id="selected-work" tabindex="-1"/);
  for (const id of ids) assert.ok(html.includes(`aria-controls="station-${id}"`));
  for (const href of ['/cv/', '/projects/', '/research/', '#selected-work']) assert.ok(html.includes(`href="${href}"`));
  assert.match(html, /Try the classifier/);
  assert.match(html, /97.61%/);
  assert.match(html, /5,100-sentence test split/);
});

test('presents a hybrid professional journey with projects before research', async () => {
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  const projectsPosition = html.indexOf('data-project-index');
  const researchPosition = html.indexOf('data-research-index');
  const projectsNavPosition = html.indexOf('href="/projects/"');
  const researchNavPosition = html.indexOf('href="/research/"');

  assert.match(html, /aria-controls="station-projects"/);
  assert.match(html, /aria-controls="station-ai"/);
  assert.match(html, /aria-controls="station-research"/);
  assert.deepEqual(projectsPosition >= 0, true, 'the landing page should include projects');
  assert.deepEqual(researchPosition >= 0, true, 'the landing page should include research');
  assert.deepEqual(
    projectsPosition < researchPosition,
    true,
    'projects should appear before research in the landing-page proof sections',
  );
  assert.deepEqual(
    projectsNavPosition < researchNavPosition,
    true,
    'projects should appear before research in the global navigation',
  );
});

test('presents the undergraduate thesis as leakage-safe ADHD EEG research', async () => {
  const html = await readFile(path.join(out, 'index.html'), 'utf8');

  assert.match(html, /leakage-safe ADHD EEG framework/i);
  assert.match(html, /subject-level validation/);
  assert.doesNotMatch(
    html,
    /undergraduate thesis on adversarial robustness in fingerprint presentation attack detection/i,
  );
});

test('exports preview-safe discovery artifacts', async () => {
  for (const relative of ['robots.txt', 'sitemap.xml', 'opengraph-image.png']) {
    await assert.doesNotReject(access(path.join(out, relative)));
  }

  const robots = await readFile(path.join(out, 'robots.txt'), 'utf8');
  const sitemap = await readFile(path.join(out, 'sitemap.xml'), 'utf8');
  const image = await readFile(path.join(out, 'opengraph-image.png'));
  assert.match(robots, /Disallow: \/(?:\r?\n|$)/);
  assert.doesNotMatch(sitemap, /<url>/);
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test('exports a shared decorative starfield and content-backed navigation on every page', async () => {
  let firstField;
  for (const relative of [...requiredPages, '404.html', 'research/bangla-sentence-type-classification/index.html']) {
    const html = await readFile(path.join(out, relative), 'utf8');
    const fields = [...html.matchAll(/<div class="starfield starfield-soft" aria-hidden="true">([\s\S]*?)<\/div>/g)];
    assert.equal(fields.length, 1, `${relative} must contain exactly one shared field`);
    const field = fields[0][1];
    assert.equal((field.match(/class="starfield-star"/g) ?? []).length, 40);
    firstField ??= field;
    assert.equal(field, firstField, `${relative} must use the same deterministic positions`);
    assert.match(html, /href="#main" class="skip-link">Skip to content<\/a>/);
    assert.match(html, /<main id="main" tabindex="-1"/);
    const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)?.[1] ?? '';
    assert.doesNotMatch(header, /href="\/notes\/"/, 'empty notes stay out of navigation');
    assert.match(header, /<a(?=[^>]*class="site-brand")(?=[^>]*href="\/")/);
    if (relative.startsWith('research/')) {
      assert.match(header, /<a(?=[^>]*href="\/research\/")(?=[^>]*aria-current="page")/);
    }
    const footer = html.match(/<footer class="site-footer">([\s\S]*?)<\/footer>/)?.[1] ?? '';
    assert.match(footer, /Kamruzzaman Khan Alve/);
    assert.match(footer, /RUET.*Rajshahi, Bangladesh/);
    assert.equal((footer.match(/target="_blank"/g) ?? []).length, 4);
    assert.equal((footer.match(/rel="me noopener noreferrer"/g) ?? []).length, 5);
    assert.doesNotMatch(html, /<link[^>]+href="https:\/\/fonts\.(googleapis|gstatic)\.com/);
  }
});

test('uses validated mailto destinations throughout the static export', async () => {
  for (const relative of [...requiredPages, '404.html', 'research/bangla-sentence-type-classification/index.html', 'research/vocabulary-difficulty-prediction/index.html', 'research/leakage-safe-adhd-eeg-framework/index.html']) {
    const html = await readFile(path.join(out, relative), 'utf8');
    const anchors = [...html.matchAll(/<a\b[^>]*href="mailto:[^"]+"[^>]*>/g)].map((match) => match[0]);
    assert.ok(anchors.length >= 2, `${relative} must expose the shared email links`);
    for (const anchor of anchors) {
      assert.match(anchor, /href="mailto:kamruzzamanalve@gmail.com"/);
      assert.doesNotMatch(anchor, /target="_blank"/);
    }
    assert.doesNotMatch(html, /https:\/\/mail.google.com\/mail\//);
  }
});

test('publishes the verified portfolio content and supplied CV', async () => {
  const projects = await readFile(path.join(out, 'projects/index.html'), 'utf8');
  const cv = await readFile(path.join(out, 'cv/index.html'), 'utf8');
  const paper = await readFile(path.join(out, 'research/bangla-sentence-type-classification/index.html'), 'utf8');
  const bea = await readFile(path.join(out, 'research/vocabulary-difficulty-prediction/index.html'), 'utf8');
  const thesis = await readFile(path.join(out, 'research/leakage-safe-adhd-eeg-framework/index.html'), 'utf8');
  assert.equal((projects.match(/<article[^>]+data-project-card/g) ?? []).length, 5);
  for (const title of ['Resume Evaluator', 'Web-RAG', 'Bangla Sentence Classifier', 'Grocery Shopping Tracker', 'NoorTime']) {
    assert.ok(projects.includes(title), title);
  }
  assert.match(projects, /My contribution/);
  assert.match(projects, /Key decision/);
  assert.match(projects, /Limitation/);
  const screenshots = [...projects.matchAll(/<img[^>]+src="(\/images\/projects\/[^\"]+)"/g)];
  assert.equal(screenshots.length, 2, 'both published project screenshots must render');
  for (const [, src] of screenshots) {
    await assert.doesNotReject(access(exportedTarget(src)), `missing screenshot ${src}`);
  }
  assert.match(cv, /href="\/cv.pdf" download/);
  assert.match(cv, /3.71\/4.00/);
  assert.match(cv, /Code Studio/);
  assert.doesNotMatch(cv, /final-semester/);
  assert.match(cv, /href="mailto:kamruzzamanalve@gmail.com"/);
  assert.doesNotMatch(cv, /https:\/\/mail.google.com\/mail\//);
  assert.deepEqual(
    await readFile(path.join(out, 'cv.pdf')),
    await readFile(path.join(root, 'public/cv.pdf')),
  );
  assert.deepEqual(
    [...paper.matchAll(/<meta name="citation_author" content="([^"]+)"/g)].map((m) => m[1]),
    ['Kamruzzaman Khan Alve', 'Nahid Montasir Rifat', 'Mir Ashikur Rahman', 'Mohiuddin Ahmed'],
  );
  assert.deepEqual(
    [...bea.matchAll(/<meta name="citation_author" content="([^"]+)"/g)].map((m) => m[1]),
    ['Abid Al Hossain', 'Kamruzzaman Khan Alve'],
  );
  assert.match(thesis, /undergraduate thesis/);
  assert.match(thesis, /citation_dissertation_institution/);
  assert.doesNotMatch(thesis, /citation_conference_title/);
});

test('exports filter controls, exact model results, and thesis-specific details', async () => {
  const projects = await readFile(path.join(out, 'projects/index.html'), 'utf8');
  const paper = await readFile(path.join(out, 'research/bangla-sentence-type-classification/index.html'), 'utf8');
  const thesis = await readFile(path.join(out, 'research/leakage-safe-adhd-eeg-framework/index.html'), 'utf8');
  assert.match(projects, /aria-label="Filter projects"/);
  assert.match(projects, /aria-pressed="true"/);
  assert.match(projects, /<details[^>]+class="engineering-notes"/);
  assert.match(paper, /Copy BibTeX/);
  assert.match(paper, /role="status"/);
  assert.match(paper, /97.57%/);
  assert.match(paper, /5,100-sentence test split/);
  assert.match(paper, /Previous record/);
  assert.match(thesis, /Overview/);
  assert.match(thesis, /Md. Azmain Yakin Srizon/);
  assert.doesNotMatch(thesis, /class="detail-metric-panel"/);
  assert.doesNotMatch(thesis, /Read the paper/);
});

test('exports base routes and resolves every rendered internal link', async () => {
  for (const relative of requiredPages) {
    await assert.doesNotReject(access(path.join(out, relative)));
  }
  await assert.rejects(access(path.join(out, 'research/__empty__/index.html')));
  await assert.rejects(access(path.join(out, 'notes/__empty__/index.html')));

  const htmlFiles = await collectFiles(out, (name) => name.endsWith('.html'));
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith('/') || href.startsWith('//')) continue;
      await assert.doesNotReject(
        access(exportedTarget(href)),
        `${file} links to missing ${href}`,
      );
    }
  }
});

test('contains only sanitized static output', async () => {
  const allFiles = await collectFiles(out, () => true);
  assert.equal(
    allFiles.some((file) => file.split(path.sep).some((part) => part.endsWith('.func'))),
    false,
  );

  for (const file of allFiles.filter((name) =>
    name.endsWith('_clientMiddlewareManifest.js'),
  )) {
    const source = await readFile(file, 'utf8');
    assert.match(source, /__MIDDLEWARE_MATCHERS\s*=\s*\[\]/);
  }

  for (const file of allFiles.filter((name) => name.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    assert.equal(html.includes(unresolved), false, `${file} leaked an unresolved marker`);
    assert.equal(html.includes('todo.invalid'), false, `${file} leaked an invalid origin`);
    assert.equal(html.includes('http://localhost'), false, `${file} leaked a fallback origin`);

    for (const match of html.matchAll(
      /<script type="application\/ld\+json">([^<]+)<\/script>/g,
    )) {
      const value = JSON.parse(match[1]);
      assert.equal(JSON.stringify(value).includes(unresolved), false);
    }
  }
});

test('exports complete fixture paper and note details', { timeout: 60_000 }, async () => {
  try {
    runBuild({
      PORTFOLIO_CONTENT_DIR: path.join(root, 'tests/fixtures/content'),
      NEXT_PUBLIC_SITE_URL: 'https://portfolio.rfc-editor.org',
      VERCEL_ENV: 'production',
    });
    const rootHtml = await readFile(path.join(out, 'index.html'), 'utf8');
    const paperHtml = await readFile(
      path.join(out, 'research/fixture-study/index.html'),
      'utf8',
    );
    const noteHtml = await readFile(path.join(out, 'notes/fixture-note/index.html'), 'utf8');
    const projectHtml = await readFile(path.join(out, 'projects/index.html'), 'utf8');
    const researchHtml = await readFile(path.join(out, 'research/index.html'), 'utf8');
    const notesHtml = await readFile(path.join(out, 'notes/index.html'), 'utf8');
    const cvHtml = await readFile(path.join(out, 'cv/index.html'), 'utf8');
    const fixtureRobots = await readFile(path.join(out, 'robots.txt'), 'utf8');
    const fixtureSitemap = await readFile(path.join(out, 'sitemap.xml'), 'utf8');
    assert.match(rootHtml, /<link rel="canonical" href="https:\/\/portfolio\.rfc-editor\.org\/"/);
    assert.match(
      rootHtml,
      /<meta property="og:image" content="https:\/\/portfolio\.rfc-editor\.org\/opengraph-image\.png"/,
    );
    assert.match(
      paperHtml,
      /<link rel="canonical" href="https:\/\/portfolio\.rfc-editor\.org\/research\/fixture-study\/"/,
    );
    assert.match(
      paperHtml,
      /<meta property="og:image" content="https:\/\/portfolio\.rfc-editor\.org\/opengraph-image\.png"/,
    );
    assert.match(rootHtml, /<meta name="robots" content="index, follow"/);
    assert.match(fixtureRobots, /Allow: \/(?:\r?\n|$)/);
    assert.match(fixtureSitemap, /<url>/);
    assert.match(paperHtml, /Fixture Study/);
    assert.match(paperHtml, /This paper body verifies optional MDX rendering\./);
    assert.match(noteHtml, /This note verifies static MDX rendering\./);
    assert.match(projectHtml, /Fixture Project/);
    assert.match(rootHtml, /Fixture Project/);
    assert.match(researchHtml, /href="\/research\/fixture-study\/"/);
    assert.match(notesHtml, /href="\/notes\/fixture-note\/"/);
    assert.match(rootHtml, /data-design="constellation"/);
    assert.match(rootHtml, /data-station-hero/);
    assert.match(rootHtml, /data-research-index/);
    assert.match(researchHtml, /data-research-index/);
    assert.match(researchHtml, /data-research-entry/);
    assert.match(paperHtml, /data-research-detail/);
    assert.match(projectHtml, /data-project-index/);
    assert.match(notesHtml, /data-note-index/);
    assert.match(cvHtml, /data-cv-grid/);
    assert.deepEqual(
      [...paperHtml.matchAll(/<meta name="citation_author" content="([^"]+)"/g)].map(
        (match) => match[1],
      ),
      ['Kamruzzaman Khan Alve', 'Fixture Collaborator'],
    );
  } finally {
    runBuild();
  }
});

test('blocks preview deployments even with a valid production origin', { timeout: 60_000 }, async () => {
  try {
    runBuild({
      NEXT_PUBLIC_SITE_URL: 'https://portfolio.rfc-editor.org',
      VERCEL_ENV: 'preview',
    });
    const html = await readFile(path.join(out, 'index.html'), 'utf8');
    const robots = await readFile(path.join(out, 'robots.txt'), 'utf8');
    const sitemap = await readFile(path.join(out, 'sitemap.xml'), 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    assert.match(robots, /Disallow: \/(?:\r?\n|$)/);
    assert.doesNotMatch(sitemap, /<url>/);
  } finally {
    runBuild();
  }
});
