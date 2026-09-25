import { PaperList } from '@/components/PaperList';
import { ProjectList } from '@/components/ProjectList';
import { ResearchFlight } from '@/components/home/ResearchFlight';
import type { FlightStationContent } from '@/components/home/flight-model';
import { getPapers, getProjects } from '@/lib/content';
import { emailHref, publicEmail, site } from '@/lib/site';

const stations = [
  {
    id: 'identity',
    label: 'Identity',
    marker: 'Station 01',
    title: site.name,
    meta: `${site.affiliation} · ${site.location}`,
    body: site.positioning,
    action: { label: 'View CV', href: '/cv/' },
  },
  {
    id: 'projects',
    label: 'Projects',
    marker: 'Station 02',
    title: 'Software that reaches users',
    body: 'Resume Evaluator connects document analysis, editing, and export. Web-RAG turns a local website collection into a searchable knowledge base.',
    action: { label: 'View projects', href: '/projects/' },
  },
  {
    id: 'ai',
    label: 'AI/ML',
    marker: 'Station 03',
    title: 'From a model to a working tool',
    body: 'My Bangla Sentence Classifier brings an XLM-R model to a public Gradio interface, identifying five grammatical sentence types.',
    action: {
      label: 'Open classifier',
      href: 'https://huggingface.co/spaces/TextLabRUET/Multilingual-Sentence-Classifier',
    },
  },
  {
    id: 'research',
    label: 'Research',
    marker: 'Station 04',
    title: 'Research with careful evaluation',
    body: 'Two published NLP papers cover Bangla sentence types and multilingual vocabulary difficulty. My undergraduate thesis develops a leakage-safe ADHD EEG framework with subject-level validation.',
    action: { label: 'Read papers', href: '/research/' },
  },
  {
    id: 'contact',
    label: 'Contact',
    marker: 'Station 05',
    title: 'Continue the conversation',
    body: 'For research, engineering, and collaboration.',
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
