import { test } from 'node:test';
import assert from 'node:assert/strict';
import { healthResponseSchema } from './health.ts';

test('accepts a healthy response', () => {
  const body = { status: 'ok', version: '1.0.0', database: 'up' };
  assert.deepEqual(healthResponseSchema.parse(body), body);
});

test('rejects ok status with the database down', () => {
  assert.equal(healthResponseSchema.safeParse({ status: 'ok', version: '1.0.0', database: 'down' }).success, false);
});
