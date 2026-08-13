import { asPublicHttpsUrl, containsUnresolved } from './site-validation.ts';

type ContentRecord<T> = {
  frontmatter: T;
  body: string;
};

type DraftRecord = {
  draft: boolean;
};

export { containsUnresolved };

function hasPublicFrontmatter<T extends DraftRecord>(entry: ContentRecord<T>): boolean {
  return entry.frontmatter.draft === false && !containsUnresolved(entry.frontmatter);
}

export function isPublishablePaper<
  T extends DraftRecord & { pdfUrl?: string; codeUrl?: string },
>(entry: ContentRecord<T>): boolean {
  return (
    hasPublicFrontmatter(entry) &&
    [entry.frontmatter.pdfUrl, entry.frontmatter.codeUrl].every(
      (value) => value === undefined || asPublicHttpsUrl(value) !== null,
    )
  );
}

export function isPublishableProject<
  T extends DraftRecord & { repoUrl?: string; liveUrl?: string },
>(entry: ContentRecord<T>): boolean {
  return (
    hasPublicFrontmatter(entry) &&
    asPublicHttpsUrl(entry.frontmatter.repoUrl) !== null &&
    (entry.frontmatter.liveUrl === undefined ||
      asPublicHttpsUrl(entry.frontmatter.liveUrl) !== null)
  );
}

export function isPublishableNote<T extends DraftRecord>(entry: ContentRecord<T>): boolean {
  return hasPublicFrontmatter(entry) && safeOptionalBody(entry.body) !== null;
}

export function safeOptionalBody(body: string): string | null {
  const trimmed = body.trim();
  return trimmed && !containsUnresolved(trimmed) ? trimmed : null;
}
