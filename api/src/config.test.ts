import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from './config.ts';

const databaseUrl = 'postgresql://workouterr:workouterr@localhost:5432/workouterr';

test('loadConfig reads a valid environment', () => {
  assert.deepEqual(loadConfig({ DATABASE_URL: databaseUrl, PORT: '4000' }), { databaseUrl, port: 4000 });
});

test('loadConfig defaults PORT to 3000', () => {
  assert.equal(loadConfig({ DATABASE_URL: databaseUrl }).port, 3000);
});

test('loadConfig rejects a missing DATABASE_URL', () => {
  assert.throws(() => loadConfig({}), /DATABASE_URL/);
});

test('loadConfig rejects a DATABASE_URL that is not PostgreSQL', () => {
  assert.throws(() => loadConfig({ DATABASE_URL: 'mysql://localhost/workouterr' }), /DATABASE_URL/);
});

test('loadConfig rejects a non-numeric PORT', () => {
  assert.throws(() => loadConfig({ DATABASE_URL: databaseUrl, PORT: 'abc' }), /PORT/);
});
