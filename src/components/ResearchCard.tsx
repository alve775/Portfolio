import Link from 'next/link';
import type { Entry } from '@/lib/content';
import type { Paper } from '@/lib/schemas';
import { cardHeadLine, researchArea, STATUS_LABEL } from '@/lib/paper';
import { copy } from '@/lib/site';
import { Metric } from './Metric';

/** `compact` is the home-page version: the takeaway without its label, as in the design. */
export function ResearchCard({ paper, compact = false }: { paper: Entry<Paper>; compact?: boolean }) {
  const p = paper.frontmatter;
  return (
    <article className="research-card" data-research-entry>
      <div className="research-card-copy">
        <div className="card-topline">
          <span className={`field-tag${p.status === 'thesis' ? ' field-tag-warm' : ''}`}>{researchArea(p)}</span>
          <span className="label venue">{cardHeadLine(p)}</span>
          <span className="label">{STATUS_LABEL[p.status]}</span>
        </div>
        <h3>
          <Link href={`/research/${paper.slug}/`}>
            {p.title} <span aria-hidden="true">→</span>
          </Link>
        </h3>
        <p className="research-authors">
          {p.authors.join(', ')}
          {p.supervisor ? ` · ${copy.supervisedBy} ${p.supervisor}` : null}
        </p>
        <div className="research-takeaway">
          {compact ? null : <span className="label accent">{copy.shows}</span>}
          <p>{p.takeaway}</p>
        </div>
      </div>
      <Metric metric={p.metric} metricNote={p.metricNote} />
    </article>
  );
}
