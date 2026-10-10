import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestPrismaClient, resetDatabase, testDatabaseUrl } from './test-database.ts';

const prisma = createTestPrismaClient();

after(async () => {
  await prisma.$disconnect();
});

test('testDatabaseUrl refuses a database that is not a test database', () => {
  assert.throws(
    () => testDatabaseUrl({ TEST_DATABASE_URL: 'postgresql://workouterr:workouterr@localhost:5432/workouterr' }),
    /ending in _test/,
  );
});

test('testDatabaseUrl explains a missing TEST_DATABASE_URL', () => {
  assert.throws(() => testDatabaseUrl({}), /TEST_DATABASE_URL is not set/);
});

test('resetDatabase empties the tables', async () => {
  await prisma.exercise.create({ data: { name: 'Bench press' } });
  await resetDatabase(prisma);
  assert.equal(await prisma.exercise.count(), 0);
});
