'use client';
import { useState } from 'react';
import { copy } from '@/lib/site';
export function EngineeringNotes({study,initialOpen=false}:{study:{contribution:string;decision:string;limitation:string};initialOpen?:boolean}){
  const [open,setOpen]=useState(initialOpen);
  return <details className="engineering-notes" open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary aria-expanded={open}>{open?copy.hideNotes:copy.engineeringNotes} {open?'−':'+'}</summary><dl>{([['contribution',copy.contribution],['decision',copy.decision],['limitation',copy.limitation]] as const).map(([field,label])=><div key={field}><dt className={`label ${field==='limitation'?'venue':'accent'}`}>{label}</dt><dd>{study[field]}</dd></div>)}</dl></details>;
}
