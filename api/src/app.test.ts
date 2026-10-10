import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './app.ts';
import { listen, type ListeningApp } from './test-support/listen.ts';

let app: ListeningApp;

before(async () => {
  app = await listen(createApp());
});

after(async () => {
  await app.close();
});

test('GET /api/health answers ok', async () => {
  const response = await fetch(`${app.baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('GET /api/muscle-groups lists the groups from shared', async () => {
  const response = await fetch(`${app.baseUrl}/api/muscle-groups`);
  assert.deepEqual(await response.json(), ['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS']);
});
