import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { errorResponseBodySchema } from '@workouterr/shared';
import { catchError, throwError } from 'rxjs';
import { ApiError, NetworkError, UnexpectedResponseError } from './api-errors';

/** Bad Gateway and Gateway Timeout: a proxy in front (ng serve's, or the hosting's) could not reach the API */
const gatewayStatuses = new Set([502, 504]);

/** Turns failed /api requests into ApiError, UnexpectedResponseError or NetworkError. Other requests pass through. */
export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }
  return next(request).pipe(catchError((error: unknown) => throwError(() => toApiRequestError(error))));
};

/** An HttpErrorResponse becomes an ApiRequestError; anything else (a bug in our own code) is passed on unchanged. */
export function toApiRequestError(error: unknown): unknown {
  if (!(error instanceof HttpErrorResponse)) {
    return error;
  }
  if (error.status === 0) {
    return new NetworkError();
  }
  const parsedBody = errorResponseBodySchema.safeParse(error.error);
  if (parsedBody.success) {
    const { code, message, details } = parsedBody.data.error;
    return new ApiError(error.status, code, message, details);
  }
  if (gatewayStatuses.has(error.status)) {
    return new NetworkError();
  }
  return new UnexpectedResponseError(error.status, error.error);
}
