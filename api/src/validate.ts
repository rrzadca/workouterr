import type { RequestHandler } from 'express';
import type * as zod from 'zod';
import { HttpError } from './http-error.ts';

export interface ValidationIssue {
  path: string;
  message: string;
}

interface Schemas<Params, Body, Query> {
  params?: zod.ZodType<Params>;
  body?: zod.ZodType<Body>;
  query?: zod.ZodType<Query>;
}

/**
 * Checks the request against zod schemas and replaces each part with its parsed value, so the next handler gets
 * typed, cleaned data. All failures are collected into one 400 VALIDATION_FAILED.
 */
export function validate<Params = unknown, Body = unknown, Query = unknown>(
  schemas: Schemas<Params, Body, Query>,
): RequestHandler<Params, unknown, Body, Query> {
  return (request, _response, next) => {
    const issues: ValidationIssue[] = [];
    const parsed: Partial<Record<keyof Schemas<Params, Body, Query>, unknown>> = {};

    for (const location of ['params', 'body', 'query'] as const) {
      const schema = schemas[location];
      if (!schema) {
        continue;
      }
      const result = schema.safeParse(request[location]);
      if (result.success) {
        parsed[location] = result.data;
      } else {
        for (const issue of result.error.issues) {
          issues.push({ path: [location, ...issue.path.map(String)].join('.'), message: issue.message });
        }
      }
    }

    if (issues.length > 0) {
      next(new HttpError(400, 'VALIDATION_FAILED', 'The request is not valid', issues));
      return;
    }

    if ('params' in parsed) {
      request.params = parsed.params as Params;
    }
    if ('body' in parsed) {
      request.body = parsed.body as Body;
    }
    if ('query' in parsed) {
      // Express 5 defines request.query as a getter, so plain assignment throws
      Object.defineProperty(request, 'query', { value: parsed.query, writable: true, enumerable: true });
    }
    next();
  };
}
