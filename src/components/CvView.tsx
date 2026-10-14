import Link from 'next/link';
import type { Entry } from '@/lib/content';
import type { Paper, Project } from '@/lib/schemas';
import { copy, cvContent, site } from '@/lib/site';
import { ProfileLinks } from './ProfileLinks';
import { Reveal } from './Reveal';

/** Citation-style short author: the family name, in the record's exact author order. */
const surname = (author: string) => author.trim().split(/\s+/).at(-1) ?? author;

export function CvView({
  publications,
  projects,
  hasPdf,
}: {
  publications: Entry<Paper>[];
  projects: Entry<Project>[];
  hasPdf: boolean;
}) {
  return (
    <div className="cv-redesign" data-cv-grid>
      <header className="cv-header">
        <div>
          <p className="label">{copy.cv}</p>
          <h1>{site.name}</h1>
          <p className="label venue cv-title">{cvContent.title}</p>
        </div>
        {hasPdf && (
          <a className="button button-primary" href="/cv.pdf" download>
            {copy.download} ↓
          </a>
        )}
      </header>
      <div className="cv-top-cards">
        <section>
          <h2 className="label">{copy.profile}</h2>
          <p>{cvContent.profile}</p>
          <p className="label cv-location">{site.location}</p>
        </section>
        <section>
          <h2 className="label">{copy.education}</h2>
          <h3>{cvContent.degree}</h3>
          <p>
            {site.affiliation} · {cvContent.dates}
          </p>
          <div
            className="cv-cgpa"
            aria-label={`${copy.cgpa}: ${cvContent.cgpa}/${cvContent.cgpaMax}`}
          >
            <strong>{cvContent.cgpa}</strong>
            <span>
              / {cvContent.cgpaMax} {copy.cgpa}
            </span>
          </div>
        </section>
        <section className="cv-links">
          <h2 className="label">{copy.links}</h2>
          <ProfileLinks emailAddress />
        </section>
      </div>
      <div className="cv-sections">
        <Reveal>
          <section className="cv-section">
            <h2>{copy.technicalSkills}</h2>
            <dl className="cv-skill-rows">
              {cvContent.skills.map((group) => (
                <div key={group.label}>
                  <dt className="label accent">{group.label}</dt>
                  <dd>
                    {group.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
        <section className="cv-section">
          <h2>{copy.experience}</h2>
          <div className="cv-timeline">
            {cvContent.experience.map((experience) => (
              <Reveal key={experience.role}>
                <span className="timeline-node" aria-hidden="true" />
                <article>
                  <div className="card-topline">
                    <h3>{experience.role}</h3>
                    <span className="label venue cv-dates">
                      {experience.dates}
                    </span>
                  </div>
                  <p className="cv-org">{experience.org}</p>
                  <p>{experience.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
        <Reveal>
          <section className="cv-section">
            <div className="detail-section-heading">
              <h2>{copy.publications}</h2>
              <Link className="label accent back-link" href="/research/">
                {copy.allResearch} →
              </Link>
            </div>
            <ol className="cv-publication-rows">
              {publications.map((p) => (
                <li key={p.slug}>
                  <Link href={`/research/${p.slug}/`}>
                    {p.frontmatter.title}
                  </Link>
                  <p>
                    {p.frontmatter.authors.map(surname).join(', ')} ·{' '}
                    <span className="venue">{p.frontmatter.venue}</span> ·{' '}
                    {copy.published}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
        <Reveal>
          <section className="cv-section">
            <div className="detail-section-heading">
              <h2>{copy.selectedProjects}</h2>
              <Link className="label accent back-link" href="/projects/">
                {copy.allProjects} →
              </Link>
            </div>
            <div className="cv-project-cards">
              {projects.map((p) => (
                <article key={p.slug}>
                  <h3>{p.frontmatter.title}</h3>
                  <p>{p.frontmatter.approach}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
