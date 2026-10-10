import type { ErrorRequestHandler } from 'express';
import { HttpError, type ErrorCode } from './http-error.ts';

export interface ErrorResponseBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

/** The one place that turns errors into responses, so every error has the same JSON shape. */
export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const httpError = toHttpError(error);
  const body: ErrorResponseBody = { error: { code: httpError.code, message: httpError.message } };
  if (httpError.details !== undefined) {
    body.error.details = httpError.details;
  }
  response.status(httpError.status).json(body);
};

function toHttpError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }
  if (isJsonParseError(error)) {
    return new HttpError(400, 'INVALID_JSON', 'The request body is not valid JSON');
  }
  // Unexpected: log the real error, but never send its message or stack to the client
  console.error(error);
  return new HttpError(500, 'INTERNAL_ERROR', 'Something went wrong');
}

/** express.json() marks body parse failures with this type. */
function isJsonParseError(error: unknown): boolean {
  return error instanceof SyntaxError && 'type' in error && error.type === 'entity.parse.failed';
}
