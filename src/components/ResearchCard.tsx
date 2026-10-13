import Link from 'next/link';
import type { Entry } from '@/lib/content';
import type { Paper } from '@/lib/schemas';
import { cardHeadLine, researchArea, STATUS_LABEL } from '@/lib/paper';
import { site, copy } from '@/lib/site';
import { Metric } from './Metric';

export function ResearchCard({ paper }: { paper: Entry<Paper> }) {
  const p=paper.frontmatter;
  return <article className="research-card" data-research-entry>
    <div className="research-card-copy">
      <div className="card-topline"><span className={`field-tag${p.status==='thesis'?' field-tag-warm':''}`}>{researchArea(p)}</span><span className="label venue">{cardHeadLine(p)}</span><span className="label">{STATUS_LABEL[p.status]}</span></div>
      <h3><Link href={`/research/${paper.slug}/`}>{p.title} <span aria-hidden="true">→</span></Link></h3>
      <p className="research-authors">{p.authors.map((author,i)=><span key={author}>{i>0?', ':''}<span className={author===site.name?'author-self':undefined}>{author}</span></span>)}</p>
      <div className="research-takeaway"><span className="label accent">{copy.shows}</span><p>{p.takeaway}</p></div>
    </div>
    <Metric metric={p.metric} metricNote={p.metricNote} />
  </article>;
}
