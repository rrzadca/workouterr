import type { ErrorCode } from '@workouterr/shared';

/** The API answered with its error shape: { error: { code, message, details? } }. Switch on `code`. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * A response that is not the API's error shape: the dev proxy's 502/504 when the API is down, or an endpoint
 * such as GET /api/health that sends its own body with an error status. `body` is whatever came back.
 */
export class UnexpectedResponseError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`Unexpected response with status ${status}`);
    this.name = 'UnexpectedResponseError';
    this.status = status;
    this.body = body;
  }
}

/** No response at all: offline, or the server could not be reached. */
export class NetworkError extends Error {
  constructor() {
    super('The server could not be reached');
    this.name = 'NetworkError';
  }
}

/** Every error an /api request fails with, after the interceptor; narrow it with instanceof. */
export type ApiRequestError = ApiError | UnexpectedResponseError | NetworkError;
