import * as zod from 'zod';

export const muscleGroupSchema = zod.enum(['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS']);

export type MuscleGroup = zod.infer<typeof muscleGroupSchema>;
