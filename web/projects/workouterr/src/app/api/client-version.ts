import { HttpInterceptorFn } from '@angular/common/http';
import { GetHealthHeader } from '@workouterr/api-client';
import { version } from '../../../../../package.json';

// The header every operation declares in the OpenAPI document; the build fails if the contract renames it.
export const clientVersionHeader = GetHealthHeader.keyof().enum['X-Client-Version'];

// The app's build version, from package.json (the bundler keeps only this field).
export const clientVersion = version;

// Tells the API which build sent each request, so it can answer 426 to a build too old for it.
export const clientVersionInterceptor: HttpInterceptorFn = (request, next) =>
  next(
    request.url.startsWith('/api/') ? request.clone({ setHeaders: { [clientVersionHeader]: clientVersion } }) : request,
  );
