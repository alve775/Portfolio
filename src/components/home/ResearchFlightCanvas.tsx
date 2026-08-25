'use client';

import { type RefObject, useEffect, useRef } from 'react';

import {
  FLIGHT_GEOMETRY,
  clamp01,
  type FlightPoint,
  sampleFlightPath,
} from '@/components/home/flight-model';

import styles from './research-flight.module.css';

type ResearchFlightCanvasProps = Readonly<{
  progressRef: RefObject<number>;
  enabled: boolean;
  visible: boolean;
  lateralScale: number;
  onReady: () => void;
  onFailure: () => void;
}>;

type Particle = Readonly<FlightPoint & { brightness: number }>;

type ProjectedPoint = Readonly<{
  x: number;
  y: number;
  depth: number;
  scale: number;
  alpha: number;
}>;

type DrawEnvironment = Readonly<{
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  camera: FlightPoint;
  stationProgress: number;
}>;

const PALETTE = {
  background: '#07110d',
  signal: '#69e4bd',
  signalSoft: '#baffea',
  cobalt: '#7395ff',
  quiet: '#6c8c7f',
  text: '#eaf8f1',
} as const;

function createParticles(): readonly Particle[] {
  let seed = 0x1f2e3d4c;
  const random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return Array.from({ length: 72 }, () => ({
    x: (random() - 0.5) * 125,
    y: (random() - 0.5) * 76,
    z: 18 - random() * 390,
    brightness: 0.35 + random() * 0.65,
  }));
}

const PARTICLES = createParticles();

function worldPoint(anchor: FlightPoint, x = 0, y = 0, z = 0): FlightPoint {
  return {
    x: anchor.x + x,
    y: anchor.y + y,
    z: anchor.z + z,
  };
}

function projectPoint(
  point: FlightPoint,
  camera: FlightPoint,
  width: number,
  height: number,
): ProjectedPoint | null {
  const depth = camera.z - point.z;

  if (depth < 2 || depth > 380) {
    return null;
  }

  const focalLength = Math.min(width, height) * 1.05;
  const scale = focalLength / depth;
  const centerX = width < 768 ? width * 0.54 : width * 0.7;
  const centerY = width < 768 ? height * 0.32 : height * 0.5;

  return {
    x: centerX + (point.x - camera.x) * scale,
    y: centerY + (point.y - camera.y) * scale,
    depth,
    scale,
    alpha: clamp01(1 - depth / 420),
  };
}

function stationAlpha(stationProgress: number, stationIndex: number): number {
  return 0.1 + clamp01(1 - Math.abs(stationProgress - stationIndex) * 0.8) * 0.9;
}

function drawLine(
  context: CanvasRenderingContext2D,
  start: ProjectedPoint,
  end: ProjectedPoint,
  color: string,
  alpha: number,
  width = 1,
): void {
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.restore();
}

