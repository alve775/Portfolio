import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import test from 'node:test';
import { paperSchema, projectSchema } from '../../src/lib/schemas.ts';
import { isPublishablePaper, isPublishableProject } from '../../src/lib/publishability.ts';

const paper = matter(readFileSync('tests/fixtures/content/papers/fixture-study.mdx', 'utf8')).data;
const project = matter(readFileSync('tests/fixtures/content/projects/fixture-project.mdx', 'utf8')).data;

test('existing records remain valid without redesign fields', () => {
  for (const [schema, record] of [[paperSchema, paper], [projectSchema, project]]) {
    const parsed = schema.parse(record);
    assert.equal(parsed.metric, undefined);
    assert.equal(parsed.metricNote, undefined);
    assert.equal(parsed.results, undefined);
    assert.equal(parsed.tags, undefined);
  }
});

test('retains optional metrics, project categories, and bounded model results', () => {
  const parsed = paperSchema.parse({...paper, metric:'97.61%', metricNote:'test split', results:[{model:'BanglaBERT', group:'monolingual', accuracy:97.61}]});
  assert.equal(parsed.results[0].accuracy, 97.61);
  assert.equal(parsed.metric, '97.61%');
  assert.deepEqual(projectSchema.parse({...project, tags:['ai','web']}).tags, ['ai','web']);
  assert.equal(projectSchema.parse({...project, metric:'PDF + DOCX'}).metricNote, undefined);
});

test('rejects malformed metrics, categories, and model results', () => {
  for (const metric of ['', '   ', 121]) assert.equal(paperSchema.safeParse({...paper, metric}).success, false);
  assert.equal(projectSchema.safeParse({...project, tags:['live']}).success, false);
  for (const accuracy of [-1, 101, '97.61', Infinity]) {
    assert.equal(paperSchema.safeParse({...paper, results:[{model:'BERT', group:'monolingual', accuracy}]}).success, false);
  }
  assert.equal(paperSchema.safeParse({...paper, results:[{model:'', group:'unknown', accuracy:90}]}).success, false);
});

test('new optional values still obey the unchanged publishing gate', () => {
  const unresolved = ['{{','TO','DO}}'].join('');
  for (const value of [{metric:unresolved}, {metricNote:unresolved}, {results:[{model:unresolved, group:'multilingual', accuracy:90}]}]) {
    assert.equal(isPublishablePaper({frontmatter:paperSchema.parse({...paper, ...value}), body:''}), false);
  }
  assert.equal(isPublishableProject({frontmatter:projectSchema.parse({...project, metricNote:unresolved}), body:''}), false);
  assert.equal(isPublishablePaper({frontmatter:paperSchema.parse(paper), body:''}), true);
  assert.equal(isPublishableProject({frontmatter:projectSchema.parse(project), body:''}), true);
});
