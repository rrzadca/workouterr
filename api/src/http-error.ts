/** Every error code the API answers with; clients can switch on these. CONFLICT is for the 409s in issues 08 and 10. */
export type ErrorCode = 'NOT_FOUND' | 'INVALID_JSON' | 'VALIDATION_FAILED' | 'CONFLICT' | 'INTERNAL_ERROR';

/** An error that becomes a response with its own status and code instead of a 500. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
