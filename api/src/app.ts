import express from 'express';
import type { Express } from 'express';
import { muscleGroupSchema, type MuscleGroup } from '@workouterr/shared';
import { errorHandler } from './error-handler.ts';
import { notFound } from './not-found.ts';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/muscle-groups', (_request, response) => {
    const muscleGroups: MuscleGroup[] = muscleGroupSchema.options;
    response.json(muscleGroups);
  });

  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
