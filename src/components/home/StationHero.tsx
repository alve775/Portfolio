'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { homeCopy } from '@/lib/site';

export type Station = { id:string; label:string; title:string; body:string; meta?:string; links:{label:string;href:string;primary?:boolean}[] };
export type ConstellationNode = { id:string; label:string; x:number; y:number; stations:number[] };
function subscribeMotion(callback:()=>void) { const q=matchMedia('(prefers-reduced-motion: reduce)'); q.addEventListener('change',callback); return ()=>q.removeEventListener('change',callback); }
function subscribeVisibility(callback:()=>void) { document.addEventListener('visibilitychange',callback); return ()=>document.removeEventListener('visibilitychange',callback); }

export function StationHero({ stations, nodes, stars }: {stations:Station[];nodes:ConstellationNode[];stars:React.ReactNode}) {
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [cycle,setCycle]=useState(0);
  const reduce=useSyncExternalStore(subscribeMotion,()=>matchMedia('(prefers-reduced-motion: reduce)').matches,()=>true);
  const visible=useSyncExternalStore(subscribeVisibility,()=>!document.hidden,()=>false);
  const playing=!paused && !hovered && !focused && !reduce && visible;
  const hero=useRef<HTMLElement>(null);
  const frame=useRef(0);
  useEffect(()=>{
    const node=hero.current;if(!node || !('IntersectionObserver' in window))return;
    const observer=new IntersectionObserver(([entry])=>{node.dataset.inView=String(entry.isIntersecting);});
    observer.observe(node);return()=>observer.disconnect();
  },[]);
  useEffect(()=> {
    if (!playing) return;
    const timer=setInterval(()=>setActive(i=>(i+1)%stations.length),5000);
    return ()=>clearInterval(timer);
  },[playing,active,cycle,stations.length]);
  useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
  const select=(index:number)=>{setActive(index);setCycle(c=>c+1);};
  const lit=(node:ConstellationNode)=>node.stations.includes(active);
  const core={x:240,y:210};
  const edges=nodes.map(node=>({a:core,b:node,on:lit(node)}));
  for(const [a,b] of [['classifier','qpain'],['qpain','bea'],['bea','thesis']]) {
    const from=nodes.find(n=>n.id===a), to=nodes.find(n=>n.id===b);
    if(from && to) edges.push({a:from,b:to,on:lit(from)&&lit(to)});
  }
  return <section ref={hero} className="station-hero" data-station-hero data-playing={playing} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false);}} onPointerMove={e=>{
    if(reduce || !matchMedia('(pointer: fine)').matches || frame.current) return;
    const box=e.currentTarget.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;
    frame.current=requestAnimationFrame(()=>{hero.current?.style.setProperty('--mouse-x',`${x}px`);hero.current?.style.setProperty('--mouse-y',`${y}px`);frame.current=0;});
  }}>
    {stars}<div className="hero-scan" aria-hidden="true" />
    <div className="hero-topline label"><span>{homeCopy.constellation}</span><a href="#selected-work">{homeCopy.skipWork} ↓</a></div>
    <div className="hero-grid">
      <div className="hero-stations" aria-label={homeCopy.constellation}>{stations.map((s,i)=><button key={s.id} type="button" aria-current={active===i?'true':undefined} aria-controls={`station-${s.id}`} onClick={()=>select(i)}><span>{String(i+1).padStart(2,'0')} {s.label}</span>{active===i && <span key={cycle} aria-hidden="true" className="station-progress" style={{animationPlayState:playing?'running':'paused'}} />}</button>)}</div>
      <div className="hero-panels">{stations.map((s,i)=><article key={`${s.id}-${i===active?cycle:0}`} id={`station-${s.id}`} hidden={i!==active} className="hero-panel">
        <p className="label hero-enter">{homeCopy.station} {String(i+1).padStart(2,'0')} / {s.label}</p>
        {i===0?<h1 className="hero-heading hero-enter">{s.title}</h1>:<h2 className="hero-heading hero-enter">{s.title}</h2>}
        {s.meta && <p className="label venue hero-enter">{s.meta}</p>}
        <p className="hero-lead hero-enter">{s.body}</p>
        <div className="hero-actions hero-enter">{s.links.map(link=>link.href.startsWith('/')?<Link className={`button ${link.primary?'button-primary':'button-secondary'}`} href={link.href} key={link.href}>{link.label}</Link>:<a className={`button ${link.primary?'button-primary':'button-secondary'}`} href={link.href} key={link.href} target={link.href.startsWith('https:') ? '_blank' : undefined} rel="noopener noreferrer">{link.label} ↗</a>)}</div>
      </article>)}</div>
      <div className="constellation" aria-hidden="true"><svg viewBox="0 0 480 420" fill="none" aria-hidden="true" focusable="false">
        {edges.map((edge,i)=><line key={`${i}-${edge.on}`} x1={edge.a.x} y1={edge.a.y} x2={edge.b.x} y2={edge.b.y} className={edge.on?'constellation-edge lit':'constellation-edge'} pathLength="1" />)}
        <circle cx="240" cy="210" r="30" className="core-ring" />
        {[0,1,2].map(i=><circle key={i} cx="240" cy="210" r="30" className="core-pulse" style={{animationDelay:`${i}s`}} />)}
        <g className="core-orbit"><circle cx="240" cy="162" r="3.5" /></g><circle cx="240" cy="210" r="7" className="core-dot" />
        {nodes.map(node=><g key={node.id} data-lit={lit(node)}><circle cx={node.x} cy={node.y} r={lit(node)?6:4} className="constellation-node" /><text x={node.x} y={node.y+26} textAnchor="middle">{node.label}</text></g>)}
      </svg></div>
    </div>
    <div className="hero-controls label"><span>{String(active+1).padStart(2,'0')} / {String(stations.length).padStart(2,'0')}</span><button type="button" onClick={()=>setPaused(p=>!p)} aria-label={paused?homeCopy.play:homeCopy.pause} aria-pressed={paused} disabled={reduce}>{paused?'▶':'Ⅱ'}</button><span className="counter-line" aria-hidden="true"><i style={{transform:`scaleX(${(active+1)/stations.length})`}} /></span><span>{homeCopy.choose}</span></div>
    <noscript><style>{'@layer base{.hero-panel[hidden]{display:flex!important}}.hero-panels{display:grid;gap:48px}.hero-stations,.hero-controls{display:none}.hero-enter{animation:none!important}'}</style></noscript>
  </section>;
}
