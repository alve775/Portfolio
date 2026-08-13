import assert from 'node:assert/strict';
import test from 'node:test';

import {
  asPublicEmail,
  asPublicHttpsUrl,
  resolveProductionOrigin,
} from '../../src/lib/site-validation.ts';

const unresolvedUrl = ['{{', 'TO', 'DO: profile URL}}'].join('');

test('accepts public HTTPS values and a conventional public email', () => {
  assert.equal(asPublicHttpsUrl('https://github.com/example'), 'https://github.com/example');
  assert.equal(asPublicEmail('person@example.org'), 'person@example.org');
});

test('omits unresolved and malformed contact values', () => {
  assert.equal(asPublicHttpsUrl(unresolvedUrl), null);
  assert.equal(asPublicHttpsUrl('https://todo.invalid'), null);
  assert.equal(asPublicHttpsUrl('javascript:alert(1)'), null);
  assert.equal(asPublicEmail('not-an-email'), null);
});

test('treats a missing origin as preview and rejects unsafe configured origins', () => {
  assert.equal(resolveProductionOrigin(undefined), null);
  assert.throws(
    () => resolveProductionOrigin('http://localhost:3000'),
    /public absolute HTTPS URL/,
  );
  assert.throws(
    () => resolveProductionOrigin('https://127.0.0.1'),
    /public absolute HTTPS URL/,
  );
  assert.equal(
    resolveProductionOrigin('https://portfolio.rfc-editor.org')?.origin,
    'https://portfolio.rfc-editor.org',
  );
});
