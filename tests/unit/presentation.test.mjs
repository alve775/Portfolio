import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const fonts = await readFile('src/lib/fonts.ts', 'utf8');
const css = await readFile('src/app/globals.css', 'utf8');

test('uses the approved self-hosted quiet-technical foundation', () => {
  assert.match(fonts, /export const instrumentSans/);
  assert.match(fonts, /instrument-sans-variable\.ttf/);
  assert.doesNotMatch(fonts, /export const charis/);
  assert.match(css, /--canvas:\s*#f6f7f4/i);
  assert.match(css, /--signal:\s*#0d6b57/i);
  assert.match(css, /font-family:\s*var\(--font-sans\)/);
});
