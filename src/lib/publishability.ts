type ContentRecord<T> = {
  frontmatter: T;
  body: string;
};

type DraftRecord = {
  draft: boolean;
};

const unresolvedPrefix = ['{{', 'TO', 'DO'].join('');

export function containsUnresolved(value: unknown): boolean {
  if (typeof value === 'string') return value.includes(unresolvedPrefix);
  if (Array.isArray(value)) return value.some(containsUnresolved);
  if (value && typeof value === 'object') {
    return Object.values(value).some(containsUnresolved);
  }
  return false;
}

function hasPublicFrontmatter<T extends DraftRecord>(entry: ContentRecord<T>): boolean {
  return entry.frontmatter.draft === false && !containsUnresolved(entry.frontmatter);
}

export const isPublishablePaper = hasPublicFrontmatter;
export const isPublishableProject = hasPublicFrontmatter;

export function isPublishableNote<T extends DraftRecord>(entry: ContentRecord<T>): boolean {
  return hasPublicFrontmatter(entry) && safeOptionalBody(entry.body) !== null;
}

export function safeOptionalBody(body: string): string | null {
  const trimmed = body.trim();
  return trimmed && !containsUnresolved(trimmed) ? trimmed : null;
}
