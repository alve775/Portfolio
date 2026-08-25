import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FLIGHT_GEOMETRY,
  clamp01,
  easeInOutCubic,
  getScrollProgress,
  getStationScrollTop,
  sampleFlightPath,
} from '../../src/components/home/flight-model.ts';

test('clamps scroll progress to the usable sticky range', () => {
  const input = {
    sectionTop: 400,
    sectionHeight: 5000,
    viewportHeight: 1000,
  };

  assert.equal(getScrollProgress({ ...input, scrollY: 0 }), 0);
  assert.equal(getScrollProgress({ ...input, scrollY: 2400 }), 0.5);
  assert.equal(getScrollProgress({ ...input, scrollY: 6000 }), 1);
});

test('returns zero progress when the section has no usable sticky range', () => {
  assert.equal(
    getScrollProgress({
      sectionTop: 400,
      sectionHeight: 1000,
      viewportHeight: 1000,
      scrollY: 900,
    }),
    0,
  );
});

test('maps station buttons to real document positions', () => {
  const input = {
    sectionTop: 400,
    sectionHeight: 5000,
    viewportHeight: 1000,
    stationCount: 5,
  };

  assert.equal(getStationScrollTop({ ...input, stationIndex: 0 }), 400);
  assert.equal(getStationScrollTop({ ...input, stationIndex: 2 }), 2400);
  assert.equal(getStationScrollTop({ ...input, stationIndex: 4 }), 4400);
});

test('clamps inputs before applying cubic easing', () => {
  assert.equal(clamp01(-2), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(0.5), 0.5);
  assert.equal(easeInOutCubic(1), 1);
});

test('samples camera positions exactly at station boundaries', () => {
  assert.equal(FLIGHT_GEOMETRY.length, 5);
  assert.deepEqual(sampleFlightPath(0).camera, FLIGHT_GEOMETRY[0].camera);
  assert.deepEqual(sampleFlightPath(1).camera, FLIGHT_GEOMETRY[1].camera);
  assert.deepEqual(sampleFlightPath(4).camera, FLIGHT_GEOMETRY[4].camera);
  assert.equal(sampleFlightPath(0).activeIndex, 0);
  assert.equal(sampleFlightPath(1).activeIndex, 1);
  assert.equal(sampleFlightPath(4).activeIndex, 4);
});

test('adds a lateral arc between adjacent camera stations', () => {
  const start = FLIGHT_GEOMETRY[0].camera;
  const end = FLIGHT_GEOMETRY[1].camera;
  const midpoint = sampleFlightPath(0.5).camera;
  const linearMidpointX = (start.x + end.x) / 2;
  const linearMidpointY = (start.y + end.y) / 2;

  assert.ok(
    midpoint.x !== linearMidpointX || midpoint.y !== linearMidpointY,
    'the halfway camera position should bow away from a straight line',
  );
});
