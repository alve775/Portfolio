import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Entry } from '@/lib/content';
import type { Paper, Project } from '@/lib/schemas';
import { safeOptionalBody } from '@/lib/publishability';
import { cardHeadLine, researchArea, STATUS_LABEL } from '@/lib/paper';
import { copy, homeCopy } from '@/lib/site';
import { AuthorList } from './RecordCard';
import { Metric } from './Metric';
import { CopyBibtex } from './CopyBibtex';
import { Reveal } from './Reveal';

export function ResearchDetail({paper,papers,classifier}:{paper:Entry<Paper>;papers:Entry<Paper>[];classifier?:Entry<Project>}){
  const p=paper.frontmatter, body=safeOptionalBody(paper.body), index=papers.findIndex(record=>record.slug===paper.slug);
  const dataset=p.results?.length?p.abstract.match(/dataset of ([\d,]+).*?sentences/)?.[1]:undefined;
  const related=paper.slug==='bangla-sentence-type-classification'?classifier?.frontmatter.liveUrl:undefined;
  return <article className="research-detail-new" data-research-detail>
    <Link className="back-link label" href="/research/">← {copy.allResearch}</Link>
    <header className="research-detail-header"><div><div className="card-topline"><span className={`field-tag${p.status==='thesis'?' field-tag-warm':''}`}>{researchArea(p)}</span><span className="label venue">{cardHeadLine(p)}</span><span className="label accent">{STATUS_LABEL[p.status]}</span></div><h1>{p.title}</h1><AuthorList authors={p.authors} /></div>
      {p.status!=='thesis'&&p.metric&&p.metricNote&&<aside className="detail-metric-panel"><Metric metric={p.metric} metricNote={p.metricNote} />{!!p.results?.length&&<div className="supporting-stats">{dataset&&<div><strong>{dataset}</strong><span>{copy.sentences}</span></div>}<div><strong>{p.results.length}</strong><span>{copy.encoders}</span></div></div>}</aside>}
    </header>
    <div className="research-detail-columns"><div className="research-detail-body">
      <Reveal><section className="takeaway-panel"><p className="label accent">{copy.shows}</p><p>{p.takeaway}</p></section></Reveal>
      <Reveal><section><div className="detail-section-heading"><h2>{p.abstractLabel==='summary'?copy.overview:copy.abstract}</h2><span className="label">{p.abstractLabel}</span></div><p className="abstract-copy">{p.abstract}</p></section></Reveal>
      {p.bibtex&&<Reveal><CopyBibtex value={p.bibtex} /></Reveal>}
      {body&&<Reveal><section><h2>{copy.notes}</h2><div className="prose-content"><MDXRemote source={body} /></div></section></Reveal>}
    </div>
    {(p.pdfUrl||p.codeUrl||related||p.results?.length)?<aside className="research-sidebar">
      {(p.pdfUrl||p.codeUrl||related)&&<section className="sidebar-panel"><h2 className="label">{copy.links}</h2>{p.pdfUrl&&<a className="button button-primary" href={p.pdfUrl} target="_blank" rel="noopener noreferrer">{p.pdfUrl.startsWith('https://doi.org/')?copy.paperDoi:copy.paper} ↗</a>}{p.codeUrl&&<a className="button button-secondary" href={p.codeUrl} target="_blank" rel="noopener noreferrer">{copy.code} ↗</a>}{related&&<a className="button button-secondary" href={related} target="_blank" rel="noopener noreferrer">{homeCopy.tryClassifier} ↗</a>}</section>}
      {!!p.results?.length&&<section className="sidebar-panel"><h2 className="label">{copy.modelResults}</h2>{(['monolingual','multilingual'] as const).map(group=><div key={group}><p className="label accent result-group">{copy[group]}</p><dl className="model-results">{p.results!.filter(r=>r.group===group).map(r=><div key={r.model}><dt>{r.model}</dt><dd>{`${r.accuracy.toFixed(2)}%`}</dd></div>)}</dl></div>)}{paper.slug==="bangla-sentence-type-classification"&&<p className="metric-note">{copy.modelCaveat}</p>}</section>}
    </aside>:null}</div>
    {papers.length>1&&<nav className="record-navigation" aria-label={copy.research}>{([[-1,copy.previous],[1,copy.next]] as const).map(([offset,label])=>{const record=papers[(index+offset+papers.length)%papers.length];return <Link key={offset} href={`/research/${record.slug}/`}><span className="label">{offset<0?'← ':''}{label}{offset>0?' →':''}</span><span>{record.frontmatter.title}</span></Link>;})}</nav>}
  </article>;
}
