import { site } from '@/lib/site';
import { isTodo } from '@/lib/todo';

/** Fixed order, per the brief. */
const PROFILES = [
  { label: 'GitHub', href: site.socials.github },
  { label: 'Google Scholar', href: site.socials.scholar },
  { label: 'HuggingFace', href: site.socials.huggingface },
  { label: 'ORCID', href: site.socials.orcid },
  { label: 'LinkedIn', href: site.socials.linkedin },
  { label: 'Email', href: isTodo(site.email) ? site.email : `mailto:${site.email}` },
] as const;

/**
 * The one contact row. There is no contact page: this component is rendered on
 * the home page and in the footer, from the same source of truth.
 */
export function ProfileLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-6 gap-y-1 ${className}`}>
      {PROFILES.map(({ label, href }) => (
        <li key={label}>
          {isTodo(href) ? (
            <span
              className="meta inline-flex min-h-11 items-center"
              title={`Not yet supplied: ${href}`}
            >
              {label}
              <span className="sr-only"> — URL not yet supplied</span>
            </span>
          ) : (
            <a
              className="link meta inline-flex min-h-11 items-center"
              href={href}
              rel="me noopener"
            >
              {label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
