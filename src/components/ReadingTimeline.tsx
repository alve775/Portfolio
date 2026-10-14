'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import { getReadingFocus, getReadingProgress } from '@/lib/reading-stations';

const NODE_OFFSET = 37;
const RAIL_INSET = 8;

export function ReadingStation({
  children,
  hidden = false,
}: {
  children: ReactNode;
  hidden?: boolean;
}) {
  return (
    <div className="reading-station" data-reading-station hidden={hidden}>
      <span className="reading-station-node" aria-hidden="true" />
      {children}
    </div>
  );
}

export function ReadingTimeline({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = ref.current;
    if (!timeline) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stations = [
      ...timeline.querySelectorAll<HTMLElement>('[data-reading-station]'),
    ];
    let frame = 0;
    let disposed = false;

    const update = () => {
      frame = 0;
      timeline.dataset.readingMotion = motion.matches ? 'static' : 'scroll';
      if (motion.matches) {
        timeline.style.removeProperty('--reading-progress');
        stations.forEach((station) => delete station.dataset.readingState);
        return;
      }

      const visible = stations.filter((station) => !station.hidden);
      const top = timeline.getBoundingClientRect().top;
      // A station turns on as its node reaches the reading area in the viewport.
      const last = visible.at(-1);
      const focus =
        getReadingFocus({
          viewportHeight: window.innerHeight,
          atEnd:
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight - 1,
          lastNode: top + (last?.offsetTop ?? 0) + NODE_OFFSET,
        }) - top;
      const end = timeline.offsetHeight - RAIL_INSET;
      const { progress, activeIndex } = getReadingProgress({
        offsets: visible.map((station) => station.offsetTop + NODE_OFFSET),
        focus,
        start: RAIL_INSET,
        end,
      });

      timeline.style.setProperty('--reading-progress', progress.toFixed(5));
      visible.forEach((station, index) => {
        station.dataset.readingState =
          index === activeIndex
            ? 'active'
            : focus > end || index < activeIndex
              ? 'passed'
              : 'upcoming';
      });
    };

    const schedule = () => {
      if (!disposed && frame === 0)
        frame = window.requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(timeline);
    stations.forEach((station) => observer.observe(station));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    motion.addEventListener('change', schedule);
    void document.fonts.ready.then(schedule);
    schedule();

    return () => {
      disposed = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, [children]);

  return (
    <div
      ref={ref}
      className={`${className} reading-timeline`}
      data-reading-motion="static"
    >
      <div className="reading-rail" aria-hidden="true">
        <span />
      </div>
      {children}
    </div>
  );
}
