import Image from 'next/image';

import type { Entry } from '@/lib/content';
import type { Project } from '@/lib/schemas';
import { isTodo } from '@/lib/todo';

const STATUS_LABEL = {
  live: 'live', complete: 'complete', archived: 'archived', wip: 'in development',
} as const;

function ProjectFact({ label, children }: { label: string; children: string }) {
  return (
    <div className="project-fact">
      <span>{label}</span>
      <p>{children}</p>
    </div>
  );
}

export function ProjectList({
  label,
  projects,
  detailed = false,
}: {
  label: string;
  projects: Entry<Project>[];
  detailed?: boolean;
}) {
  return (
    <section className="project-index" data-project-index aria-labelledby="project-list-title">
      <div className="section-heading">
        <h2 id="project-list-title">{label}</h2>
        {projects.length > 0 ? (
          <span className="meta">
            {projects.length} {projects.length === 1 ? 'record' : 'records'}
          </span>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <p className="empty-state">No verified projects are published yet.</p>
      ) : (
        <div>
          {projects.map(({ slug, frontmatter }) => (
            <article className="project-entry" key={slug}>
              <div className="project-topline">
                <span className="meta">{frontmatter.stack.join(' · ')}</span>
                <span
                  className={
                    frontmatter.status === 'live' ? 'status' : 'status status-quiet'
                  }
                >
                  {STATUS_LABEL[frontmatter.status]}
                </span>
              </div>
              <h3 className="project-title">{frontmatter.title}</h3>
              {frontmatter.image ? (
                <figure className="project-preview">
                  <Image
                    src={frontmatter.image.src}
                    alt={frontmatter.image.alt}
                    width={frontmatter.image.width}
                    height={frontmatter.image.height}
                    sizes="(max-width: 1192px) calc(100vw - 40px), 1152px"
                  />
                  <figcaption>{frontmatter.image.caption}</figcaption>
                </figure>
              ) : null}
              <div className="project-facts">
                <ProjectFact label="Problem">{frontmatter.problem}</ProjectFact>
                <ProjectFact label="Approach">{frontmatter.approach}</ProjectFact>
                <ProjectFact label="Result">{frontmatter.result}</ProjectFact>
              </div>
              {detailed && frontmatter.caseStudy ? (
                <dl className="project-study">
                  <div><dt>My contribution</dt><dd>{frontmatter.caseStudy.contribution}</dd></div>
                  <div><dt>Key decision</dt><dd>{frontmatter.caseStudy.decision}</dd></div>
                  <div><dt>Limitation</dt><dd>{frontmatter.caseStudy.limitation}</dd></div>
                </dl>
              ) : null}
              <p className="project-links">
                {isTodo(frontmatter.repoUrl) ? (
                  <span className="meta">{frontmatter.repoUrl}</span>
                ) : (
                  <a className="link" href={frontmatter.repoUrl} rel="noopener">
                    Repository ↗
                  </a>
                )}
                {frontmatter.liveUrl && !isTodo(frontmatter.liveUrl) ? (
                  <a className="link" href={frontmatter.liveUrl} rel="noopener">
                    Live ↗
                  </a>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
