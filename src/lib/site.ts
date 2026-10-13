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
  "I'm a Computer Science and Engineering graduate from Rajshahi University of Engineering and Technology in Bangladesh. My research focuses on Bangla and multilingual NLP: I have two peer-reviewed papers, and I'm a research member of RUET's Young Learners' Research Lab. My undergraduate thesis develops a leakage-safe ADHD EEG framework built on subject-level validation, so the same participant never appears in both training and testing. Outside research, I build web apps, mobile apps, and local AI tools, from resume review to private search over saved websites.";

export const site = {
  /** Canonical name string. Byte-identical everywhere on the site. */
  name: 'Kamruzzaman Khan Alve',
  url: productionOrigin?.href ?? null,
  positioning: POSITIONING,
  bio: BIO,
  affiliation: 'Rajshahi University of Engineering and Technology',
  affiliationShort: 'RUET',
  location: 'Rajshahi, Bangladesh',
  chrome: {
    skipToContent: 'Skip to content',
    navigationLabel: 'Sections',
    emailLabel: 'Email',
    navigation: [
      { href: '/projects/', label: 'Projects' },
      { href: '/research/', label: 'Research' },
      { href: '/notes/', label: 'Notes' },
      { href: '/cv/', label: 'CV' },
    ],
  },
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

/** Interface copy for the approved redesign, shared by server and client views. */
export const copy = {
  selectedProjects: 'Selected projects', selectedResearch: 'Selected research', profile: 'Profile',
  projects: 'Projects', research: 'Research', cv: 'Curriculum vitae', notes: 'Notes',
  emptyProjects: 'No verified projects are published yet.', emptyResearch: 'No verified research entries are published yet.', emptyNotes: 'No notes are published yet.',
  record: 'record', records: 'records', allSource: 'All open source',
  problem: 'Problem', approach: 'Approach', result: 'Result', repository: 'Repository', openLive: 'Open live',
  statuses: { live: 'Live', complete: 'Complete', archived: 'Archived', wip: 'In development' },
  engineeringNotes: 'Engineering notes', hideNotes: 'Hide engineering notes', contribution: 'My contribution', decision: 'Key decision', limitation: 'Limitation',
  shows: 'What this shows', abstract: 'Abstract', overview: 'Overview', cite: 'Cite', bibtex: 'BibTeX',
  copyBibtex: 'Copy BibTeX', copied: 'Copied', copyError: 'Copy failed. Select and copy the citation below.',
  links: 'Links', paper: 'Read the paper', code: 'Code', allResearch: 'All research', allProjects: 'All projects', next: 'Next record', previous: 'Previous record',
  published: 'Published', accepted: 'Accepted', publishedAccepted: 'Published and accepted', thesis: 'Undergraduate thesis', inProgress: 'In progress',
  modelResults: 'Test accuracy by model', monolingual: 'Monolingual', multilingual: 'Multilingual',
  modelCaveat: 'Same test split and hyperparameters for all six models. The top four lie within 0.08 percentage points of each other.',
  filters: [{ id:'all', label:'All' }, { id:'live', label:'Live' }, { id:'ai', label:'AI & NLP' }, { id:'web', label:'Web' }, { id:'mobile', label:'Mobile' }],
  of: 'of', summary: 'Summary', note: 'Note', publishedNotes: 'Published notes',
} as const;

export const homeCopy = {
  classifierNode: 'Bangla classifier', thesisNode: 'EEG thesis',
  constellation: 'Work constellation', skipWork: 'Skip to selected work', choose: 'Scroll, or choose a station.',
  pause: 'Pause automatic station changes', play: 'Resume automatic station changes', station: 'Station',
  viewCv: 'View CV', viewProjects: 'View projects', tryClassifier: 'Try the classifier', readResearch: 'Read the research',
  stationLabels: ['Identity', 'Projects', 'AI/ML', 'Research', 'Contact'],
  projectTitle: 'Built to be used', projectBody: 'Web apps, mobile apps and local AI tools, with the source public for every one.',
  aiTitle: 'From benchmark to browser', aiBody: 'Six Transformer models compared on 25,500 Bangla sentences. The best-suited XLM-R classifier is online for anyone to try.',
  researchTitle: 'Evaluation comes first', researchBody: 'Two peer-reviewed NLP papers, at IEEE QPAIN and the BEA workshop at ACL. My thesis develops a leakage-safe ADHD EEG framework using subject-level validation, so no participant appears in both training and testing.',
  contactTitle: "Let's talk", contactBody: 'Research, engineering or collaboration: my inbox is open.',
} as const;
