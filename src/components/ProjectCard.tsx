import Image from 'next/image';
import type { Entry } from '@/lib/content';
import type { Project } from '@/lib/schemas';
import { copy } from '@/lib/site';
import { Metric } from './Metric';

export function ProjectCard({ project, children }: { project: Entry<Project>; children?: React.ReactNode }) {
  const p = project.frontmatter;
  return <article className="project-card" data-project-card>
    <span className="timeline-node" aria-hidden="true" />
    <div className={`project-card-grid${p.image ? '' : ' no-media'}`}>
      {p.image && <figure className="project-media"><div className="media-frame"><Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="(max-width: 860px) calc(100vw - 88px), 480px" /></div><figcaption>{p.image.caption}</figcaption></figure>}
      <div className="project-card-copy">
        <div className="card-topline"><span className="label">{p.stack.join(' · ')}</span><span className={`status-badge status-${p.status}`}>{p.status==='live' && <i aria-hidden="true" />}{copy.statuses[p.status]}</span></div>
        <h3>{p.title}</h3>
        <Metric metric={p.metric} metricNote={p.metricNote} />
        <dl className="project-facts-new">{([['problem',copy.problem],['approach',copy.approach],['result',copy.result]] as const).map(([field,label])=><div key={field}><dt className="label">{label}</dt><dd>{p[field]}</dd></div>)}</dl>
        <div className="card-actions"><a className="button button-secondary" href={p.repoUrl} target="_blank" rel="noopener noreferrer">{copy.repository} ↗</a>{p.status==='live' && p.liveUrl && <a className="button button-primary" href={p.liveUrl} target="_blank" rel="noopener noreferrer">{copy.openLive} ↗</a>}</div>
      </div>
    </div>
    {children}
  </article>;
}
