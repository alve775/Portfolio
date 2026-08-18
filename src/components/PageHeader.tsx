import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  lede,
  size = 'display',
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  /** `compact` for long paper titles, which cannot take the full display size. */
  size?: 'display' | 'compact';
  children?: ReactNode;
}) {
  return (
    <header className={`page-header ${size === 'compact' ? 'page-header-compact' : ''}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className={size === 'display' ? 'page-title' : 'page-title page-title-compact'}>
        {title}
      </h1>
      {lede ? <p className="page-lede">{lede}</p> : null}
      {children}
    </header>
  );
}
