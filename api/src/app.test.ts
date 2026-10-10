import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from './app.ts';

let server: Server;
let baseUrl: string;

before(async () => {
  server = createApp().listen(0);
  await once(server, 'listening');
  const address = server.address() as AddressInfo;
  baseUrl = `http://localhost:${address.port}`;
});

after(() => {
  server.close();
});

test('GET /api/health answers ok', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('GET /api/muscle-groups lists the groups from shared', async () => {
  const response = await fetch(`${baseUrl}/api/muscle-groups`);
  assert.deepEqual(await response.json(), ['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS']);
});
