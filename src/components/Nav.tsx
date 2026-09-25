'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string };

/**
 * Client component so the current section can carry `aria-current` and a
 * visible marker. The homepage flight is the other client island; everything
 * else renders on the server.
 */
export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Sections">
      <ul>
        {items.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="nav-link"
                data-active={active ? 'true' : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
