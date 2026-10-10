import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { errorHandler } from './error-handler.ts';
import { HttpError } from './http-error.ts';
import { listen, type ListeningApp } from './test-support/listen.ts';
import { startTestApp, type TestApp } from './test-support/test-app.ts';

let realApp: TestApp;
let throwingApp: ListeningApp;

before(async () => {
  realApp = await startTestApp();

  // A small app with routes that fail on purpose, using the same error handler
  const app = express();
  app.get('/http-error', () => {
    throw new HttpError(409, 'CONFLICT', 'Already changed', { version: 3 });
  });
  app.get('/unexpected', async () => {
    await Promise.resolve();
    throw new Error('database password is hunter2');
  });
  app.use(errorHandler);
  throwingApp = await listen(app);
});

after(async () => {
  await realApp.close();
  await throwingApp.close();
});

test('an unknown /api route answers 404 in the error shape', async () => {
  const response = await fetch(`${realApp.baseUrl}/api/nope`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: { code: 'NOT_FOUND', message: 'No route for GET /api/nope' },
  });
});

test('a malformed JSON body answers 400 INVALID_JSON', async () => {
  const response = await fetch(`${realApp.baseUrl}/api/anything`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"name":',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON' },
  });
});

test('an HttpError keeps its status, code and details', async () => {
  const response = await fetch(`${throwingApp.baseUrl}/http-error`);
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), {
    error: { code: 'CONFLICT', message: 'Already changed', details: { version: 3 } },
  });
});

test('an unexpected exception answers 500 without leaking its message', async (context) => {
  context.mock.method(console, 'error', () => {});
  const response = await fetch(`${throwingApp.baseUrl}/unexpected`);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
});
