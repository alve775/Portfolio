import { PaperList } from '@/components/PaperList';
import { ProjectList } from '@/components/ProjectList';
import { ResearchFlight } from '@/components/home/ResearchFlight';
import type { FlightStationContent } from '@/components/home/flight-model';
import { getPapers, getProjects } from '@/lib/content';
import { emailHref, publicEmail, site, usableProfiles } from '@/lib/site';

/**
 * Validated destinations only: a missing or malformed profile is simply omitted.
 * Scholar leads because research readers look for it first.
 */
const IDENTITY_PROFILES = [
  { label: 'Google Scholar', shortLabel: 'Scholar' },
  { label: 'GitHub' },
] as const;

const identityLinks = [
  ...IDENTITY_PROFILES.flatMap((profile) => {
    const match = usableProfiles.find(({ label }) => label === profile.label);
    return match ? [{ ...profile, href: match.href }] : [];
  }),
  ...(emailHref ? [{ label: 'Email', href: emailHref }] : []),
];

const stations = [
  {
    id: 'identity',
    label: 'Identity',
    marker: 'Station 01',
    title: site.name,
    meta: `${site.affiliation} · ${site.location}`,
    body: site.positioning,
    action: { label: 'View CV', shortLabel: 'CV', href: '/cv/' },
    links: identityLinks,
  },
  {
    id: 'projects',
    label: 'Projects',
    marker: 'Station 02',
    title: 'Built to be used',
    body: 'Web apps, mobile apps, and local AI tools, with the source code public for every one.',
    action: { label: 'View projects', href: '/projects/' },
  },
  {
    id: 'ai',
    label: 'AI/ML',
    marker: 'Station 03',
    title: 'From benchmark to browser',
    body: 'I compared six Transformer models on 25,500 Bangla sentences, then put the best-suited XLM-R classifier online so anyone can try it.',
    action: {
      label: 'Try the classifier',
      href: 'https://huggingface.co/spaces/TextLabRUET/Multilingual-Sentence-Classifier',
    },
  },
  {
    id: 'research',
    label: 'Research',
    marker: 'Station 04',
    title: 'Evaluation comes first',
    body: 'Two peer-reviewed NLP papers, at IEEE QPAIN and the BEA workshop at ACL. My thesis builds a leakage-safe way to evaluate ADHD EEG models, so no participant appears in both training and testing.',
    action: { label: 'Read the research', href: '/research/' },
  },
  {
    id: 'contact',
    label: 'Contact',
    marker: 'Station 05',
    title: "Let's talk",
    body: 'Research, engineering, or collaboration: my inbox is open.',
    ...(publicEmail
      ? { action: { label: publicEmail, href: emailHref! } }
      : {}),
  },
] satisfies readonly FlightStationContent[];

export default function HomePage() {
  const selectedProjects = getProjects().slice(0, 3);
  const selectedResearch = getPapers().slice(0, 3);

  return (
    <>
      <ResearchFlight stations={stations} />

      <div className="home-editorial" id="selected-work" tabIndex={-1}>
        <ProjectList label="Selected projects" projects={selectedProjects} />

        {selectedResearch.length > 0 ? (
          <PaperList label="Selected research" papers={selectedResearch} />
        ) : (
          <section className="work-section" data-research-index>
            <div className="section-heading"><h2>Selected research</h2></div>
            <p className="empty-state">No verified research entries are published yet.</p>
          </section>
        )}

        <section className="profile-section" aria-labelledby="profile-title">
          <div className="section-heading section-heading-plain">
            <h2 id="profile-title">Profile</h2>
          </div>
          <p className="profile-copy">{site.bio}</p>
        </section>
      </div>
    </>
  );
}
