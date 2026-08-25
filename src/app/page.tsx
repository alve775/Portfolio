import { PaperList } from '@/components/PaperList';
import { ResearchFlight } from '@/components/home/ResearchFlight';
import type { FlightStationContent } from '@/components/home/flight-model';
import { getPapers } from '@/lib/content';
import { publicEmail, site } from '@/lib/site';

const stations = [
  {
    id: 'identity',
    label: 'Identity',
    marker: 'Station 01',
    title: site.name,
    meta: `${site.affiliation} · ${site.location}`,
    body: site.positioning,
  },
  {
    id: 'language',
    label: 'Language',
    marker: 'Station 02',
    title: 'Language systems for Bangla',
    body: 'Comparative work on monolingual and multilingual transformers for Bangla.',
  },
  {
    id: 'security',
    label: 'Security',
    marker: 'Station 03',
    title: 'Security under perturbation',
    body: 'An undergraduate thesis on adversarial robustness in fingerprint presentation attack detection.',
  },
  {
    id: 'systems',
    label: 'Systems',
    marker: 'Station 04',
    title: 'Models in front of users',
    body: 'Alongside research he builds and deploys the inference systems that put these models in front of users.',
  },
  {
    id: 'contact',
    label: 'Contact',
    marker: 'Station 05',
    title: 'Continue the conversation',
    body: 'For research, engineering, and collaboration.',
    ...(publicEmail
      ? { action: { label: publicEmail, href: `mailto:${publicEmail}` } }
      : {}),
  },
] satisfies readonly FlightStationContent[];

export default function HomePage() {
  const proofPoints = getPapers().slice(0, 3);

  return (
    <>
      <ResearchFlight stations={stations} />

      <div className="home-editorial">
        {proofPoints.length > 0 ? (
          <PaperList label="Selected research" papers={proofPoints} />
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