function drawOrigin(environment: DrawEnvironment, stationIndex: number): void {
  const { context, width, height, camera, stationProgress } = environment;
  const projected = projectPoint(
    FLIGHT_GEOMETRY[stationIndex].anchor,
    camera,
    width,
    height,
  );

  if (!projected) return;

  const alpha = stationAlpha(stationProgress, stationIndex) * projected.alpha;
  context.save();
  context.translate(projected.x, projected.y);
  context.strokeStyle = PALETTE.signal;
  context.fillStyle = PALETTE.signalSoft;
  context.globalAlpha = alpha;
  context.lineWidth = 1.25;

  for (const radius of [0.8, 1.65, 2.7]) {
    context.beginPath();
    context.arc(0, 0, Math.max(5, projected.scale * radius), 0, Math.PI * 2);
    context.stroke();
  }

  context.beginPath();
  context.arc(0, 0, Math.max(2, projected.scale * 0.24), 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawLanguage(environment: DrawEnvironment, stationIndex: number): void {
  const { context, width, height, camera, stationProgress } = environment;
  const anchor = FLIGHT_GEOMETRY[stationIndex].anchor;
  const nodes = [
    { point: worldPoint(anchor, -7, -3, 0), glyph: 'অ' },
    { point: worldPoint(anchor, 0, 2, -1), glyph: 'ভা' },
    { point: worldPoint(anchor, 7, -2, 1), glyph: 'ক' },
    { point: worldPoint(anchor, 3, 7, -2), glyph: 'ন' },
  ]
    .map(({ point, glyph }) => ({
      projected: projectPoint(point, camera, width, height),
      glyph,
    }))
    .filter(
      (node): node is { projected: ProjectedPoint; glyph: string } =>
        node.projected !== null,
    );

  const alpha = stationAlpha(stationProgress, stationIndex);

  for (let index = 1; index < nodes.length; index += 1) {
    drawLine(
      context,
      nodes[index - 1].projected,
      nodes[index].projected,
      PALETTE.cobalt,
      alpha * 0.55,
    );
  }

  for (const { projected, glyph } of nodes) {
    context.save();
    context.globalAlpha = alpha * projected.alpha;
    context.fillStyle = PALETTE.text;
    context.strokeStyle = PALETTE.signal;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(projected.x, projected.y, Math.max(4, projected.scale * 0.42), 0, Math.PI * 2);
    context.stroke();
    context.font = `${Math.max(14, Math.min(34, projected.scale * 1.45))}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(glyph, projected.x, projected.y);
    context.restore();
  }
}

function drawSecurity(environment: DrawEnvironment, stationIndex: number): void {
  const { context, width, height, camera, stationProgress } = environment;
  const projected = projectPoint(
    FLIGHT_GEOMETRY[stationIndex].anchor,
    camera,
    width,
    height,
  );

  if (!projected) return;

  const alpha = stationAlpha(stationProgress, stationIndex) * projected.alpha;
  context.save();
  context.translate(projected.x, projected.y);
  context.strokeStyle = PALETTE.signal;
  context.lineWidth = Math.max(0.75, projected.scale * 0.055);
  context.globalAlpha = alpha;

  for (let ridge = 0; ridge < 7; ridge += 1) {
    const radius = projected.scale * (1.2 + ridge * 0.42);
    context.beginPath();
    context.ellipse(0, 0, radius * 0.78, radius, -0.2, Math.PI * 0.18, Math.PI * 1.82);
    context.stroke();
  }

  context.strokeStyle = PALETTE.cobalt;
  for (const [x, y] of [
    [-2.8, -1.4],
    [3.1, 0.9],
    [0.8, 3.7],
  ]) {
    const markerX = x * projected.scale;
    const markerY = y * projected.scale;
    const size = Math.max(3, projected.scale * 0.32);
    context.beginPath();
    context.moveTo(markerX - size, markerY);
    context.lineTo(markerX + size, markerY);
    context.moveTo(markerX, markerY - size);
    context.lineTo(markerX, markerY + size);
    context.stroke();
  }
  context.restore();
}

function drawSystems(environment: DrawEnvironment, stationIndex: number): void {
  const { context, width, height, camera, stationProgress } = environment;
  const anchor = FLIGHT_GEOMETRY[stationIndex].anchor;
  const offsets = [
    [-7, -4, 0],
    [0, 0, -1],
    [7, -5, 1],
    [-4, 6, -2],
    [6, 6, -1],
  ] as const;
  const nodes = offsets
    .map(([x, y, z]) => projectPoint(worldPoint(anchor, x, y, z), camera, width, height))
    .filter((point): point is ProjectedPoint => point !== null);
  const alpha = stationAlpha(stationProgress, stationIndex);
  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [3, 4],
  ] as const;

  for (const [start, end] of edges) {
    if (!nodes[start] || !nodes[end]) continue;
    drawLine(context, nodes[start], nodes[end], PALETTE.cobalt, alpha * 0.65, 1.2);
  }

  for (const [index, node] of nodes.entries()) {
    context.save();
    context.globalAlpha = alpha * node.alpha;
    context.fillStyle = index === 1 ? PALETTE.signalSoft : PALETTE.background;
    context.strokeStyle = PALETTE.signal;
    context.lineWidth = 1.25;
    context.beginPath();
    context.arc(node.x, node.y, Math.max(4, node.scale * 0.5), 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }
}

function drawContact(environment: DrawEnvironment, stationIndex: number): void {
  const { context, width, height, camera, stationProgress } = environment;
  const anchor = FLIGHT_GEOMETRY[stationIndex].anchor;
  const target = projectPoint(anchor, camera, width, height);

  if (!target) return;

  const alpha = stationAlpha(stationProgress, stationIndex) * target.alpha;
  const sources = [
    worldPoint(anchor, -9, -6, -1),
    worldPoint(anchor, -11, 1, 0),
    worldPoint(anchor, -8, 7, 1),
  ];

  context.save();
  context.strokeStyle = PALETTE.cobalt;
  context.lineWidth = 1.4;
  context.globalAlpha = alpha;

  for (const sourcePoint of sources) {
    const source = projectPoint(sourcePoint, camera, width, height);
    if (!source) continue;
    context.beginPath();
    context.moveTo(source.x, source.y);
    context.bezierCurveTo(
      source.x + (target.x - source.x) * 0.55,
      source.y,
      target.x - (target.x - source.x) * 0.25,
      target.y,
      target.x,
      target.y,
    );
    context.stroke();
  }

  context.fillStyle = PALETTE.signalSoft;
  context.strokeStyle = PALETTE.signal;
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(target.x, target.y, Math.max(7, target.scale * 0.72), 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function drawScene(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  stationProgress: number,
  lateralScale: number,
): void {
  const frame = sampleFlightPath(stationProgress, lateralScale);
  const environment: DrawEnvironment = {
    context,
    width,
    height,
    camera: frame.camera,
    stationProgress,
  };

  context.clearRect(0, 0, width, height);
  context.fillStyle = PALETTE.background;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = PALETTE.quiet;
  context.globalAlpha = 0.09;
  context.lineWidth = 1;
  const gridSize = Math.max(54, Math.min(width, height) / 8);
  for (let x = width % gridSize; x < width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = height % gridSize; y < height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.restore();

  for (let index = 1; index < FLIGHT_GEOMETRY.length; index += 1) {
    const start = projectPoint(
      FLIGHT_GEOMETRY[index - 1].anchor,
      frame.camera,
      width,
      height,
    );
    const end = projectPoint(
      FLIGHT_GEOMETRY[index].anchor,
      frame.camera,
      width,
      height,
    );
    if (start && end) {
      drawLine(context, start, end, PALETTE.signal, 0.17, 1);
    }
  }

  for (const particle of PARTICLES) {
    const projected = projectPoint(particle, frame.camera, width, height);
    if (!projected) continue;
    context.save();
    context.globalAlpha = projected.alpha * particle.brightness * 0.7;
    context.fillStyle = particle.brightness > 0.72 ? PALETTE.cobalt : PALETTE.signal;
    context.beginPath();
    context.arc(
      projected.x,
      projected.y,
      Math.max(0.45, Math.min(2.2, projected.scale * 0.12)),
      0,
      Math.PI * 2,
    );
    context.fill();
    context.restore();
  }

  drawOrigin(environment, 0);
  drawLanguage(environment, 1);
  drawSecurity(environment, 2);
  drawSystems(environment, 3);
  drawContact(environment, 4);
}

export function ResearchFlightCanvas({
  progressRef,
  enabled,
  visible,
  lateralScale,
  onReady,
  onFailure,
}: ResearchFlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) {
      onFailure();
      return;
    }

    let frameId = 0;
    let ready = false;
    let stopped = false;
    let width = 1;
    let height = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (stopped) return;

      try {
        drawScene(
          context,
          width,
          height,
          progressRef.current * (FLIGHT_GEOMETRY.length - 1),
          lateralScale,
        );
        if (!ready) {
          ready = true;
          onReady();
        }
        frameId = window.requestAnimationFrame(draw);
      } catch {
        stopped = true;
        onFailure();
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();
    draw();

    return () => {
      stopped = true;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [enabled, lateralScale, onFailure, onReady, progressRef, visible]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
