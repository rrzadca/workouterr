import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { startTestApp, type TestApp } from './test-support/test-app.ts';

const indexHtml = '<!doctype html><title>Workouterr</title>';

let webDirectory: string;
let app: TestApp;
let apiOnlyApp: TestApp;

before(async () => {
  webDirectory = await mkdtemp(path.join(tmpdir(), 'workouterr-web-'));
  const indexHtmlPath = path.join(webDirectory, 'index.html');
  await writeFile(indexHtmlPath, indexHtml);
  app = await startTestApp({ indexHtmlPath });
  apiOnlyApp = await startTestApp();
});

after(async () => {
  await app.close();
  await apiOnlyApp.close();
  await rm(webDirectory, { recursive: true });
});

test('an Angular route gets index.html, never cached', async () => {
  const response = await fetch(`${app.baseUrl}/exercises/123`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /^text\/html/);
  assert.equal(response.headers.get('cache-control'), 'no-cache');
  assert.equal(await response.text(), indexHtml);
});

test('the root URL gets index.html', async () => {
  const response = await fetch(`${app.baseUrl}/`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), indexHtml);
});

test('a missing file answers 404 instead of index.html', async () => {
  const response = await fetch(`${app.baseUrl}/chunk-OLD123.js`);
  assert.equal(response.status, 404);
});

test('an unknown /api route still answers the JSON 404', async () => {
  const response = await fetch(`${app.baseUrl}/api/nothing-here`);
  assert.equal(response.status, 404);
  const body = (await response.json()) as { error: { code: string } };
  assert.equal(body.error.code, 'NOT_FOUND');
});

test('a POST to an Angular route does not get index.html', async () => {
  const response = await fetch(`${app.baseUrl}/exercises`, { method: 'POST' });
  assert.equal(response.status, 404);
});

test('without an index.html path the app serves only the API', async () => {
  const response = await fetch(`${apiOnlyApp.baseUrl}/exercises`);
  assert.equal(response.status, 404);
});
