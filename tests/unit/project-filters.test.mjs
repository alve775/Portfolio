import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesProject } from '../../src/lib/project-filters.ts';
test('filters compose verified categories while live remains a status', () => {
  const records=[{status:'live',tags:['ai','web']},{status:'complete',tags:['ai']},{status:'wip',tags:['mobile']},{status:'complete'}];
  for(const [filter,count] of [['all',4],['live',1],['ai',2],['web',1],['mobile',1]]) assert.equal(records.filter(p=>matchesProject(p,filter)).length,count);
  assert.equal(matchesProject({status:'complete',tags:['live']},'live'),false);
  assert.equal(matchesProject({status:'live'},'ai'),false);
});
