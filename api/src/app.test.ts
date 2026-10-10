import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createPrismaClient } from './database.ts';
import { startTestApp, type TestApp } from './test-support/test-app.ts';
import { appVersion } from './version.ts';

let app: TestApp;
let appWithoutDatabase: TestApp;

before(async () => {
  app = await startTestApp();
  // Nothing listens on port 1, so every query fails like it does when PostgreSQL is down
  appWithoutDatabase = await startTestApp({
    prisma: createPrismaClient('postgresql://workouterr:workouterr@127.0.0.1:1/workouterr_test'),
  });
});

after(async () => {
  await app.close();
  await appWithoutDatabase.close();
});

test('GET /api/health answers 200 with the version when the database is up', async () => {
  const response = await fetch(`${app.baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', version: appVersion, database: 'up' });
});

test('GET /api/health answers 503 when the database is down', async (context) => {
  context.mock.method(console, 'error', () => {});
  const response = await fetch(`${appWithoutDatabase.baseUrl}/api/health`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: 'unavailable', version: appVersion, database: 'down' });
});

test('GET /api/muscle-groups lists the groups from shared', async () => {
  const response = await fetch(`${app.baseUrl}/api/muscle-groups`);
  assert.deepEqual(await response.json(), ['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS']);
});
