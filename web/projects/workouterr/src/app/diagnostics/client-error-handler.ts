import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, Injector } from '@angular/core';
import {
  type ReportClientErrorRequest,
  reportClientErrorRequestMessageMax,
  reportClientErrorRequestPathMax,
  reportClientErrorRequestStackMax,
} from '@workouterr/api-client';

// At most this many reports per page load, so an error thrown in a loop can't flood the server's log.
export const maxReportsPerPageLoad = 10;

// Every error nothing in the app caught (thrown in a component, a rejected promise, an uncaught one in the page) still
// goes to the console, and is also sent to the API, which logs it beside its own errors: the server's log is the
// error tracker. Only the message, the stack and the page's path are sent, never the query or anything typed in.
@Injectable()
export class ClientErrorHandler extends ErrorHandler {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private reportsSent = 0;

  override handleError(error: unknown) {
    super.handleError(error);
    this.report(error);
  }

  private report(error: unknown) {
    // A failed call is logged by the API itself when it fails there, and can't be sent when the network is down.
    if (error instanceof HttpErrorResponse || this.reportsSent >= maxReportsPerPageLoad) {
      return;
    }
    this.reportsSent++;

    const report: ReportClientErrorRequest = {
      message: errorMessageOf(error).slice(0, reportClientErrorRequestMessageMax),
      stack: error instanceof Error ? error.stack?.slice(0, reportClientErrorRequestStackMax) : undefined,
      path: this.document.location.pathname.slice(0, reportClientErrorRequestPathMax),
    };
    // HttpClient is fetched only now: the error handler is created before most of the app, and asking for HttpClient
    // (its interceptors, their services) that early can need the error handler itself. A failed report is dropped;
    // reporting it would only fail again.
    this.injector
      .get(HttpClient)
      .post('/api/client-errors', report)
      .subscribe({ error: () => undefined });
  }
}

// Never empty: the API turns down a report without a message.
function errorMessageOf(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return typeof error === 'string' && error !== '' ? error : 'Non-error value thrown';
}
