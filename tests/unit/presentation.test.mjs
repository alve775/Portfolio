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

test('keeps the home hero readable instead of billboard sized', () => {
  const heroNameRules = [...css.matchAll(/\.hero-name\s*\{([^}]*)\}/g)];
  const heroThesisRules = [...css.matchAll(/\.hero-thesis\s*\{([^}]*)\}/g)];

  assert.match(heroNameRules[0][1], /max-width:\s*14ch/);
  assert.match(
    heroNameRules[0][1],
    /font-size:\s*clamp\(1\.6rem,\s*2\.2vw,\s*2rem\)/,
  );
  assert.match(heroNameRules[0][1], /overflow-wrap:\s*break-word/);

  assert.match(heroThesisRules[0][1], /max-width:\s*21ch/);
  assert.match(
    heroThesisRules[0][1],
    /font-size:\s*clamp\(2\.4rem,\s*4\.5vw,\s*4\.15rem\)/,
  );
  assert.match(heroThesisRules[0][1], /line-height:\s*1\.04/);
  assert.match(
    heroThesisRules[1][1],
    /font-size:\s*clamp\(2\.15rem,\s*8vw,\s*3\.25rem\)/,
  );
});
