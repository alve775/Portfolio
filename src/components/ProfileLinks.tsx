import { emailHref, publicEmail, site, usableProfiles } from '@/lib/site';

/**
 * The one contact row. There is no contact page: this renders on the home page
 * as a table and in the footer as an inline row, from the same source of truth.
 */
export function ProfileLinks({
  variant = 'table',
  className = '',
  emailAddress = false,
}: {
  variant?: 'table' | 'inline';
  className?: string;
  emailAddress?: boolean;
}) {
  const links: Array<{ label: string; href: string }> = [...usableProfiles];
  if (publicEmail && emailHref) links.push({ label: emailAddress ? publicEmail : site.chrome.emailLabel, href: emailHref });
  if (links.length === 0) return null;

  if (variant === 'inline') {
    return (
      <ul className={`profile-links profile-links-inline ${className}`}>
        {links.map(({ label, href }) => (
          <li key={label}>
            <a className="profile-link" href={href} target="_blank" rel="me noopener noreferrer">
              {label} <span aria-hidden="true">↗</span>
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
          <a className="profile-link profile-link-primary" href={href} target="_blank" rel="me noopener noreferrer">
            <span>{label}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
