import { site } from '@/lib/site';
import { isTodo } from '@/lib/todo';

/**
 * schema.org Person for the root layout.
 *
 * `{{TODO}}` tokens are left in `sameAs` on purpose, per the brief: a missing
 * profile URL should be visible in the source, not silently dropped.
 */
export function PersonJsonLd() {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    email: isTodo(site.email) ? site.email : `mailto:${site.email}`,
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: site.affiliation,
    },
    sameAs: [
      site.socials.github,
      site.socials.scholar,
      site.socials.orcid,
      site.socials.huggingface,
      site.socials.linkedin,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
    />
  );
}
