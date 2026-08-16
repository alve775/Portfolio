import type { ReactNode } from 'react';

/**
 * The display block at the top of every page: optional eyebrow, one h1 set at
 * display size, optional lede. This is where the page gets its presence.
 */
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
    <div className="pb-10">
      {eyebrow ? <p className="eyebrow mono-label mb-5">{eyebrow}</p> : null}
      <h1 className={size === 'display' ? 'display' : 'title-display measure'}>{title}</h1>
      {lede ? <p className="lede mt-6">{lede}</p> : null}
      {children}
    </div>
  );
}
