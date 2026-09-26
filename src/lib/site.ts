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
  'I do research in Bangla and multilingual NLP, and I build the software that puts it to use.';

/** Updated from the owner-supplied September 2026 CV. */
const BIO =
  "Kamruzzaman Khan Alve is a Computer Science and Engineering graduate from Rajshahi University of Engineering and Technology, Bangladesh. His work connects Bangla and multilingual NLP, reproducible machine learning, and software development. He has two peer-reviewed NLP publications and is a research member of RUET's Young Learners' Research Lab. His undergraduate thesis develops a leakage-safe ADHD EEG framework centered on subject-level validation. Alongside research, he builds tools for document review, local retrieval, and everyday workflows.";

export const site = {
  /** Canonical name string. Byte-identical everywhere on the site. */
  name: 'Kamruzzaman Khan Alve',
  url: productionOrigin?.href ?? null,
  positioning: POSITIONING,
  bio: BIO,
  affiliation: 'Rajshahi University of Engineering and Technology',
  affiliationShort: 'RUET',
  location: 'Rajshahi, Bangladesh',
  /** Swap for an institutional address if you would rather publish that one. */
  email: 'kamruzzamanalve@gmail.com',
  socials: {
    github: 'https://github.com/alve775',
    scholar: 'https://scholar.google.com/citations?user=Zr2KjyMAAAAJ&hl=en',
    huggingface: 'https://huggingface.co/alveKamruzzaman',
    orcid: null, // Optional; add a verified profile if one becomes available.
    linkedin: 'https://www.linkedin.com/in/kamruzzaman-khan-alve-10a055227/',
  },
} as const;

export const publicEmail = asPublicEmail(site.email);
export const emailHref = publicEmail
  ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(publicEmail)}`
  : null;

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
