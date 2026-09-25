import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const fonts = await readFile('src/lib/fonts.ts', 'utf8');
const css = await readFile('src/app/globals.css', 'utf8');
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

test('uses the approved self-hosted quiet-technical foundation', () => {
  assert.match(fonts, /export const instrumentSans/);
  assert.match(fonts, /instrument-sans-variable\.ttf/);
  assert.doesNotMatch(fonts, /export const charis/);
  assert.match(css, /--canvas:\s*#f5f7f6/i);
  assert.match(css, /--signal:\s*#3f6f5e/i);
  // The old mint must not survive in any hardcoded homepage override.
  assert.doesNotMatch(css, /#69e4bd/i);
  assert.match(css, /font-family:\s*var\(--font-sans\)/);
});

test('keeps the spatial homepage on built-in browser primitives', () => {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  for (const forbidden of ['three', '@react-three/fiber', 'gsap']) {
    assert.equal(dependencies[forbidden], undefined);
  }
});
