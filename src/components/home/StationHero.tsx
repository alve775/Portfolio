'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';

import {
  getScrollProgress,
  getStationScrollTop,
} from '@/components/home/flight-model';
import { homeCopy } from '@/lib/site';

export type Station = {
  id: string;
  label: string;
  title: string;
  body: string;
  meta?: string;
  records?: { label: string; status: string }[];
  links: {
    label: string;
    href: string;
    primary?: boolean;
    arrow?: boolean;
    text?: boolean;
  }[];
};

export type ConstellationNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  stations: number[];
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** Below this the scaled text would be too small to read, so the hero unpins. */
const MIN_SCALE = 0.5;
/** Breathing room kept above and below the scaled stage, in pixels. */
const STAGE_MARGIN = 24;
const CORE = { x: 240, y: 210 };
const CHAIN = [
  ['classifier', 'qpain'],
  ['qpain', 'bea'],
  ['bea', 'thesis'],
] as const;

/**
 * Home hero. While the visitor scrolls through it, the stage stays pinned and
 * scroll position chooses the station, so the first scrolls move through the
 * five stations before the page continues to the selected work.
 *
 * When the stage is taller than the window it is scaled down to fit, so the
 * scroll behaviour works on laptop and phone windows alike. Only without
 * JavaScript, or on a window too small to read at half size, is the hero an
 * ordinary section whose station buttons switch the panel in place.
 */
