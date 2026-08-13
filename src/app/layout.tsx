import type { Metadata } from 'next';

import { PersonJsonLd } from '@/components/PersonJsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { fontVariables } from '@/lib/fonts';
import { site } from '@/lib/site';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.positioning,
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: 'profile',
    siteName: site.name,
    locale: 'en_US',
    title: site.name,
    description: site.positioning,
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="link meta sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:bg-paper focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="shell grow py-16">
          {children}
        </main>
        <SiteFooter />
        <PersonJsonLd />
      </body>
    </html>
  );
}
