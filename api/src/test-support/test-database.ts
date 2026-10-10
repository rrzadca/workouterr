import { createPrismaClient } from '../database.ts';
import type { PrismaClient } from '../generated/prisma/client.ts';

/** The test database URL from TEST_DATABASE_URL; refuses any database not named `…_test`, so tests never wipe real data. */
export function testDatabaseUrl(environment: NodeJS.ProcessEnv = process.env): string {
  const url = environment.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is not set (copy api/.env.example to api/.env)');
  }
  const databaseName = new URL(url).pathname.slice(1);
  if (!databaseName.endsWith('_test')) {
    throw new Error(`TEST_DATABASE_URL must point at a database ending in _test, got "${databaseName}"`);
  }
  return url;
}

export function createTestPrismaClient(): PrismaClient {
  return createPrismaClient(testDatabaseUrl());
}

/** Empties every table except Prisma's migration history, so each test starts from a clean database. */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  const [{ databaseName }] = await prisma.$queryRaw<[{ databaseName: string }]>`
    SELECT current_database() AS "databaseName"`;
  if (!databaseName.endsWith('_test')) {
    throw new Error(`Refusing to reset "${databaseName}": not a test database`);
  }

  const tables = await prisma.$queryRaw<{ tableName: string }[]>`
    SELECT tablename AS "tableName" FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length === 0) {
    return;
  }
  const tableList = tables.map(({ tableName }) => `"public"."${tableName}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`);
}
