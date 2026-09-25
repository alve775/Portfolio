import { PageHeader } from '@/components/PageHeader';
import { ProjectList } from '@/components/ProjectList';
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
    <>
      <PageHeader title="Projects" />
      <ProjectList label="Selected builds" projects={projects} detailed />
    </>
  );
}
