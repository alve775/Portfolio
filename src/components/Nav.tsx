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
    <nav aria-label="Sections">
      <ul className="flex flex-wrap items-center gap-x-6">
        {items.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`meta inline-flex min-h-11 items-center no-underline transition-colors duration-[120ms] hover:text-bar-ink ${
                  active
                    ? 'text-bar-ink shadow-[inset_0_-2px_var(--color-accent)]'
                    : 'text-bar-muted'
                }`}
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
