import express from 'express';
import type { Express, Router } from 'express';
import { muscleGroupSchema, type MuscleGroup } from '@workouterr/shared';
import { errorHandler } from './error-handler.ts';
import type { PrismaClient } from './generated/prisma/client.ts';
import { notFound } from './not-found.ts';

export interface AppDependencies {
  prisma: PrismaClient;
  version: string;
  /** Extra /api routes, mounted before the 404 */
  routes?: Router;
}

/** Builds the app without listening, so tests can start it on any port with their own database. */
export function createApp({ prisma, version, routes }: AppDependencies): Express {
  const app = express();

  app.use(express.json());

  app.get('/api/health', async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.json({ status: 'ok', version, database: 'up' });
    } catch (error) {
      console.error('Health check: database unreachable', error);
      response.status(503).json({ status: 'unavailable', version, database: 'down' });
    }
  });

  app.get('/api/muscle-groups', (_request, response) => {
    const muscleGroups: MuscleGroup[] = muscleGroupSchema.options;
    response.json(muscleGroups);
  });

  if (routes) {
    app.use('/api', routes);
  }
  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
