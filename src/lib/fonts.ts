import localFont from 'next/font/local';

/** Self-hosted variable sans. No third-party font request is made at runtime. */
export const instrumentSans = localFont({
  src: '../../public/fonts/instrument-sans-variable.ttf',
  variable: '--font-instrument-sans',
  display: 'swap',
  weight: '400 700',
  style: 'normal',
  fallback: ['Inter', 'Avenir Next', 'Helvetica Neue', 'Arial', 'sans-serif'],
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
 * Bangla coverage. Instrument Sans has no Bengali glyphs, so a Bangla paper
 * title or dataset name needs an explicit fallback on this Bangla NLP site.
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
export const fontVariables = `${instrumentSans.variable} ${firaMono.variable} ${notoSerifBengali.variable}`;
