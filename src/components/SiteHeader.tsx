import Link from 'next/link';

import { Nav, type NavItem } from '@/components/Nav';
import { getNotes } from '@/lib/content';
import { emailHref, publicEmail, site } from '@/lib/site';

export function SiteHeader() {
  // Per the brief: if there are no published notes, the section is not linked.
  const hasNotes = getNotes().length > 0;

  const items: NavItem[] = site.chrome.navigation.filter(
    ({ href }) => href !== '/notes/' || hasNotes,
  );

  return (
    <header className="site-header">
      <div className="site-shell site-header-inner">
        <Link href="/" className="site-brand">
          <span className="brand-signal" aria-hidden="true" />
          <span>{site.name}</span>
        </Link>
        <div className="site-header-actions">
          <Nav items={items} label={site.chrome.navigationLabel} />
          {publicEmail && emailHref ? (
            <a className="header-contact" href={emailHref} rel="noopener noreferrer">
              {site.chrome.emailLabel} <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
