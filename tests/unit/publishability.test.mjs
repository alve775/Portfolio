import assert from 'node:assert/strict';
import test from 'node:test';

import {
  containsUnresolved,
  isPublishableNote,
  isPublishablePaper,
  isPublishableProject,
  safeOptionalBody,
} from '../../src/lib/publishability.ts';

const unresolved = ['{{', 'TO', 'DO: title}}'].join('');

test('finds unresolved markers inside nested values', () => {
  assert.equal(containsUnresolved({ authors: ['Ready', unresolved] }), true);
  assert.equal(containsUnresolved({ authors: ['Ready'] }), false);
});

test('publishes only explicit complete paper and project records', () => {
  assert.equal(isPublishablePaper({ frontmatter: { draft: false, title: 'Ready' }, body: '' }), true);
  assert.equal(isPublishablePaper({ frontmatter: { draft: true, title: 'Ready' }, body: '' }), false);
  assert.equal(
    isPublishableProject({ frontmatter: { draft: false, title: unresolved }, body: '' }),
    false,
  );
});

test('requires public HTTPS destinations for rendered content links', () => {
  assert.equal(
    isPublishablePaper({
      frontmatter: { draft: false, title: 'Ready', pdfUrl: 'https://papers.example.edu/study.pdf' },
      body: '',
    }),
    true,
  );
  assert.equal(
    isPublishablePaper({
      frontmatter: { draft: false, title: 'Ready', pdfUrl: 'http://papers.example.edu/study.pdf' },
      body: '',
    }),
    false,
  );
  assert.equal(
    isPublishableProject({
      frontmatter: { draft: false, title: 'Ready', repoUrl: 'https://github.com/example/project' },
      body: '',
    }),
    true,
  );
  assert.equal(
    isPublishableProject({
      frontmatter: { draft: false, title: 'Ready', repoUrl: 'repository' },
      body: '',
    }),
    false,
  );
});

test('requires a safe non-empty note body and safely omits optional bodies', () => {
  assert.equal(
    isPublishableNote({ frontmatter: { draft: false, title: 'Ready' }, body: 'Body' }),
    true,
  );
  assert.equal(
    isPublishableNote({ frontmatter: { draft: false, title: 'Ready' }, body: unresolved }),
    false,
  );
  assert.equal(safeOptionalBody(unresolved), null);
  assert.equal(safeOptionalBody('  Safe body.  '), 'Safe body.');
});
