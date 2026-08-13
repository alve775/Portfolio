import { Field } from '@/components/Field';
import { getProjects } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = routeMetadata({
  title: 'Projects',
  description: `Selected engineering projects by ${site.name}.`,
  pathname: '/projects/',
});

export default function ProjectsPage() {
  const projects = getProjects().slice(0, 5);

  return (
    <div className="record">
      <div className="unlabelled">
        <h1>Projects</h1>
      </div>
      <Field label="WORK">
        {projects.length === 0 ? (
          <p>No verified projects are published yet.</p>
        ) : (
          <ul className="space-y-8">
            {projects.map(({ slug, frontmatter }) => (
              <li key={slug}>
                <h2 className="text-[1.3125rem] leading-[1.4]">{frontmatter.title}</h2>
                <p className="mt-3">{frontmatter.problem}</p>
                <p className="mt-2">{frontmatter.approach}</p>
                <p className="mt-2">{frontmatter.result}</p>
                <p className="meta mt-3">
                  {frontmatter.stack.join(' · ')} · {frontmatter.status}
                </p>
                <a
                  className="link meta mt-2 inline-flex min-h-11 items-center"
                  href={frontmatter.repoUrl}
                  rel="noopener"
                >
                  Repository
                </a>
                {frontmatter.liveUrl ? (
                  <a
                    className="link meta ml-5 inline-flex min-h-11 items-center"
                    href={frontmatter.liveUrl}
                    rel="noopener"
                  >
                    Live
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Field>
    </div>
  );
}
