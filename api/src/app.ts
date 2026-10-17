import express from 'express';
import type { Express, Router } from 'express';
import { muscleGroupSchema, type HealthResponse, type MuscleGroup } from '@workouterr/shared';
import { errorHandler } from './error-handler.ts';
import type { PrismaClient } from './generated/prisma/client.ts';
import { serveIndexHtml } from './index-html.ts';
import { notFound } from './not-found.ts';

export interface AppDependencies {
  prisma: PrismaClient;
  version: string;
  /** Extra /api routes, mounted before the 404 */
  routes?: Router;
  /** Absolute path of the Angular build's index.html; without it the app serves only the API */
  indexHtmlPath?: string;
}

/** Builds the app without listening, so tests can start it on any port with their own database. */
export function createApp({ prisma, version, routes, indexHtmlPath }: AppDependencies): Express {
  const app = express();

  app.use(express.json());

  app.get('/api/health', async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const healthy: HealthResponse = { status: 'ok', version, database: 'up' };
      response.json(healthy);
    } catch (error) {
      console.error('Health check: database unreachable', error);
      const unavailable: HealthResponse = { status: 'unavailable', version, database: 'down' };
      response.status(503).json(unavailable);
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
  if (indexHtmlPath) {
    app.use(serveIndexHtml(indexHtmlPath));
  }
  app.use(errorHandler);

  return app;
}
