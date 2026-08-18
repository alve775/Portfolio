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
      <ul className={`profile-links profile-links-inline ${className}`}>
        {links.map(({ label, href }) => (
          <li key={label}>
            <a className="profile-link" href={href} rel="me noopener">
              {label}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={`profile-links profile-links-grid ${className}`}>
      {links.map(({ label, href }) => (
        <li key={label}>
          <a className="profile-link profile-link-primary" href={href} rel="me noopener">
            <span>{label}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
