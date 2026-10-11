import * as zod from 'zod';

/** The body of GET /api/health: 200 when the database answers, 503 when it does not. */
export const healthResponseSchema = zod.discriminatedUnion('status', [
  zod.object({ status: zod.literal('ok'), version: zod.string(), database: zod.literal('up') }),
  zod.object({ status: zod.literal('unavailable'), version: zod.string(), database: zod.literal('down') }),
]);

export type HealthResponse = zod.infer<typeof healthResponseSchema>;
