'use client';
import { useEffect, useRef, useState } from 'react';
import { copy } from '@/lib/site';
export function CopyBibtex({value}:{value:string}){
  const [status,setStatus]=useState<'idle'|'copied'|'error'>('idle');
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  return <div className="citation"><div className="detail-section-heading"><h2>{copy.cite}</h2><button type="button" className={`button ${status==='copied'?'button-primary':'button-secondary'}`} onClick={async()=>{
    if(timer.current)clearTimeout(timer.current);
    try{await navigator.clipboard.writeText(value);setStatus('copied');timer.current=setTimeout(()=>setStatus('idle'),1800);}catch{setStatus('error');}
  }}>{status==='copied'?`${copy.copied} ✓`:copy.copyBibtex}</button></div><p className="copy-status" role="status">{status==='copied'?copy.copied:status==='error'?copy.copyError:''}</p><pre className="citation-code"><code>{value}</code></pre></div>;
}
