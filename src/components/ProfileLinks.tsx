import { publicEmail, usableProfiles } from '@/lib/site';

/**
 * The one contact row. There is no contact page: this component is rendered on
 * the home page and in the footer, from the same source of truth.
 */
export function ProfileLinks({ className = '' }: { className?: string }) {
  const links: Array<{ label: string; href: string }> = [...usableProfiles];
  if (publicEmail) links.push({ label: 'Email', href: `mailto:${publicEmail}` });
  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-x-6 gap-y-1 ${className}`}>
      {links.map(({ label, href }) => (
        <li key={label}>
          <a
            className="link meta inline-flex min-h-11 items-center"
            href={href}
            rel="me noopener"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
