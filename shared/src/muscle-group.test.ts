import { test } from 'node:test';
import assert from 'node:assert/strict';
import { muscleGroupSchema } from './muscle-group.ts';

test('accepts a muscle group from the fixed list', () => {
  assert.equal(muscleGroupSchema.parse('CHEST'), 'CHEST');
});

test('rejects FULL_BODY, which is not a muscle group', () => {
  assert.equal(muscleGroupSchema.safeParse('FULL_BODY').success, false);
});
