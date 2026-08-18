import assert from 'node:assert/strict';
import test from 'node:test';

import * as paper from '../../src/lib/paper.ts';

test('derives restrained research-area labels from verified record text', () => {
  assert.equal(typeof paper.researchArea, 'function');
  assert.equal(
    paper.researchArea({ title: 'Bangla sentence classification', venue: 'IEEE QPAIN' }),
    'Language',
  );
  assert.equal(
    paper.researchArea({ title: 'Fingerprint presentation attack detection', venue: 'Thesis' }),
    'Security',
  );
  assert.equal(paper.researchArea({ title: 'Fixture Study', venue: 'Fixture Conference' }), 'Research');
});
