export type FlightStationId =
  | 'identity'
  | 'projects'
  | 'ai'
  | 'research'
  | 'contact';

export type FlightVisual =
  | 'origin'
  | 'projects'
  | 'ai'
  | 'research'
  | 'contact';

export type FlightPoint = Readonly<{
  x: number;
  y: number;
  z: number;
}>;

export type FlightStationContent = Readonly<{
  id: FlightStationId;
  label: string;
  marker: string;
  title: string;
  body: string;
  meta?: string;
  action?: Readonly<{
    label: string;
    /** Compact label used on narrow screens, where the link row must fit on one line. */
    shortLabel?: string;
    href: string;
  }>;
  /** Secondary links shown beside the action, e.g. profile destinations. */
  links?: ReadonlyArray<
    Readonly<{
      label: string;
      shortLabel?: string;
      href: string;
    }>
  >;
}>;

export type FlightStationGeometry = Readonly<{
  id: FlightStationId;
  visual: FlightVisual;
  anchor: FlightPoint;
  camera: FlightPoint;
}>;

export type FlightFrame = Readonly<{
  activeIndex: number;
  segmentIndex: number;
  localProgress: number;
  camera: FlightPoint;
}>;

type ScrollGeometry = Readonly<{
  sectionTop: number;
  sectionHeight: number;
  viewportHeight: number;
}>;

type ScrollProgressInput = ScrollGeometry &
  Readonly<{
    scrollY: number;
  }>;

type StationScrollInput = ScrollGeometry &
  Readonly<{
    stationIndex: number;
    stationCount: number;
  }>;

type FlightEnhancementInput = Readonly<{
  browserSupported: boolean;
  reducedMotion: boolean;
  staticLayout: boolean;
  canvasFailed: boolean;
  rootFontSize: number;
}>;

export const FLIGHT_GEOMETRY = [
  {
    id: 'identity',
    visual: 'origin',
    anchor: { x: 0, y: 0, z: 0 },
    camera: { x: 0, y: 0, z: 44 },
  },
  {
    id: 'projects',
    visual: 'projects',
    anchor: { x: -18, y: -4, z: -72 },
    camera: { x: -18, y: -4, z: -28 },
  },
  {
    id: 'ai',
    visual: 'ai',
    anchor: { x: 15, y: 7, z: -144 },
    camera: { x: 15, y: 7, z: -100 },
  },
  {
    id: 'research',
    visual: 'research',
    anchor: { x: -12, y: -8, z: -216 },
    camera: { x: -12, y: -8, z: -172 },
  },
  {
    id: 'contact',
    visual: 'contact',
    anchor: { x: 8, y: 0, z: -288 },
    camera: { x: 8, y: 0, z: -244 },
  },
] as const satisfies readonly FlightStationGeometry[];

export function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function canEnhanceFlight({
  browserSupported,
  reducedMotion,
  staticLayout,
  canvasFailed,
  rootFontSize,
}: FlightEnhancementInput): boolean {
  return (
    browserSupported &&
    !reducedMotion &&
    !staticLayout &&
    !canvasFailed &&
    Number.isFinite(rootFontSize) &&
    rootFontSize <= 20
  );
}

export function easeInOutCubic(value: number): number {
  const progress = clamp01(value);

  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function getScrollProgress({
  scrollY,
  sectionTop,
  sectionHeight,
  viewportHeight,
}: ScrollProgressInput): number {
  const usableRange = Math.max(sectionHeight - viewportHeight, 0);

  if (usableRange === 0) {
    return 0;
  }

  return clamp01((scrollY - sectionTop) / usableRange);
}

export function getStationScrollTop({
  sectionTop,
  sectionHeight,
  viewportHeight,
  stationIndex,
  stationCount,
}: StationScrollInput): number {
  const usableRange = Math.max(sectionHeight - viewportHeight, 0);
  const stationRange = Math.max(stationCount - 1, 1);
  const stationProgress = clamp01(stationIndex / stationRange);

  return sectionTop + usableRange * stationProgress;
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function sampleFlightPath(
  stationProgress: number,
  lateralScale = 1,
): FlightFrame {
  const lastStationIndex = FLIGHT_GEOMETRY.length - 1;
  const clampedProgress = Math.min(Math.max(stationProgress, 0), lastStationIndex);
  const segmentIndex = Math.min(Math.floor(clampedProgress), lastStationIndex - 1);
  const rawLocalProgress = clampedProgress - segmentIndex;
  const localProgress = easeInOutCubic(rawLocalProgress);
  const start = FLIGHT_GEOMETRY[segmentIndex].camera;
  const end = FLIGHT_GEOMETRY[segmentIndex + 1].camera;
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const lateralLength = Math.hypot(deltaX, deltaY) || 1;
  const perpendicularX = -deltaY / lateralLength;
  const perpendicularY = deltaX / lateralLength;
  const arcStrength = segmentIndex % 2 === 0 ? 5.5 : -5.5;
  const arc =
    rawLocalProgress === 0 || rawLocalProgress === 1
      ? 0
      : Math.sin(Math.PI * rawLocalProgress) * arcStrength * lateralScale;

  return {
    activeIndex: Math.round(clampedProgress),
    segmentIndex,
    localProgress,
    camera: {
      x: interpolate(start.x, end.x, localProgress) + perpendicularX * arc,
      y: interpolate(start.y, end.y, localProgress) + perpendicularY * arc,
      z: interpolate(start.z, end.z, localProgress),
    },
  };
}
