'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

/** Visible by default, including without JS; fallback observer never re-hides. */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches || CSS.supports('animation-timeline: view()')) return;
    if (!('IntersectionObserver' in window)) return;
    if (node.getBoundingClientRect().top < innerHeight) return;
    node.classList.add('reveal-pending');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.remove('reveal-pending'); node.classList.add('is-visible'); observer.disconnect(); }
    }, {threshold:0.15});
    observer.observe(node);
    return () => { observer.disconnect(); node.classList.remove('reveal-pending'); };
  }, []);
  return <div ref={ref} className="reveal">{children}</div>;
}
