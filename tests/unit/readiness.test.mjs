import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateLaunchReadiness } from '../../src/lib/readiness-core.ts';

const complete = {
  hasOrigin: true,
  hasEmail: true,
  profileCount: 5,
  paperCount: 1,
  hasCv: true,
};

test('requires every launch input', () => {
  assert.equal(evaluateLaunchReadiness(complete), true);

  for (const key of Object.keys(complete)) {
    const value = key === 'profileCount' || key === 'paperCount' ? 0 : false;
    assert.equal(evaluateLaunchReadiness({ ...complete, [key]: value }), false, key);
  }
});

test('allows optional social profiles, including an omitted ORCID', () => {
  assert.equal(evaluateLaunchReadiness({ ...complete, profileCount: 4 }), true);
  assert.equal(evaluateLaunchReadiness({ ...complete, profileCount: 1 }), true);
  assert.equal(evaluateLaunchReadiness({ ...complete, profileCount: 0 }), false);
});

test('never indexes a preview deployment even when all public inputs exist', () => {
  assert.equal(evaluateLaunchReadiness({ ...complete, isPreview: true }), false);
  assert.equal(evaluateLaunchReadiness({ ...complete, isPreview: false }), true);
});
