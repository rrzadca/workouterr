import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findHardCodedText } from './check-template-text.ts';

function textsIn(template: string): string[] {
  return findHardCodedText(template, 'test.html').map((found) => found.text);
}

test('accepts text that comes from a translation key', () => {
  assert.deepEqual(textsIn(`<h1>{{ 'app.name' | transloco }}</h1>`), []);
});

test('reports plain text in an element', () => {
  assert.deepEqual(textsIn('<p>Start workout</p>'), ['Start workout']);
});

test('reports words written next to an interpolation', () => {
  assert.deepEqual(textsIn('<span>{{ weight }} kg</span>'), ['kg']);
});

test('reports text inside control flow blocks', () => {
  assert.deepEqual(textsIn('@if (loading) { <p>Loading…</p> } @else { <p>{{ name }}</p> }'), ['Loading…']);
});

test('reports visible attributes but not technical ones', () => {
  const template = '<img alt="Logo" class="h-6" /><button aria-label="Close" aria-hidden="true"></button>';
  assert.deepEqual(textsIn(template), ['Logo', 'Close']);
});

test('reports static text given to a component input such as a title', () => {
  assert.deepEqual(textsIn('<rad-page-layout title="Exercises"></rad-page-layout>'), ['Exercises']);
});

test('allows separators and numbers without letters', () => {
  assert.deepEqual(textsIn('<span>{{ sets }} · {{ reps }}</span><span>100%</span>'), []);
});

test('gives the line and column of the text', () => {
  const [found] = findHardCodedText('<div>\n  <p>Hello</p>\n</div>', 'test.html');
  assert.deepEqual({ line: found?.line, column: found?.column }, { line: 2, column: 6 });
});
