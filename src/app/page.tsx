import {
  StationHero,
  type Station,
  type ConstellationNode,
} from '@/components/home/StationHero';
import { Starfield } from '@/components/Starfield';
import { ProjectCard } from '@/components/ProjectCard';
import { ResearchCard } from '@/components/ResearchCard';
import { Reveal } from '@/components/Reveal';
import { ReadingStation, ReadingTimeline } from '@/components/ReadingTimeline';
import { getPapers, getProjects } from '@/lib/content';
import {
  copy,
  homeCopy,
  site,
  usableProfiles,
  emailHref,
  publicEmail,
} from '@/lib/site';

export default function HomePage() {
  const projects = getProjects();
  const papers = getPapers();
  const country = site.location.split(',').at(-1)?.trim() ?? site.location;
  const classifier = projects.find(
    (p) => p.slug === 'bangla-sentence-classifier',
  );
  const stations: Station[] = [
    {
      id: 'identity',
      label: homeCopy.stationLabels[0],
      title: site.name,
      body: site.positioning,
      meta: `${site.affiliation} · ${country}`,
      links: [
        { label: homeCopy.viewCv, href: '/cv/', primary: true },
        ...['Google Scholar', 'GitHub'].flatMap((label) => {
          const p = usableProfiles.find((p) => p.label === label);
          return p ? [p] : [];
        }),
        ...(emailHref
          ? [{ label: site.chrome.emailLabel, href: emailHref }]
          : []),
      ],
    },
    {
      id: 'projects',
      label: homeCopy.stationLabels[1],
      title: homeCopy.projectTitle,
      body: homeCopy.projectBody,
      records: projects.slice(0, 3).map((project) => ({
        label:
          project.slug === 'bangla-sentence-classifier'
            ? homeCopy.classifierNode
            : project.frontmatter.title,
        status: copy.statuses[project.frontmatter.status],
      })),
      links: [
        {
          label: homeCopy.viewProjects,
          href: '/projects/',
          primary: true,
          arrow: true,
        },
      ],
    },
    {
      id: 'ai',
      label: homeCopy.stationLabels[2],
      title: homeCopy.aiTitle,
      body: homeCopy.aiBody,
      links: classifier?.frontmatter.liveUrl
        ? [
            {
              label: homeCopy.tryClassifier,
              href: classifier.frontmatter.liveUrl,
              primary: true,
            },
          ]
        : [],
    },
    {
      id: 'research',
      label: homeCopy.stationLabels[3],
      title: homeCopy.researchHeroTitle,
      body: homeCopy.researchBody,
      links: [
        {
          label: homeCopy.readResearch,
          href: '/research/',
          primary: true,
          arrow: true,
        },
      ],
    },
    {
      id: 'contact',
      label: homeCopy.stationLabels[4],
      title: homeCopy.contactTitle,
      body: homeCopy.contactBody,
      links:
        emailHref && publicEmail
          ? [{ label: publicEmail, href: emailHref, text: true }]
          : [],
    },
  ];
  const definitions = [
    ['resume', 'resume-evaluator', 100, 80, [0, 1]],
    ['rag', 'web-rag', 60, 240, [0, 1]],
    ['classifier', 'bangla-sentence-classifier', 170, 360, [0, 1, 2]],
  ] as const;
  const nodes: ConstellationNode[] = definitions.flatMap(
    ([id, slug, x, y, on]) => {
      const p = projects.find((p) => p.slug === slug);
      return p
        ? [
            {
              id,
              label:
                id === 'classifier'
                  ? homeCopy.classifierNode
                  : p.frontmatter.title,
              x,
              y,
              stations: [...on],
            },
          ]
        : [];
    },
  );
  for (const [id, slug, x, y, on] of [
    ['qpain', 'bangla-sentence-type-classification', 380, 70, [0, 2, 3]],
    ['bea', 'vocabulary-difficulty-prediction', 420, 230, [0, 3]],
    ['thesis', 'leakage-safe-adhd-eeg-framework', 340, 360, [0, 3]],
  ] as const) {
    const paper = papers.find((p) => p.slug === slug);
    if (paper)
      nodes.push({
        id,
        label:
          paper.frontmatter.status === 'thesis'
            ? homeCopy.thesisNode
            : paper.frontmatter.venue,
        x,
        y,
        stations: [...on],
      });
  }
  return (
    <>
      <StationHero
        stations={stations}
        nodes={nodes}
        stars={<Starfield intensity="strong" />}
      />
      <div className="home-sections" id="selected-work" tabIndex={-1}>
        <section data-project-index>
          <div className="redesign-section-heading">
            <div>
              <p className="label">
                {homeCopy.station} 02 → {copy.selectedWork}
              </p>
              <h2>{copy.selectedProjects}</h2>
            </div>
            <span className="label">
              {Math.min(projects.length, 3)} {copy.records} · {copy.allSource}
            </span>
          </div>
          {projects.length ? (
            <ReadingTimeline className="project-timeline">
              {projects.slice(0, 3).map((p) => (
                <ReadingStation key={p.slug}>
                  <Reveal>
                    <ProjectCard project={p} />
                  </Reveal>
                </ReadingStation>
              ))}
            </ReadingTimeline>
          ) : (
            <p>{copy.emptyProjects}</p>
          )}
        </section>
        <section data-research-index>
          <div className="redesign-section-heading">
            <div>
              <p className="label">
                {homeCopy.station} 04 → {copy.selectedResearch}
              </p>
              <h2>{copy.selectedResearch}</h2>
            </div>
            <span className="label">
              {
                papers.filter((p) => p.frontmatter.status === 'published')
                  .length
              }{' '}
              {copy.peerReviewed} ·{' '}
              {papers.filter((p) => p.frontmatter.status === 'thesis').length}{' '}
              {copy.thesisShort}
            </span>
          </div>
          {papers.length ? (
            <ReadingTimeline className="research-card-list">
              {papers.slice(0, 3).map((p) => (
                <ReadingStation key={p.slug}>
                  <Reveal>
                    <ResearchCard paper={p} compact />
                  </Reveal>
                </ReadingStation>
              ))}
            </ReadingTimeline>
          ) : (
            <p>{copy.emptyResearch}</p>
          )}
        </section>
        <Reveal>
          <section className="home-profile">
            <div>
              <p className="label">{copy.profile}</p>
              <h2>{homeCopy.contactTitle}</h2>
              {emailHref && publicEmail && (
                <a
                  className="accent contact-email"
                  href={emailHref}
                  rel="noopener noreferrer"
                >
                  {publicEmail} ↗
                </a>
              )}
            </div>
            <p>{site.bio}</p>
          </section>
        </Reveal>
      </div>
    </>
  );
}
