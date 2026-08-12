/**
 * Single source of truth for identity, URLs and socials.
 *
 * Every component imports from here. This is the mechanism that guarantees the
 * owner's name renders byte-identically on every page. Do not hardcode the name,
 * the tagline, or any social URL anywhere else in the codebase.
 */

/**
 * Production origin. Must be a parseable absolute URL because `metadataBase`,
 * `sitemap.ts` and `robots.ts` construct `new URL()` from it — a `{{TODO}}` token
 * here would throw at build time rather than fail visibly in the rendered page.
 * {{TODO: replace with the real production origin, e.g. https://example.com}}
 */
export const SITE_URL = 'https://todo.invalid';

/**
 * Positioning sentence. Draft 3 is the working default per the brief.
 * Alternatives supplied by the owner, kept here for a later decision:
 *
 *   1. AI engineer and researcher working on low-resource Bangla NLP and
 *      adversarial robustness in biometric systems.
 *   2. Final-year CSE student at RUET publishing on multilingual language models
 *      and building the systems that deploy them.
 *   4. Researcher in low-resource language modeling and presentation attack
 *      detection, with published work at ACL and IEEE venues.
 *   5. Bangla NLP and biometric security research, plus the unglamorous
 *      engineering that gets a model into production.
 */
const POSITIONING =
  'I work on low-resource Bangla NLP and the security of biometric models, and I ship the deployment code as well as the papers.';

export const site = {
  /** Canonical name string. Byte-identical everywhere on the site. */
  name: 'Kamruzzaman Khan Alve',
  url: SITE_URL,
  positioning: POSITIONING,
  affiliation: 'Rajshahi University of Engineering and Technology',
  affiliationShort: 'RUET',
  location: 'Bangladesh',
  /** {{TODO: public contact email address}} */
  email: '{{TODO: public contact email address}}',
  socials: {
    /** {{TODO: GitHub profile URL}} */
    github: '{{TODO: GitHub profile URL}}',
    /** {{TODO: Google Scholar profile URL}} */
    scholar: '{{TODO: Google Scholar profile URL}}',
    /** {{TODO: HuggingFace profile URL}} */
    huggingface: '{{TODO: HuggingFace profile URL}}',
    /** {{TODO: ORCID URL}} */
    orcid: '{{TODO: ORCID URL}}',
    /** {{TODO: LinkedIn profile URL}} */
    linkedin: '{{TODO: LinkedIn profile URL}}',
  },
} as const;

export type Site = typeof site;
