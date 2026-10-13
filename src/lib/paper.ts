import type { Paper } from '@/lib/schemas';
import { paperCopy } from './site.ts';

export const STATUS_LABEL: Record<Paper['status'], string> = paperCopy.status;

export const ROLE_LABEL: Record<Paper['role'], string> = paperCopy.role;

/** A short visual-index label derived only from public title and venue text. */
export function researchArea(frontmatter: Pick<Paper, 'title' | 'venue'>): string {
  const recordText = `${frontmatter.title} ${frontmatter.venue}`.toLowerCase();
  if (/fingerprint|biometric|presentation attack|liveness/.test(recordText)) return paperCopy.area.security;
  if (/bangla|language|vocabulary|sentence|bert|nlp/.test(recordText)) return paperCopy.area.language;
  if (/eeg|adhd/.test(recordText)) return paperCopy.area.eeg;
  return paperCopy.area.research;
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
  if (frontmatter.status === 'thesis') return paperCopy.kind.thesis;
  return frontmatter.status === 'in-progress' ? paperCopy.kind.inProgress : paperCopy.kind.paper;
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
  parts.push(frontmatter.status === 'thesis' ? paperCopy.author : ROLE_LABEL[frontmatter.role]);
  return parts.join(' · ');
}
