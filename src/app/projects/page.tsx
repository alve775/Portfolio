import { PageHeader } from '@/components/PageHeader';
import { getProjects } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = routeMetadata({
  title: 'Projects',
  description: `Selected engineering projects by ${site.name}.`,
  pathname: '/projects/',
});

const STATUS_LABEL = { live: 'live', archived: 'archived', wip: 'wip' } as const;

/** Problem / approach / result, kept as a labelled three-row record. */
function ProjectRow({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid gap-x-5 gap-y-1 border-t border-rule py-3 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
      <span className="mono-label sm:pt-1">{label}</span>
      <p className="measure text-[0.9375rem] leading-[1.6]">{children}</p>
    </div>
  );
}

export default function ProjectsPage() {
  const projects = getProjects().slice(0, 5);

  return (
    <>
      <PageHeader title="Projects" />

      <div className="section-head">
        <h2 className="mono-label">Selected builds</h2>
        {projects.length > 0 ? (
          <span className="mono-label">
            {projects.length} {projects.length === 1 ? 'record' : 'records'}
          </span>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <p className="empty mt-5">No verified projects are published yet.</p>
      ) : (
        <div className="mt-5 grid gap-3">
          {projects.map(({ slug, frontmatter }, index) => (
            <article className="card card-link" key={slug}>
              <div className="card-head">
                <span className="meta">
                  <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
                  {'  '}
                  {frontmatter.stack.join(' · ')}
                </span>
                <span
                  className={frontmatter.status === 'live' ? 'badge' : 'badge badge-quiet'}
                >
                  {STATUS_LABEL[frontmatter.status]}
                </span>
              </div>
              <div className="card-body">
                <h3 className="title-lg">{frontmatter.title}</h3>
                <div className="mt-4">
                  <ProjectRow label="Problem">{frontmatter.problem}</ProjectRow>
                  <ProjectRow label="Approach">{frontmatter.approach}</ProjectRow>
                  <ProjectRow label="Result">{frontmatter.result}</ProjectRow>
                </div>
                <p className="mt-4 flex flex-wrap gap-x-6">
                  <a className="link meta inline-flex min-h-11 items-center" href={frontmatter.repoUrl} rel="noopener">
                    Repository
                  </a>
                  {frontmatter.liveUrl ? (
                    <a className="link meta inline-flex min-h-11 items-center" href={frontmatter.liveUrl} rel="noopener">
                      Live
                    </a>
                  ) : null}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
