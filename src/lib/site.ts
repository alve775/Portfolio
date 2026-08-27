/**
 * Single source of truth for identity, URLs and socials.
 *
 * Every component imports from here. This is the mechanism that guarantees the
 * owner's name renders byte-identically on every page. Do not hardcode the name,
 * the tagline, or any social URL anywhere else in the codebase.
 */

import {
  asPublicEmail,
  asPublicHttpsUrl,
  resolveProductionOrigin,
} from '@/lib/site-validation';

export const productionOrigin = resolveProductionOrigin(process.env.NEXT_PUBLIC_SITE_URL);

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
  'I build software, develop AI systems, and conduct research in Bangla NLP and ADHD EEG analysis.';

/** Home-page bio, third person, reflecting the owner's verified research areas. */
const BIO =
  'Kamruzzaman Khan Alve is a final-semester Computer Science and Engineering student at Rajshahi University of Engineering and Technology, Bangladesh. His research spans low-resource language modeling, leakage-safe EEG analysis for ADHD, and the security of learned systems. His undergraduate thesis develops a leakage-safe ADHD EEG framework centered on subject-level validation. Alongside research he builds and deploys the inference systems that put these models in front of users.';

export const site = {
  /** Canonical name string. Byte-identical everywhere on the site. */
  name: 'Kamruzzaman Khan Alve',
  url: productionOrigin?.href ?? null,
  positioning: POSITIONING,
  bio: BIO,
  affiliation: 'Rajshahi University of Engineering and Technology',
  affiliationShort: 'RUET',
  location: 'Bangladesh',
  /** Swap for an institutional address if you would rather publish that one. */
  email: 'kamruzzamanalve@gmail.com',
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

export const publicEmail = asPublicEmail(site.email);

export const publicProfiles = [
  ['GitHub', site.socials.github],
  ['Google Scholar', site.socials.scholar],
  ['HuggingFace', site.socials.huggingface],
  ['ORCID', site.socials.orcid],
  ['LinkedIn', site.socials.linkedin],
] as const;

export const usableProfiles = publicProfiles.flatMap(([label, raw]) => {
  const href = asPublicHttpsUrl(raw);
  return href ? [{ label, href }] : [];
});

export type Site = typeof site;
