import type { Metadata } from 'next';

import { productionOrigin } from '@/lib/site';

export function absoluteUrl(pathname: string): URL | undefined {
  return productionOrigin ? new URL(pathname, productionOrigin) : undefined;
}

export function routeMetadata({
  title,
  description,
  pathname,
}: {
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const canonical = absoluteUrl(pathname);
  const image = absoluteUrl('/opengraph-image.png');

  return {
    title,
    description,
    ...(canonical
      ? {
          alternates: { canonical },
          openGraph: {
            title,
            description,
            url: canonical,
            ...(image ? { images: [image] } : {}),
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(image ? { images: [image] } : {}),
          },
        }
      : {}),
  };
}
