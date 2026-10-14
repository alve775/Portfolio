// Screenshot the built site at the same sizes as portfolio-redesign/screenshots/,
// so each page can be compared side by side with its design.
//
// Usage (from the repo root, with the production preview running via `npm run build && npm start`):
//   node portfolio-redesign/tools/compare.mjs http://127.0.0.1:4173
// Output: portfolio-redesign/compare/<page>--desktop.png and <page>--mobile.png
//
// Needs the `playwright` package. If the repo does not have it:
//   npm i -D playwright && npx playwright install chromium
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const out = path.join('portfolio-redesign', 'compare');
fs.mkdirSync(out, { recursive: true });

// page name -> route. Names match the design screenshots (home = 01 hero + 02 sections).
const routes = {
  '01-02-home': '/',
  '03-projects': '/projects/',
  '04-research': '/research/',
  '05-research-detail': '/research/bangla-sentence-type-classification/',
  '06-cv': '/cv/',
  // Python's static preview does not route missing URLs to Next's exported 404.
  '07-not-found': '/404.html',
};
const sizes = [
  { name: 'desktop', width: 1440, height: 900, scale: 1 },
  { name: 'mobile', width: 390, height: 844, scale: 2 },
];
// Scroll-linked reveals start hidden below the fold; show them for full-page captures.
const settle =
  '[style*="animation-timeline"],.reveal{animation:none !important;opacity:1 !important;transform:none !important}';

const browser = await chromium.launch();
const report = [];
for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height },
    deviceScaleFactor: s.scale,
  });
  for (const [name, route] of Object.entries(routes)) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: settle });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);
    const overflowPx = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    if (route === '/') {
      // Full-page capture can change the pinned stage and catch drawing edges.
      // Keep a normal viewport capture for the hero's actual visible layout.
      await page.screenshot({
        path: path.join(out, `01-home-hero--${s.name}.png`),
      });
    }
    await page.screenshot({
      path: path.join(out, `${name}--${s.name}.png`),
      fullPage: true,
    });
    report.push(
      `${name} [${s.name}]` +
        (overflowPx > 0 ? ` HORIZONTAL OVERFLOW ${overflowPx}px` : '') +
        (errors.length ? ` JS ERRORS: ${errors.join(' | ')}` : ''),
    );
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(report.join('\n'));
console.log(
  `\nScreenshots written to ${out}/. Compare each with portfolio-redesign/screenshots/.`,
);
