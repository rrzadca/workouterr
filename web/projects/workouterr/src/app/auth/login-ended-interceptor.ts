import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService, handlesUnauthorized } from './auth';

// A 401 from any call but the auth ones means the login has ended: back to the login page. The error still reaches
// the caller, so nothing treats the failed request as a success.
export const loginEndedInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.Unauthorized &&
        !request.context.get(handlesUnauthorized)
      ) {
        void auth.loginEnded();
      }
      return throwError(() => error);
    }),
  );
};
