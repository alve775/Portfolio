export function MiniConstellation(){
  return <svg className="mini-constellation" aria-hidden="true" focusable="false" viewBox="0 0 260 170" fill="none">{[[40,35],[25,115],[95,150],[215,30],[235,110],[185,155]].map(([x,y],i)=><g key={x} className={i<3?'lit':''}><line x1="130" y1="85" x2={x} y2={y} /><circle cx={x} cy={y} r={i<3?5:3.5} /></g>)}<circle className="mini-ring" cx="130" cy="85" r="18" /><circle className="mini-core" cx="130" cy="85" r="6" /></svg>;
}
