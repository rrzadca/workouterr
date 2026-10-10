import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import * as zod from 'zod';
import { createPrismaClient } from './database.ts';
import { startTestApp, type TestApp } from './test-support/test-app.ts';
import { validate } from './validate.ts';
import { appVersion } from './version.ts';

let app: TestApp;
let appWithoutDatabase: TestApp;
let appWithValidatedRoute: TestApp;

before(async () => {
  app = await startTestApp();
  // Nothing listens on port 1, so every query fails like it does when PostgreSQL is down
  appWithoutDatabase = await startTestApp({
    prisma: createPrismaClient('postgresql://workouterr:workouterr@127.0.0.1:1/workouterr_test'),
  });
  // No real route validates input yet, so the test adds one to check validate runs through the real app's middleware
  const routes = express.Router();
  routes.post('/echo', validate({ body: zod.object({ name: zod.string().trim().min(1) }) }), (request, response) => {
    response.json(request.body);
  });
  appWithValidatedRoute = await startTestApp({ routes });
});

after(async () => {
  await app.close();
  await appWithoutDatabase.close();
  await appWithValidatedRoute.close();
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

function postEcho(body: unknown): Promise<Response> {
  return fetch(`${appWithValidatedRoute.baseUrl}/api/echo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('a validated route gets the parsed JSON body', async () => {
  const response = await postEcho({ name: '  Bench press ' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { name: 'Bench press' });
});

test('a validated route answers 400 VALIDATION_FAILED in the error shape', async () => {
  const response = await postEcho({ name: '' });
  assert.equal(response.status, 400);
  const body = (await response.json()) as { error: { code: string; details: { path: string }[] } };
  assert.equal(body.error.code, 'VALIDATION_FAILED');
  assert.deepEqual(
    body.error.details.map((issue) => issue.path),
    ['body.name'],
  );
});
