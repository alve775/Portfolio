'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type FlightStationContent,
  canEnhanceFlight,
  getScrollProgress,
  getStationScrollTop,
} from '@/components/home/flight-model';
import { ResearchFlightCanvas } from '@/components/home/ResearchFlightCanvas';

import styles from './research-flight.module.css';

type ResearchFlightProps = Readonly<{
  stations: readonly FlightStationContent[];
}>;

const STATIC_LAYOUT_QUERY = '(max-width: 22rem), (max-height: 42rem)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function ResearchFlight({ stations }: ResearchFlightProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stationRefs = useRef<Array<HTMLElement | null>>([]);
  const progressRef = useRef(0);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [capable, setCapable] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lateralScale, setLateralScale] = useState(1);
  const enhanced = capable && canvasReady && !canvasFailed && !reducedMotion;
  const displayedActiveIndex = enhanced ? activeIndex : 0;

  useEffect(() => {
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const staticLayoutQuery = window.matchMedia(STATIC_LAYOUT_QUERY);

    const updateCapability = () => {
      const motionIsReduced = motionQuery.matches;
      const browserIsCapable =
        'ResizeObserver' in window &&
        'IntersectionObserver' in window &&
        'requestAnimationFrame' in window &&
        'HTMLCanvasElement' in window;
      const rootFontSize = Number.parseFloat(
        window.getComputedStyle(document.documentElement).fontSize,
      );

      setReducedMotion(motionIsReduced);
      setCapable(
        canEnhanceFlight({
          browserSupported: browserIsCapable,
          reducedMotion: motionIsReduced,
          staticLayout: staticLayoutQuery.matches,
          canvasFailed,
          rootFontSize,
        }),
      );
      setLateralScale(window.innerWidth < 768 ? 0.58 : 1);
    };

    updateCapability();
    motionQuery.addEventListener('change', updateCapability);
    staticLayoutQuery.addEventListener('change', updateCapability);
    window.addEventListener('resize', updateCapability, { passive: true });

    return () => {
      motionQuery.removeEventListener('change', updateCapability);
      staticLayoutQuery.removeEventListener('change', updateCapability);
      window.removeEventListener('resize', updateCapability);
    };
  }, [canvasFailed]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) return;

    const setHeaderOffset = () => {
      const header = document.querySelector<HTMLElement>('.site-header');
      section.style.setProperty(
        '--flight-header-height',
        `${header?.getBoundingClientRect().height ?? 0}px`,
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setVisible(isVisible);
        if (isVisible) {
          document.body.dataset.flightActive = 'true';
        } else {
          delete document.body.dataset.flightActive;
        }
      },
      { threshold: 0 },
    );
    const header = document.querySelector<HTMLElement>('.site-header');
    const headerObserver = new ResizeObserver(setHeaderOffset);

    observer.observe(section);
    if (header) headerObserver.observe(header);
    setHeaderOffset();

    return () => {
      observer.disconnect();
      headerObserver.disconnect();
      delete document.body.dataset.flightActive;
    };
  }, []);

  useEffect(() => {
    if (!enhanced) {
      progressRef.current = 0;
      progressBarRef.current?.style.setProperty('--flight-progress', '0%');
      return;
    }

    let frameId = 0;

    const measure = () => {
      frameId = 0;
      const section = sectionRef.current;
      if (!section) return;

      const progress = getScrollProgress({
        scrollY: window.scrollY,
        sectionTop: section.getBoundingClientRect().top + window.scrollY,
        sectionHeight: section.offsetHeight,
        viewportHeight: window.innerHeight,
      });
      const nextIndex = Math.round(progress * Math.max(stations.length - 1, 0));

      progressRef.current = progress;
      progressBarRef.current?.style.setProperty(
        '--flight-progress',
        `${progress * 100}%`,
      );
      setActiveIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex,
      );
    };

    const scheduleMeasurement = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(measure);
      }
    };

    scheduleMeasurement();
    window.addEventListener('scroll', scheduleMeasurement, { passive: true });
    window.addEventListener('resize', scheduleMeasurement, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleMeasurement);
      window.removeEventListener('resize', scheduleMeasurement);
      window.cancelAnimationFrame(frameId);
    };
  }, [enhanced, stations.length]);

  const handleCanvasReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleCanvasFailure = useCallback(() => {
    setCanvasReady(false);
    setCanvasFailed(true);
  }, []);

  const scrollToStation = (stationIndex: number) => {
    const section = sectionRef.current;

    if (!enhanced || !section) {
      stationRefs.current[stationIndex]?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
      return;
    }

    const top = getStationScrollTop({
      sectionTop: section.getBoundingClientRect().top + window.scrollY,
      sectionHeight: section.offsetHeight,
      viewportHeight: window.innerHeight,
      stationIndex,
      stationCount: stations.length,
    });

    window.scrollTo({
      top,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      className={styles.root}
      data-research-flight
      data-enhanced={enhanced ? 'true' : 'false'}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-label="Professional journey"
    >
      <div className={styles.viewport}>
        <ResearchFlightCanvas
          progressRef={progressRef}
          enabled={capable && !canvasFailed}
          visible={visible}
          lateralScale={lateralScale}
          onReady={handleCanvasReady}
          onFailure={handleCanvasFailure}
        />

        <div className={styles.frame}>
          <div className={styles.sceneLabel} aria-hidden="true">
            <span>Work constellation</span>
            <span>Path 01 / 05 stations</span>
          </div>

          <p id="flight-instructions" className={styles.instructions}>
            Scroll to travel through the work, or choose a station.
          </p>

          <nav
            className={styles.controls}
            aria-label="Portfolio stations"
            aria-describedby="flight-instructions"
          >
            <ol>
              {stations.map((station, index) => (
                <li key={station.id}>
                  <button
                    type="button"
                    className={styles.stationButton}
                    aria-label={`Go to ${station.label} station`}
                    aria-controls={`flight-station-${station.id}`}
                    aria-pressed={displayedActiveIndex === index}
                    onClick={() => scrollToStation(index)}
                  >
                    <span aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.buttonLabel}>{station.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className={styles.copyDeck}>
            {stations.map((station, index) => {
              const inactive = enhanced && displayedActiveIndex !== index;

              return (
                <article
                  key={station.id}
                  ref={(node) => {
                    stationRefs.current[index] = node;
                  }}
                  id={`flight-station-${station.id}`}
                  className={styles.station}
                  data-active={displayedActiveIndex === index ? 'true' : 'false'}
                  aria-hidden={inactive ? true : undefined}
                  inert={inactive ? true : undefined}
                >
                  <p className={styles.marker}>
                    {station.marker} / {station.label}
                  </p>
                  {index === 0 ? (
                    <h1 id="home-title" className={styles.title}>
                      {station.title}
                    </h1>
                  ) : (
                    <h2 className={styles.title}>{station.title}</h2>
                  )}
                  {station.meta ? <p className={styles.meta}>{station.meta}</p> : null}
                  <p className={styles.body}>{station.body}</p>
                  {station.action ? (
                    <a
                      className={styles.action}
                      href={station.action.href}
                      tabIndex={inactive ? -1 : undefined}
                    >
                      {station.action.label}
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className={styles.progress} aria-hidden="true">
            <span>
              {String(displayedActiveIndex + 1).padStart(2, '0')} /{' '}
              {String(stations.length).padStart(2, '0')}
            </span>
            <span ref={progressBarRef} className={styles.progressTrack}>
              <span />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
