import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const fonts = await readFile('src/lib/fonts.ts', 'utf8');
const css = await readFile('src/app/globals.css', 'utf8');
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

test('uses the approved constellation theme and build-time self-hosted fonts', () => {
  assert.match(fonts, /import.*IBM_Plex_Mono.*Manrope.*from 'next\/font\/google'/);
  assert.match(fonts, /export const manrope = Manrope/);
  assert.match(fonts, /export const ibmPlexMono = IBM_Plex_Mono/);
  assert.match(fonts, /notoSerifBengali/);
  assert.match(fonts, /preload: false/);
  assert.match(css, /@theme static/);
  assert.match(css, /--color-bg:\s*#121715/i);
  assert.match(css, /--color-accent:\s*#a9d9c6/i);
  assert.doesNotMatch(css, /prefers-color-scheme/);
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
