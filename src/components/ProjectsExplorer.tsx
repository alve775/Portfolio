'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { copy } from '@/lib/site';
import { matchesProject, type ProjectFilter } from '@/lib/project-filters';
type Card={slug:string;status:string;tags?:string[];view:ReactNode};
export function ProjectsExplorer({cards}:{cards:Card[]}){
  const [filter,setFilter]=useState<ProjectFilter>('all');
  const shown=cards.filter(card=>matchesProject(card,filter)).length;
  return <section data-project-index>
    <div className="project-filter-bar"><div className="project-filters" role="group" aria-label={copy.filterProjects}>{copy.filters.map(f=><button className="button button-secondary" key={f.id} type="button" aria-pressed={filter===f.id} onClick={()=>setFilter(f.id)}>{f.label} · {cards.filter(card=>matchesProject(card,f.id)).length}</button>)}</div><p className="label" aria-live="polite">{shown} {copy.of} {cards.length} {copy.records}</p></div>
    {cards.length?<div className="project-timeline">{cards.map(card=><div key={card.slug} hidden={!matchesProject(card,filter)}>{card.view}</div>)}</div>:<p>{copy.emptyProjects}</p>}
    <noscript><style>{'.project-filters,.notes-toggle{display:none}.engineering-notes[hidden]{display:grid}'}</style></noscript>
  </section>;
}
