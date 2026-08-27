import type { Entry } from '@/lib/content';
import type { Project } from '@/lib/schemas';

const STATUS_LABEL = { live: 'live', archived: 'archived', wip: 'wip' } as const;

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
}: {
  label: string;
  projects: Entry<Project>[];
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
              <div className="project-facts">
                <ProjectFact label="Problem">{frontmatter.problem}</ProjectFact>
                <ProjectFact label="Approach">{frontmatter.approach}</ProjectFact>
                <ProjectFact label="Result">{frontmatter.result}</ProjectFact>
              </div>
              <p className="project-links">
                <a className="link" href={frontmatter.repoUrl} rel="noopener">
                  Repository ↗
                </a>
                {frontmatter.liveUrl ? (
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
