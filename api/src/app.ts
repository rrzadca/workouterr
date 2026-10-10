import express from 'express';
import type { Express } from 'express';
import { muscleGroupSchema, type MuscleGroup } from '@workouterr/shared';

export function createApp(): Express {
  const app = express();

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/muscle-groups', (_request, response) => {
    const muscleGroups: MuscleGroup[] = muscleGroupSchema.options;
    response.json(muscleGroups);
  });

  return app;
}
