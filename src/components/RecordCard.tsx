import { Fragment } from 'react';

import Link from 'next/link';

import type { Entry } from '@/lib/content';
import { STATUS_LABEL, cardHeadLine } from '@/lib/paper';
import type { Paper } from '@/lib/schemas';
import { site } from '@/lib/site';

/** Author list in exact publication order. The owner's name is never moved. */
export function AuthorList({ authors }: { authors: string[] }) {
  return (
    <p className="mt-3 text-[0.9375rem] text-muted">
      {authors.map((author, index) => (
        <Fragment key={`${author}-${index}`}>
          {index > 0 ? ', ' : null}
          <span className={author === site.name ? 'self' : undefined}>{author}</span>
        </Fragment>
      ))}
    </p>
  );
}

export function StatusBadge({ status }: { status: Paper['status'] }) {
  const quiet = status === 'in-progress';
  return <span className={quiet ? 'badge badge-quiet' : 'badge'}>{STATUS_LABEL[status]}</span>;
}

/**
 * The takeaway block: the owner's plain statement of what the work shows.
 *
 * It sits above the abstract on the detail page and inside the card in every
 * index, because it is the thing a professor with 40 seconds should read first.
 */
export function Takeaway({
  children,
  size = 'sm',
  className = '',
}: {
  children: string;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  return (
    <div className={`takeaway ${className}`}>
      <span className="mono-label block text-accent">What this shows</span>
      <p
        className={
          size === 'lg'
            ? 'mt-2 text-[1.125rem] leading-[1.6]'
            : 'mt-1.5 text-[0.9375rem] leading-[1.6]'
        }
      >
        {children}
      </p>
    </div>
  );
}

/** One paper, project or thesis as a record card. Used by home and /research. */
export function RecordCard({ paper, index }: { paper: Entry<Paper>; index: number }) {
  const { frontmatter } = paper;

  return (
    <article className="card card-link">
      <div className="card-head">
        <span className="meta">
          <span className="text-accent">{String(index).padStart(2, '0')}</span>
          {'  '}
          {cardHeadLine(frontmatter)}
        </span>
        <span className="flex items-center gap-2">
          {frontmatter.draft ? (
            <span className="badge badge-draft" title="Not included in the production build">
              draft
            </span>
          ) : null}
          <StatusBadge status={frontmatter.status} />
        </span>
      </div>
      <div className="card-body">
        <h3 className="title-lg">
          <Link className="card-title" href={`/research/${paper.slug}/`}>
            {frontmatter.title}
          </Link>
        </h3>
        <AuthorList authors={frontmatter.authors} />
        <Takeaway className="mt-4">{frontmatter.takeaway}</Takeaway>
      </div>
    </article>
  );
}
