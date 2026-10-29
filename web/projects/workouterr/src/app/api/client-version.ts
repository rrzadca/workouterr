import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { GetHealthHeader } from '@workouterr/api-client';
import { catchError, throwError } from 'rxjs';
import { version } from '../../../../../package.json';

// The header every operation declares in the OpenAPI document; the build fails if the contract renames it.
export const clientVersionHeader = GetHealthHeader.keyof().enum['X-Client-Version'];

// The app's build version, from package.json (the bundler keeps only this field).
export const clientVersion = version;

// Whether the API has turned this build away (426): only a reload, which fetches the new build, gets past it.
@Injectable({ providedIn: 'root' })
export class ClientVersionService {
  private readonly outdated = signal(false);
  readonly isOutdated = this.outdated.asReadonly();

  markOutdated() {
    this.outdated.set(true);
  }
}

// Tells the API which build sent each request, so it can answer 426 to a build too old for it, and notes that answer.
// The error still reaches the caller, so nothing treats the failed request as a success.
export const clientVersionInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }
  const clientVersionService = inject(ClientVersionService);
  return next(request.clone({ setHeaders: { [clientVersionHeader]: clientVersion } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.UpgradeRequired) {
        clientVersionService.markOutdated();
      }
      return throwError(() => error);
    }),
  );
};
