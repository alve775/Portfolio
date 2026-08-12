import type { Paper } from '@/lib/schemas';

export const STATUS_LABEL: Record<Paper['status'], string> = {
  published: 'published',
  accepted: 'accepted',
  'in-progress': 'in progress',
};

export const ROLE_LABEL: Record<Paper['role'], string> = {
  'lead-author': 'lead author',
  'co-author': 'co-author',
};

/**
 * The monospace record line under a title.
 *
 * In-progress work never renders a venue: nothing on this site may imply that
 * unfinished work has been accepted anywhere.
 */
export function recordLine(frontmatter: Paper): string {
  const parts = frontmatter.status === 'in-progress' ? [] : [frontmatter.venue];
  parts.push(
    String(frontmatter.year),
    STATUS_LABEL[frontmatter.status],
    ROLE_LABEL[frontmatter.role],
  );
  return parts.join(' · ');
}

/** Gutter label for an entry in a list of work. */
export function kindLabel(frontmatter: Paper): string {
  return frontmatter.status === 'in-progress' ? 'IN PROGRESS' : 'PAPER';
}
