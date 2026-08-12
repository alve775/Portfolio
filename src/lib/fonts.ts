import localFont from 'next/font/local';

/**
 * Self-hosted, subset to latin. No third-party font requests at runtime.
 *
 * Charis SIL carries the reading (a Bitstream Charter derivative — the register
 * of a well-set technical report). Fira Mono carries every piece of metadata.
 * Both OFL 1.1; licences ship alongside the files in public/fonts/.
 */

export const charis = localFont({
  src: [
    { path: '../../public/fonts/charis-sil-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/charis-sil-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../public/fonts/charis-sil-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-charis',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['Charter', 'Georgia', 'serif'],
});

export const firaMono = localFont({
  src: [
    { path: '../../public/fonts/fira-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-fira-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});

/**
 * Bangla coverage. Charis SIL has no Bengali glyphs, so a Bangla paper title or
 * dataset name would render as tofu on the site whose subject is Bangla NLP.
 *
 * The `unicode-range` descriptor means this file is only downloaded when Bengali
 * codepoints are actually painted: zero cost on pages without them.
 */
export const notoSerifBengali = localFont({
  src: [
    {
      path: '../../public/fonts/noto-serif-bengali-bengali-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-bengali',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['serif'],
  // Critical: next/font preloads every declared face by default, which would
  // fetch this 57 KB file on every page whether or not any Bangla is on it.
  // Without this the unicode-range below buys nothing.
  preload: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0951-0952,U+0964-0965,U+0980-09FE,U+1CD0,U+1CD2,U+1CD5-1CD6,U+1CD8,U+1CE1,U+1CEA,U+1CED,U+1CF2,U+1CF5-1CF7,U+200C-200D,U+20B9,U+25CC,U+A8F1',
    },
  ],
});

/** Applied once, on <html>, in the root layout. */
export const fontVariables = `${charis.variable} ${firaMono.variable} ${notoSerifBengali.variable}`;
