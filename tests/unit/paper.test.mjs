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

test('keeps an undergraduate thesis distinct from a conference publication', () => {
  const thesis = {
    title: 'A Leakage-Safe Framework for ADHD EEG',
    venue: 'Rajshahi University of Engineering and Technology',
    status: 'thesis', year: 2026, role: 'lead-author',
  };
  assert.equal(paper.kindLabel(thesis), 'THESIS');
  assert.equal(paper.STATUS_LABEL.thesis, 'undergraduate thesis');
  assert.equal(paper.researchArea(thesis), 'EEG');
  assert.match(paper.cardHeadLine(thesis), /2026 · author$/);
});
