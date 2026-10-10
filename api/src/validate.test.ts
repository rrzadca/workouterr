import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import * as zod from 'zod';
import { errorHandler } from './error-handler.ts';
import { validate } from './validate.ts';
import { listen, type ListeningApp } from './test-support/listen.ts';

let app: ListeningApp;

before(async () => {
  const expressApp = express();
  expressApp.use(express.json());
  expressApp.post(
    '/exercises/:exerciseId',
    validate({
      params: zod.object({ exerciseId: zod.uuid() }),
      body: zod.object({ name: zod.string().trim().min(1), weightStep: zod.number().positive() }),
      query: zod.object({ dryRun: zod.stringbool().default(false) }),
    }),
    (request, response) => {
      // @ts-expect-error the body is typed from the schema, so unknown fields don't compile
      void request.body.notInSchema;
      response.json({ params: request.params, body: request.body, query: request.query });
    },
  );
  expressApp.use(errorHandler);
  app = await listen(expressApp);
});

after(async () => {
  await app.close();
});

const exerciseId = '0199d3a4-7c1e-7000-8000-000000000001';

function post(path: string, body: unknown): Promise<Response> {
  return fetch(`${app.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('a valid request reaches the handler with parsed values', async () => {
  const response = await post(`/exercises/${exerciseId}?dryRun=true`, { name: '  Bench press ', weightStep: 2.5 });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    params: { exerciseId },
    body: { name: 'Bench press', weightStep: 2.5 },
    query: { dryRun: true },
  });
});

test('schema defaults fill in missing values', async () => {
  const response = await post(`/exercises/${exerciseId}`, { name: 'Squat', weightStep: 2.5 });
  assert.deepEqual(((await response.json()) as { query: unknown }).query, { dryRun: false });
});

test('an invalid request answers 400 with every problem in details', async () => {
  const response = await post('/exercises/not-a-uuid', { name: '', weightStep: -1 });
  assert.equal(response.status, 400);
  const body = (await response.json()) as {
    error: { code: string; message: string; details: { path: string; message: string }[] };
  };
  assert.equal(body.error.code, 'VALIDATION_FAILED');
  assert.equal(body.error.message, 'The request is not valid');
  assert.deepEqual(
    body.error.details.map((issue) => issue.path),
    ['params.exerciseId', 'body.name', 'body.weightStep'],
  );
  for (const issue of body.error.details) {
    assert.equal(typeof issue.message, 'string');
  }
});
