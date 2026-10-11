import { test } from 'node:test';
import assert from 'node:assert/strict';
import { errorResponseBodySchema } from './api-error.ts';

test('accepts an error body with a known code', () => {
  const body = { error: { code: 'NOT_FOUND', message: 'No route for GET /api/nothing' } };
  assert.deepEqual(errorResponseBodySchema.parse(body), body);
});

test('rejects an error body with an unknown code', () => {
  const body = { error: { code: 'TEAPOT', message: 'I am a teapot' } };
  assert.equal(errorResponseBodySchema.safeParse(body).success, false);
});
