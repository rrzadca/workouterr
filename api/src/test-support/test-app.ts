import { createApp } from '../app.ts';
import type { PrismaClient } from '../generated/prisma/client.ts';
import { appVersion } from '../version.ts';
import { listen } from './listen.ts';
import { createTestPrismaClient } from './test-database.ts';

export interface TestApp {
  baseUrl: string;
  prisma: PrismaClient;
  close: () => Promise<void>;
}

/** Starts the real app on a free port against the test database (or the Prisma client given). */
export async function startTestApp(options: { prisma?: PrismaClient } = {}): Promise<TestApp> {
  const prisma = options.prisma ?? createTestPrismaClient();
  const app = await listen(createApp({ prisma, version: appVersion }));
  return {
    baseUrl: app.baseUrl,
    prisma,
    close: async () => {
      await app.close();
      await prisma.$disconnect();
    },
  };
}
