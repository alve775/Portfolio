import type { Metadata } from 'next';

import { PersonJsonLd } from '@/components/PersonJsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { fontVariables } from '@/lib/fonts';
import { getLaunchReadiness } from '@/lib/readiness';
import { site } from '@/lib/site';

import './globals.css';

export function generateMetadata(): Metadata {
  const { isReady, origin } = getLaunchReadiness();
  const canonical = origin ? new URL('/', origin) : undefined;
  const image = origin ? new URL('/opengraph-image.png', origin) : undefined;

  return {
    ...(origin ? { metadataBase: origin } : {}),
    title: {
      default: site.name,
      template: `%s · ${site.name}`,
    },
    description: site.positioning,
    authors: [{ name: site.name, ...(canonical ? { url: canonical } : {}) }],
    creator: site.name,
    robots: { index: isReady, follow: isReady },
    ...(canonical
      ? {
          alternates: { canonical },
          openGraph: {
            type: 'profile' as const,
            siteName: site.name,
            locale: 'en_US',
            url: canonical,
            title: site.name,
            description: site.positioning,
            ...(image ? { images: [image] } : {}),
          },
          twitter: {
            card: 'summary_large_image' as const,
            title: site.name,
            description: site.positioning,
            ...(image ? { images: [image] } : {}),
          },
        }
      : {}),
  };
}

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
