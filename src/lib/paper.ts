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

/** A short visual-index label derived only from public title and venue text. */
export function researchArea(frontmatter: Pick<Paper, 'title' | 'venue'>): string {
  const recordText = `${frontmatter.title} ${frontmatter.venue}`.toLowerCase();
  if (/fingerprint|biometric|presentation attack|liveness/.test(recordText)) return 'Security';
  if (/bangla|language|vocabulary|sentence|bert|nlp/.test(recordText)) return 'Language';
  return 'Research';
}

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

/**
 * The line in a record card's header strip.
 *
 * Venues usually already carry the year ("IEEE QPAIN 2026"), so repeating it
 * produced "IEEE QPAIN 2026 · 2026". Only add the year when it is missing.
 */
export function cardHeadLine(frontmatter: Paper): string {
  const parts: string[] = [];
  if (frontmatter.status !== 'in-progress') {
    parts.push(frontmatter.venue);
  }
  if (!parts.some((part) => part.includes(String(frontmatter.year)))) {
    parts.push(String(frontmatter.year));
  }
  parts.push(ROLE_LABEL[frontmatter.role]);
  return parts.join(' · ');
}
