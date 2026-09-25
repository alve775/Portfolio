import Link from 'next/link';

import { Nav, type NavItem } from '@/components/Nav';
import { getNotes } from '@/lib/content';
import { emailHref, publicEmail, site } from '@/lib/site';

export function SiteHeader() {
  // Per the brief: if there are no published notes, the section is not linked.
  const hasNotes = getNotes().length > 0;

  const items: NavItem[] = [
    { href: '/projects/', label: 'Projects' },
    { href: '/research/', label: 'Research' },
    ...(hasNotes ? [{ href: '/notes/', label: 'Notes' }] : []),
    { href: '/cv/', label: 'CV' },
  ];

  return (
    <header className="site-header">
      <div className="site-shell site-header-inner">
        <Link href="/" className="site-brand">
          <span className="brand-signal" aria-hidden="true" />
          <span>{site.name}</span>
        </Link>
        <div className="site-header-actions">
          <Nav items={items} />
          {publicEmail ? (
            <a className="header-contact" href={emailHref!}>
              Email <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
