import type { Metadata } from 'next';

import { CursorGlow } from '@/components/CursorGlow';
import { PersonJsonLd } from '@/components/PersonJsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { Starfield } from '@/components/Starfield';
import { fontVariables } from '@/lib/fonts';
import { getLaunchReadiness } from '@/lib/readiness';
import { site } from '@/lib/site';

import './globals.css';
import './redesign.css';

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
      <body data-design="constellation" className="site-body">
        <Starfield />
        <CursorGlow />
        <a
          href="#main"
          className="skip-link"
        >
          {site.chrome.skipToContent}
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="site-shell main-content">
          {children}
        </main>
        <SiteFooter />
        <PersonJsonLd />
      </body>
    </html>
  );
}
