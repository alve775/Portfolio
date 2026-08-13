import type { MetadataRoute } from 'next';

import { getLaunchReadiness } from '@/lib/readiness';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const { isReady, origin } = getLaunchReadiness();

  if (!isReady || !origin) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', origin).href,
  };
}
