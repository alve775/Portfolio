import { IBM_Plex_Mono, Manrope } from 'next/font/google';
import localFont from 'next/font/local';

/** Downloaded at build time and self-hosted in the static export. */
export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

/**
 * Bangla coverage. Manrope has no Bengali glyphs, so a Bangla paper
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
export const fontVariables = `${manrope.variable} ${ibmPlexMono.variable} ${notoSerifBengali.variable}`;
