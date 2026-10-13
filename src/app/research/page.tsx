import { RedesignHeader } from '@/components/RedesignHeader';
import { ResearchCard } from '@/components/ResearchCard';
import { Reveal } from '@/components/Reveal';
import { getPapers } from '@/lib/content';
import { routeMetadata } from '@/lib/seo';
import { copy, homeCopy, usableProfiles } from '@/lib/site';

export const metadata=routeMetadata({title:copy.research,description:copy.researchDescription,pathname:'/research/'});
export default function ResearchPage(){
  const papers=getPapers();
  const finished=papers.filter(p=>p.frontmatter.status==='published'||p.frontmatter.status==='accepted').sort((a,b)=>b.frontmatter.year-a.frontmatter.year);
  const thesis=papers.filter(p=>p.frontmatter.status==='thesis');
  const progress=papers.filter(p=>p.frontmatter.status==='in-progress');
  const groups=[[finished,finished.some(p=>p.frontmatter.status==='accepted')?copy.publishedAccepted:copy.published],[thesis,copy.thesis],[progress,copy.inProgress]] as const;
  return <div className="inner-page"><RedesignHeader label={`${homeCopy.station} 04 / ${copy.research}`} title={homeCopy.researchTitle} lead={copy.researchLead} decoration={<div className="research-stats">{[[finished.length,copy.peerReviewed],[finished.filter(p=>p.frontmatter.role==='lead-author').length,copy.leadAuthor],[thesis.length,copy.thesisShort]].map(([n,label])=><div key={label}><strong>{n}</strong><span>{label}</span></div>)}</div>}><div className="header-links">{usableProfiles.filter(p=>['Google Scholar','HuggingFace'].includes(p.label)).map(p=><a className="button button-secondary" key={p.label} href={p.href} target="_blank" rel="noopener noreferrer">{p.label} ↗</a>)}</div></RedesignHeader>
    {papers.length?groups.map(([records,label])=>records.length>0&&<section key={label} data-research-index><div className="redesign-section-heading inner-section-heading"><h2>{label}</h2><span className="label">{records.length} {records.length===1?copy.record:copy.records}</span></div><div className="research-card-list">{records.map(p=><Reveal key={p.slug}><ResearchCard paper={p} /></Reveal>)}</div></section>):<p data-research-index>{copy.emptyResearch}</p>}
  </div>;
}
