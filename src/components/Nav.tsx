'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string };

/**
 * The only client component on the site. It exists solely so the current
 * section can carry `aria-current` and a visible marker; everything else stays
 * a server component.
 */
export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections">
      <ul className="flex flex-wrap items-center gap-x-5">
        {items.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`meta inline-flex min-h-11 items-center underline-offset-[0.35em] decoration-1 transition-colors duration-[120ms] hover:text-ink ${
                  active ? 'text-ink underline decoration-accent decoration-2' : 'no-underline'
                }`}
              >
                <span aria-hidden="true" className="text-muted/70">
                  /
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
