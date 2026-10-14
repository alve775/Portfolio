import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getReadingFocus,
  getReadingProgress,
} from '../../src/lib/reading-stations.ts';

const geometry = { offsets: [37, 337, 837], start: 8, end: 1208 };

test('lights the final visible station even when the document cannot scroll any farther', () => {
  assert.equal(
    getReadingFocus({ viewportHeight: 900, atEnd: false, lastNode: 458 }),
    378,
  );
  const focus = getReadingFocus({
    viewportHeight: 900,
    atEnd: true,
    lastNode: 458,
  });
  assert.equal(focus, 459);
  assert.equal(
    getReadingProgress({
      offsets: [37],
      start: 8,
      end: 270,
      focus: focus - 421,
    }).activeIndex,
    0,
  );
  assert.equal(
    getReadingFocus({ viewportHeight: 900, atEnd: true, lastNode: 200 }),
    378,
  );
  assert.equal(
    getReadingFocus({ viewportHeight: 900, atEnd: true, lastNode: 1000 }),
    899,
  );
});

test('keeps stations off until the reading line reaches their node', () => {
  assert.deepEqual(getReadingProgress({ ...geometry, focus: -100 }), {
    progress: 0,
    activeIndex: -1,
  });
  assert.equal(getReadingProgress({ ...geometry, focus: 36 }).activeIndex, -1);
  assert.equal(getReadingProgress({ ...geometry, focus: 37 }).activeIndex, 0);
});

test('fills the rail continuously before turning on the next station', () => {
  assert.deepEqual(getReadingProgress({ ...geometry, focus: 608 }), {
    progress: 0.5,
    activeIndex: 1,
  });
  assert.equal(getReadingProgress({ ...geometry, focus: 336 }).activeIndex, 0);
  assert.equal(getReadingProgress({ ...geometry, focus: 337 }).activeIndex, 1);
  assert.equal(getReadingProgress({ ...geometry, focus: 837 }).activeIndex, 2);
});

test('reverses the journey when scrolling upward and clears the active station after the list', () => {
  assert.equal(getReadingProgress({ ...geometry, focus: 1000 }).activeIndex, 2);
  assert.equal(getReadingProgress({ ...geometry, focus: 200 }).activeIndex, 0);
  assert.deepEqual(getReadingProgress({ ...geometry, focus: 2000 }), {
    progress: 1,
    activeIndex: -1,
  });
});

test('uses the new station offsets after filtering or expanding a card', () => {
  assert.equal(
    getReadingProgress({ ...geometry, offsets: [37, 600], focus: 337 })
      .activeIndex,
    0,
  );
  assert.equal(
    getReadingProgress({ ...geometry, offsets: [37, 250], focus: 337 })
      .activeIndex,
    1,
  );
});

test('handles an empty list or a rail without usable height', () => {
  assert.deepEqual(
    getReadingProgress({ ...geometry, offsets: [], focus: 100 }),
    { progress: 0, activeIndex: -1 },
  );
  assert.deepEqual(
    getReadingProgress({ ...geometry, start: 8, end: 8, focus: 100 }),
    { progress: 0, activeIndex: -1 },
  );
});
