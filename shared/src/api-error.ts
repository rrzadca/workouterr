import * as zod from 'zod';

/** Every error code the API answers with; clients can switch on these. CONFLICT is for the 409s in issues 08 and 10. */
export const errorCodeSchema = zod.enum([
  'NOT_FOUND',
  'INVALID_JSON',
  'VALIDATION_FAILED',
  'CONFLICT',
  'INTERNAL_ERROR',
]);

export type ErrorCode = zod.infer<typeof errorCodeSchema>;

/** The JSON body of every API error response. */
export const errorResponseBodySchema = zod.object({
  error: zod.object({
    code: errorCodeSchema,
    message: zod.string(),
    details: zod.unknown().optional(),
  }),
});

export type ErrorResponseBody = zod.infer<typeof errorResponseBodySchema>;
