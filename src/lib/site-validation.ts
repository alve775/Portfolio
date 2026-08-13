import { containsUnresolved } from './publishability.ts';

const reservedHosts = new Set(['localhost', 'example.com', 'example.net', 'example.org']);
const reservedSuffixes = ['.example.com', '.example.net', '.example.org'];

function isPublicHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();

  return (
    host.includes('.') &&
    !/^\d+(?:\.\d+){3}$/.test(host) &&
    !host.includes(':') &&
    !host.endsWith('.local') &&
    !host.endsWith('.invalid') &&
    !host.endsWith('.test') &&
    !reservedSuffixes.some((suffix) => host.endsWith(suffix)) &&
    !reservedHosts.has(host)
  );
}

export function asPublicHttpsUrl(value: string | undefined | null): string | null {
  if (!value || containsUnresolved(value)) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      isPublicHostname(url.hostname) &&
      !url.username &&
      !url.password
      ? url.href.replace(/\/$/, '')
      : null;
  } catch {
    return null;
  }
}

export function asPublicEmail(value: string | undefined | null): string | null {
  if (!value || containsUnresolved(value)) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

export function resolveProductionOrigin(raw: string | undefined): URL | null {
  if (!raw) return null;

  const normalized = asPublicHttpsUrl(raw);
  if (!normalized) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a public absolute HTTPS URL.');
  }

  return new URL(new URL(normalized).origin);
}
