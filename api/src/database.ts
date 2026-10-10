import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.ts';

/** Prisma talks to PostgreSQL through the `pg` driver, so no native query engine is needed (works on FreeBSD). */
export function createPrismaClient(databaseUrl: string): PrismaClient {
  // Without a timeout, pg waits forever for an unreachable server, and the health check would hang instead of 503
  const adapter = new PrismaPg({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 });
  return new PrismaClient({ adapter });
}
