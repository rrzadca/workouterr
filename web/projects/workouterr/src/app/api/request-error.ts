import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

// What a failed request shows, as a key the page puts under its own translations (`settings.unreachable`).
export type RequestErrorKind = 'unreachable' | 'serverError';

// A 401 shows nothing: the login has ended and the login page replaces this one. Nor does a 426: the "new version"
// dialog already covers the page. A lost connection asks to check it; anything else (a 400 the form should have
// caught, a 5xx, a response the contract doesn't allow) can only be tried again later. Callers that expect a status of
// their own (a 404, a 409) check it first.
export function requestErrorKind(error: unknown): RequestErrorKind | null {
  if (!(error instanceof HttpErrorResponse)) {
    return 'serverError';
  }
  switch (error.status) {
    case 0:
      return 'unreachable';
    case HttpStatusCode.Unauthorized:
    case HttpStatusCode.UpgradeRequired:
      return null;
    default:
      return 'serverError';
  }
}
