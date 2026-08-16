import { publicEmail, usableProfiles } from '@/lib/site';

/**
 * The one contact row. There is no contact page: this renders on the home page
 * as a table and in the footer as an inline row, from the same source of truth.
 */
export function ProfileLinks({
  variant = 'table',
  className = '',
}: {
  variant?: 'table' | 'inline';
  className?: string;
}) {
  const links: Array<{ label: string; href: string }> = [...usableProfiles];
  if (publicEmail) links.push({ label: 'Email', href: `mailto:${publicEmail}` });
  if (links.length === 0) return null;

  if (variant === 'inline') {
    return (
      <ul className={`flex flex-wrap items-center gap-x-6 gap-y-1 ${className}`}>
        {links.map(({ label, href }) => (
          <li key={label}>
            <a className="link meta inline-flex min-h-11 items-center" href={href} rel="me noopener">
              {label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={`link-table ${className}`}>
      {links.map(({ label, href }) => (
        <a key={label} href={href} rel="me noopener">
          <span className="mono-label">{label}</span>
        </a>
      ))}
    </div>
  );
}
