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

  for (const match of html.matchAll(
    /<script type="application\/ld\+json">([^<]+)<\/script>/g,
  )) {
    assert.doesNotThrow(() => JSON.parse(match[1]));
  }
});
