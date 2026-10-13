export type ProjectFilter = 'all' | 'live' | 'ai' | 'web' | 'mobile';
type CategorizedProject = { status: string; tags?: readonly string[] };
export function matchesProject(project: CategorizedProject, filter: ProjectFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'live') return project.status === 'live';
  return project.tags?.includes(filter) ?? false;
}
