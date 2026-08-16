import Link from 'next/link';

import { Nav, type NavItem } from '@/components/Nav';
import { getNotes } from '@/lib/content';
import { site } from '@/lib/site';

/**
 * A solid ink bar. It anchors the page immediately and gives the light ground
 * below it something to sit against.
 */
export function SiteHeader() {
  // Per the brief: if there are no published notes, the section is not linked.
  const hasNotes = getNotes().length > 0;

  const items: NavItem[] = [
    { href: '/research/', label: 'research' },
    { href: '/projects/', label: 'projects' },
    ...(hasNotes ? [{ href: '/notes/', label: 'notes' }] : []),
    { href: '/cv/', label: 'cv' },
  ];

  return (
    <header className="bg-bar text-bar-ink">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-1 py-2">
        <Link
          href="/"
          className="meta inline-flex min-h-11 items-center whitespace-nowrap text-bar-ink no-underline"
        >
          {site.name}
        </Link>
        <Nav items={items} />
      </div>
    </header>
  );
}
