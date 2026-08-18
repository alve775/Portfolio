'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string };

/**
 * The only client component on the site. It exists solely so the current
 * section can carry `aria-current` and a visible marker.
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
