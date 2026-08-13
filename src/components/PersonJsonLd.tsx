import { productionOrigin, publicEmail, site, usableProfiles } from '@/lib/site';

/**
 * schema.org Person for the root layout.
 *
 * Optional fields are emitted only after their public values validate.
 */
export function PersonJsonLd() {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    ...(productionOrigin ? { url: productionOrigin.href } : {}),
    ...(publicEmail ? { email: `mailto:${publicEmail}` } : {}),
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: site.affiliation,
    },
    ...(usableProfiles.length > 0
      ? { sameAs: usableProfiles.map(({ href }) => href) }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
    />
  );
}