export function StationHero({
  stations,
  nodes,
  stars,
}: {
  stations: Station[];
  nodes: ConstellationNode[];
  stars: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stationsRef = useRef<HTMLDivElement>(null);
  const gradientId = useId().replace(/:/g, '');
  const [active, setActive] = useState(0);
  const [scrollDriven, setScrollDriven] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Fit the pinned stage to the window, and keep the header height available to CSS.
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const header = document.querySelector<HTMLElement>('.site-header');

    const update = () => {
      const headerHeight = Math.round(
        header?.getBoundingClientRect().height ?? 0,
      );
      section.style.setProperty('--hero-header-height', `${headerHeight}px`);
      // offsetHeight ignores the transform, so this is always the natural height.
      const available = window.innerHeight - headerHeight - STAGE_MARGIN;
      const scale = Math.min(1, available / content.offsetHeight);
      section.style.setProperty('--hero-scale', scale.toFixed(3));
      const freeSpace = Math.max(
        0,
        window.innerHeight - headerHeight - content.offsetHeight * scale,
      );
      section.style.setProperty('--hero-free-space', `${freeSpace}px`);
      setReducedMotion(motionQuery.matches);
      setScrollDriven(scale >= MIN_SCALE);
    };

    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(content);
    if (header) resizeObserver.observe(header);
    motionQuery.addEventListener('change', update);
    window.addEventListener('resize', update, { passive: true });

    return () => {
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Map scroll position to the active station while pinned.
  useEffect(() => {
    const section = sectionRef.current;
    if (!scrollDriven || !section) {
      section?.style.removeProperty('--hero-fill');
      return;
    }

    let frameId = 0;
    const measure = () => {
      frameId = 0;
      const progress = getScrollProgress({
        scrollY: window.scrollY,
        sectionTop: section.getBoundingClientRect().top + window.scrollY,
        sectionHeight: section.offsetHeight,
        viewportHeight: window.innerHeight,
      });
      const position = progress * (stations.length - 1);
      section.style.setProperty(
        '--hero-fill',
        ((position + 1) / stations.length).toFixed(4),
      );
      setActive(Math.round(position));
    };
    const schedule = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frameId);
    };
  }, [scrollDriven, stations.length]);

  // On phones the station row scrolls sideways; keep the active station in view
  // by scrolling the row itself (scrollIntoView would also move the page).
  useEffect(() => {
    const row = stationsRef.current;
    const button = row?.children[active] as HTMLElement | undefined;
    if (!row || !button || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({
      left: button.offsetLeft - row.offsetLeft,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [active, reducedMotion]);

  // Pause the looping decoration while the hero is off screen.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      section.dataset.inView = String(entry.isIntersecting);
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    const section = sectionRef.current;
    if (!scrollDriven || !section) {
      setActive(index);
      return;
    }
    window.scrollTo({
      top: getStationScrollTop({
        sectionTop: section.getBoundingClientRect().top + window.scrollY,
        sectionHeight: section.offsetHeight,
        viewportHeight: window.innerHeight,
        stationIndex: index,
        stationCount: stations.length,
      }),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const lit = (node: ConstellationNode) => node.stations.includes(active);
  const edges = nodes.map((node) => ({ a: CORE, b: node, on: lit(node) }));
  for (const [fromId, toId] of CHAIN) {
    const from = nodes.find((node) => node.id === fromId);
    const to = nodes.find((node) => node.id === toId);
    if (from && to) edges.push({ a: from, b: to, on: lit(from) && lit(to) });
  }
  return (
    <section
      ref={sectionRef}
      className="station-hero"
      data-station-hero
      data-scroll-driven={scrollDriven ? 'true' : 'false'}
      aria-label={homeCopy.constellation}
    >
      <div className="hero-stage">
        <div className="hero-backdrop" aria-hidden="true">
          {stars}
        </div>

        <div ref={contentRef} className="hero-content">
          <div className="hero-topline">
            <a className="button button-secondary" href="#selected-work">
              {homeCopy.skipWork} <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div className="hero-grid">
            <div
              ref={stationsRef}
              className="hero-stations"
              role="group"
              aria-label={homeCopy.constellation}
            >
              {stations.map((station, index) => (
                <button
                  key={station.id}
                  type="button"
                  aria-label={station.label}
                  aria-current={active === index ? 'true' : undefined}
                  aria-controls={`station-${station.id}`}
                  onClick={() => goTo(index)}
                >
                  <span className="station-name">{station.label}</span>
                  {active === index ? (
                    <span aria-hidden="true" className="station-progress" />
                  ) : null}
                </button>
              ))}
            </div>

            <div
              className="hero-panels"
              aria-live={scrollDriven ? undefined : 'polite'}
            >
              {stations.map((station, index) => {
                const isActive = index === active;
                return (
                  <article
                    // A new key on activation replays the entrance animation.
                    key={isActive ? `${station.id}-active` : station.id}
                    id={`station-${station.id}`}
                    className="hero-panel"
                    data-active={isActive ? 'true' : 'false'}
                  >
                    {index === 0 ? (
                      <h1 className="hero-heading hero-enter">
                        {station.title}
                      </h1>
                    ) : (
                      <h2 className="hero-heading hero-enter">
                        {station.title}
                      </h2>
                    )}
                    {station.meta ? (
                      <p className="label venue hero-enter">{station.meta}</p>
                    ) : null}
                    <p className="hero-lead hero-enter">{station.body}</p>
                    {station.records ? (
                      <ul className="hero-records hero-enter">
                        {station.records.map((record) => (
                          <li key={record.label}>
                            {record.label} <span>· {record.status}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="hero-actions hero-enter">
                      {station.links.map((link) => {
                        const className = link.text
                          ? 'hero-contact-link'
                          : `button ${link.primary ? 'button-primary' : 'button-secondary'}`;
                        return link.href.startsWith('/') ? (
                          <Link
                            className={className}
                            href={link.href}
                            key={link.href}
                          >
                            {link.label}
                            {link.arrow ? (
                              <span aria-hidden="true">↗</span>
                            ) : null}
                          </Link>
                        ) : (
                          <a
                            className={className}
                            href={link.href}
                            key={link.href}
                            target={
                              link.href.startsWith('https:')
                                ? '_blank'
                                : undefined
                            }
                            rel="noopener noreferrer"
                          >
                            {link.label} <span aria-hidden="true">↗</span>
                          </a>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="constellation" aria-hidden="true">
              <svg
                viewBox="0 0 480 420"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  {/* Bright at the origin, fading toward the node, like the design's gradient lines. */}
                  {edges.map((edge, index) => (
                    <linearGradient
                      key={index}
                      id={`${gradientId}-${index}`}
                      gradientUnits="userSpaceOnUse"
                      x1={edge.a.x}
                      y1={edge.a.y}
                      x2={edge.b.x}
                      y2={edge.b.y}
                    >
                      <stop offset="0" style={{ stopColor: 'var(--accent)' }} />
                      <stop
                        offset="1"
                        style={{
                          stopColor: 'var(--accent)',
                          stopOpacity: 0.35,
                        }}
                      />
                    </linearGradient>
                  ))}
                </defs>
                {edges.map((edge, index) => (
                  <line
                    // A new key when an edge lights up replays its draw-in animation.
                    key={`${index}-${edge.on}`}
                    x1={edge.a.x}
                    y1={edge.a.y}
                    x2={edge.b.x}
                    y2={edge.b.y}
                    className={
                      edge.on ? 'constellation-edge lit' : 'constellation-edge'
                    }
                    style={
                      edge.on
                        ? ({
                            '--len': Math.hypot(
                              edge.b.x - edge.a.x,
                              edge.b.y - edge.a.y,
                            ).toFixed(1),
                            '--edge-gradient': `url(#${gradientId}-${index})`,
                          } as CSSProperties)
                        : undefined
                    }
                  />
                ))}
                <circle cx={CORE.x} cy={CORE.y} r="30" className="core-ring" />
                {[0, 1, 2].map((index) => (
                  <circle
                    key={index}
                    cx={CORE.x}
                    cy={CORE.y}
                    r="30"
                    className="core-pulse"
                    style={{ animationDelay: `${index}s` }}
                  />
                ))}
                <g className="core-orbit">
                  <circle cx={CORE.x} cy={CORE.y - 48} r="3.5" />
                </g>
                <circle cx={CORE.x} cy={CORE.y} r="7" className="core-dot" />
                {nodes.map((node) => (
                  <g key={node.id} data-lit={lit(node)}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={lit(node) ? 6 : 4}
                      className="constellation-node"
                    />
                    <text x={node.x} y={node.y + 26} textAnchor="middle">
                      {node.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div className="hero-controls" aria-hidden="true">
            <span className="counter-line">
              <i
                style={
                  scrollDriven
                    ? undefined
                    : { transform: `scaleX(${(active + 1) / stations.length})` }
                }
              />
            </span>
          </div>
        </div>
      </div>

      <noscript>
        <style>
          {
            '.hero-panels{gap:48px}.hero-panel{grid-area:auto!important;visibility:visible!important}.hero-stations,.hero-controls{display:none}.hero-enter{animation:none!important}'
          }
        </style>
      </noscript>
    </section>
  );
}
