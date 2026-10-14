# Redesign comparison review

Reviewed against all 20 PNGs in `screenshots/` and the seven embedded designs in `screenshots/Portfolio Hero Directions.html`. The supplied HTML is the layout and typography reference. The owner's approved behavior and factual-content rules take precedence over prototype interactions and text.

## Captures

Run the production export and local preview:

```sh
npm run build
npm start
```

In another terminal:

```sh
node portfolio-redesign/tools/compare.mjs http://127.0.0.1:4173
```

The ignored `compare/` folder contains a counterpart for every supplied PNG, plus combined home captures. Desktop captures use 1440 × 900 at DPR 1; mobile captures use 390 × 844 at DPR 2. Hero comparisons use normal viewport screenshots after station transitions settle. The sections-only comparison temporarily hides the header and hero in the capture browser; the real page retains its pinned scroll sequence.

The static Python preview serves Next's exported 404 at `/404.html`. Its own response to arbitrary missing URLs is a Python error page; that preview-server behavior was not changed.

## Remaining differences

| Page                           | Difference                                                                                                                                                           | Reason                                                                                                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home hero                      | Scroll chooses stations; no automatic advance or pause control. The pinned stage adds scroll distance.                                                               | Explicit owner decision.                                                                                                                                                                              |
| Home hero, mobile              | The constellation is hidden while pinned.                                                                                                                            | Explicit owner decision to retain readable design-size text.                                                                                                                                          |
| Home hero                      | Project chips use the actual status, including Web-RAG's `Complete`; some venue labels and descriptions are longer.                                                  | Canonical records and verified copy replace prototype abbreviations and claims.                                                                                                                       |
| Home sections and Projects     | Resume Evaluator and the classifier use actual screenshots and factual captions. Web-RAG, Khata and Taqwa have no media column. Project headline metrics are absent. | No placeholders, empty frames or unverified metrics. These changes also alter card heights and later section positions.                                                                               |
| Home profile                   | The full existing biography remains longer than the prototype's shortened paragraph.                                                                                 | Copy remains sourced from `site.ts`.                                                                                                                                                                  |
| Research                       | Findings include the existing caveats and the thesis supervisor; the prototype-only team label is absent.                                                            | Preserve the authoritative content and its scientific qualifications. Some mobile cards are taller.                                                                                                   |
| Research detail                | The metric note retains the six-encoder context; findings, abstract and result notes retain their full content. The next-record link uses the full paper title.      | Canonical paper metadata and MDX remain authoritative. Longer content changes wrapping and page height.                                                                                               |
| CV                             | Project summaries come from the existing MDX approaches. Profile links retain 44px touch targets, making the links card taller than the prototype.                   | Preserve the content model and accessibility. The existing PDF is unchanged.                                                                                                                          |
| 404                            | The existing paragraph includes the owner's full name, adding a line compared with the prototype.                                                                    | Preserve `notFoundCopy`; centered copy therefore shifts slightly vertically.                                                                                                                          |
| Shared decoration and controls | Star positions, glow strength and animation phases differ. Small arrow-glyph and control-height differences remain.                                                  | Existing deterministic Starfield and subtle site-wide CursorGlow are preserved. Local font fallbacks and 44px hit areas are retained. Animation screenshots represent a moment in a running sequence. |

The result follows the supplied design, with these documented exceptions; it is not a byte-for-byte or pixel-identical copy of the prototype.

## Validation

- `npm run lint` and `npm test` passed before every implementation commit: 27 unit tests and 13 export tests.
- All nine exported routes were checked at 1440, 768, 390, 375 and 320px: home, projects, research, all three research details, CV, notes and the exported 404.
- No horizontal overflow, broken images or JavaScript errors were found in those 45 route/viewport checks.
- All five hero stations were exercised at all five widths, including pinned fit, station-button scrolling, continuation to selected work and the mobile constellation rule.
- Keyboard focus, 44px controls and reduced motion were checked. Filters, engineering-note toggles, clipboard success and failure, no-JavaScript content and the CV download were exercised.
- `public/cv.pdf` retains SHA-256 `40947b64a1bb103935b804530e17db05fe239d53f74454158ec03ed7649a456f`.
- Robots, sitemap, readiness, publishability, content loading, static-export configuration and route pruning were not changed from the preserved checkpoint.

All work is local on `redesign-fixes`. No push or deployment was performed; the existing five unpushed commits on `main` remain untouched. New commits use the owner's author and committer identity without contributor trailers.
