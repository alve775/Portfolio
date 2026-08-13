import assert from 'node:assert/strict';
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

test('preview root contains no unresolved public values and is not indexable', async () => {
  const html = await readFile(path.join(out, 'index.html'), 'utf8');
  assert.equal(html.includes(unresolved), false, 'root HTML leaked an unresolved marker');
  assert.equal(html.includes('todo.invalid'), false, 'root HTML leaked the invalid placeholder origin');
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);

  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
  )) {
    assert.doesNotThrow(() => JSON.parse(match[1]));
  }
});

test('exports base routes and resolves every rendered internal link', async () => {
  for (const relative of requiredPages) {
    await assert.doesNotReject(access(path.join(out, relative)));
  }

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
