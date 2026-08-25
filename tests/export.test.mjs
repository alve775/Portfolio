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
  if (!Object.hasOwn(extraEnv, 'PORTFOLIO_CONTENT_DIR')) {
    delete env.PORTFOLIO_CONTENT_DIR;
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

test('exports the complete semantic research-flight fallback', async () => {
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  const stationIds = ['identity', 'language', 'security', 'systems', 'contact'];
  const stationPositions = stationIds.map((id) =>
    html.indexOf(`id="flight-station-${id}"`),
  );

  assert.match(html, /data-research-flight/);
  assert.match(html, /<canvas[^>]+aria-hidden="true"/);
  assert.deepEqual(
    stationPositions.every((position) => position >= 0),
    true,
    'every research station should be present in exported HTML',
  );
  assert.deepEqual(
    [...stationPositions].sort((a, b) => a - b),
    stationPositions,
    'research stations should retain logical document order',
  );
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  assert.equal((html.match(/aria-pressed="true"/g) ?? []).length, 1);

  for (const id of stationIds) {
    assert.match(html, new RegExp(`aria-controls="flight-station-${id}"`));
  }

  assert.match(html, /data-research-index/);
  assert.match(html, /Profile/);
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
    assert.match(rootHtml, /<meta name="robots" content="noindex, nofollow"/);
    assert.match(fixtureRobots, /Disallow: \/(?:\r?\n|$)/);
    assert.doesNotMatch(fixtureSitemap, /<url>/);
    assert.match(paperHtml, /Fixture Study/);
    assert.match(paperHtml, /This paper body verifies optional MDX rendering\./);
    assert.match(noteHtml, /This note verifies static MDX rendering\./);
    assert.match(projectHtml, /Fixture Project/);
    assert.match(researchHtml, /href="\/research\/fixture-study\/"/);
    assert.match(notesHtml, /href="\/notes\/fixture-note\/"/);
    assert.match(rootHtml, /data-design="quiet-technical"/);
    assert.match(rootHtml, /data-research-flight/);
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
