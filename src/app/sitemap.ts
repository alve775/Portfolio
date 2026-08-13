import type { MetadataRoute } from 'next';

import { getNotes, getPapers } from '@/lib/content';
import { getLaunchReadiness } from '@/lib/readiness';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const { isReady, origin } = getLaunchReadiness();
  if (!isReady || !origin) return [];

  const paths = [
    '/',
    '/research/',
    '/projects/',
    '/notes/',
    '/cv/',
    ...getPapers().map(({ slug }) => `/research/${slug}/`),
    ...getNotes().map(({ slug }) => `/notes/${slug}/`),
  ];

  return paths.map((pathname) => ({ url: new URL(pathname, origin).href }));
}
