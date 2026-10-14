import Image from 'next/image';
import type { Entry } from '@/lib/content';
import type { Project } from '@/lib/schemas';
import { copy } from '@/lib/site';
import {
  EngineeringNotes,
  EngineeringNotesPanel,
  EngineeringNotesToggle,
} from './EngineeringNotes';
import { Metric } from './Metric';

/** `notes` adds the engineering-notes toggle (projects page only, when the record has a case study). */
export function ProjectCard({
  project,
  notes,
}: {
  project: Entry<Project>;
  notes?: { initialOpen?: boolean };
}) {
  const p = project.frontmatter;
  const study = notes ? p.caseStudy : undefined;
  const Heading = notes ? 'h2' : 'h3';
  const card = (
    <article className="project-card" data-project-card>
      <div className={`project-card-grid${p.image ? '' : ' no-media'}`}>
        {p.image && (
          <figure className="project-media">
            <div className="media-frame">
              <Image
                src={p.image.src}
                alt={p.image.alt}
                width={p.image.width}
                height={p.image.height}
                sizes="(max-width: 860px) calc(100vw - 88px), 480px"
              />
            </div>
            <figcaption>{p.image.caption}</figcaption>
          </figure>
        )}
        <div className="project-card-copy">
          <div className="card-topline">
            <span className="label">{p.stack.join(' · ')}</span>
            <span className={`status-badge status-${p.status}`}>
              {p.status === 'live' && <i aria-hidden="true" />}
              {copy.statuses[p.status]}
            </span>
          </div>
          <Heading>{p.title}</Heading>
          <Metric metric={p.metric} metricNote={p.metricNote} />
          <dl className="project-facts-new">
            {(
              [
                ['problem', copy.problem],
                ['approach', copy.approach],
                ['result', copy.result],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <dt className="label">{label}</dt>
                <dd>{p[field]}</dd>
              </div>
            ))}
          </dl>
          <div className="card-actions">
            <a
              className="button button-secondary"
              href={p.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.repository} ↗
            </a>
            {p.status === 'live' && p.liveUrl && (
              <a
                className="button button-primary"
                href={p.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.openLive} ↗
              </a>
            )}
            {study && <EngineeringNotesToggle />}
          </div>
        </div>
      </div>
      {study && <EngineeringNotesPanel study={study} />}
    </article>
  );

  return study ? (
    <EngineeringNotes initialOpen={notes?.initialOpen}>{card}</EngineeringNotes>
  ) : (
    card
  );
}
