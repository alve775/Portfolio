import { Fragment } from 'react';

import Link from 'next/link';

import type { Entry } from '@/lib/content';
import { STATUS_LABEL, cardHeadLine, researchArea } from '@/lib/paper';
import type { Paper } from '@/lib/schemas';
import { site } from '@/lib/site';

/** Author list in exact publication order. The owner's name is never moved. */
export function AuthorList({ authors }: { authors: string[] }) {
  return (
    <p className="author-list">
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
  const quiet = status === 'in-progress' || status === 'thesis';
  return <span className={quiet ? 'status status-quiet' : 'status'}>{STATUS_LABEL[status]}</span>;
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
    <div className={`takeaway takeaway-${size} ${className}`}>
      <span className="takeaway-label">What this shows</span>
      <p>{children}</p>
    </div>
  );
}

/** One paper or thesis as a node in the vertical research index. */
export function RecordCard({ paper }: { paper: Entry<Paper> }) {
  const { frontmatter } = paper;

  return (
    <article className="research-entry" data-research-entry>
      <p className="research-domain">{researchArea(frontmatter)}</p>
      <div className="research-entry-content">
        <div className="research-meta-row">
          <span className="meta">{cardHeadLine(frontmatter)}</span>
          <span className="status-row">
          {frontmatter.draft ? (
            <span className="status status-draft" title="Not included in the production build">
              draft
            </span>
          ) : null}
          <StatusBadge status={frontmatter.status} />
          </span>
        </div>
        <h3 className="research-title">
          <Link href={`/research/${paper.slug}/`}>
            {frontmatter.title}
            <span className="research-arrow" aria-hidden="true">↗</span>
          </Link>
        </h3>
        <AuthorList authors={frontmatter.authors} />
        <Takeaway>{frontmatter.takeaway}</Takeaway>
      </div>
    </article>
  );
}
