'use client';

import { useEffect, useRef } from 'react';

/**
 * A faint mint glow that follows the pointer on every page. It sits behind the
 * content with the starfield, moves by transform only (one composited layer,
 * no repaint), and is skipped for touch input and reduced motion.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = ref.current;
    if (!glow) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frameId = 0;
    let x = 0;
    let y = 0;

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        glow.dataset.active = 'true';
      });
    };
    const leave = () => {
      delete glow.dataset.active;
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}
