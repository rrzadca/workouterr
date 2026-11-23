import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReportClientErrorBody, reportClientErrorRequestMessageMax } from '@workouterr/api-client';
import { ClientErrorHandler, maxReportsPerPageLoad } from './client-error-handler';

describe('ClientErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorHandler, useClass: ClientErrorHandler },
      ],
    });
    errorHandler = TestBed.inject(ErrorHandler);
    httpTesting = TestBed.inject(HttpTestingController);
    // The default handler also writes each error to the console; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => httpTesting.verify());

  // The task's "done when", app side: a thrown error is sent to the API, which logs it.
  it('sends an uncaught error to the API, with its stack and the page path', () => {
    errorHandler.handleError(new TypeError('Test exception from the app'));

    const request = httpTesting.expectOne('/api/client-errors').request;
    expect(request.method).toBe('POST');
    const report = ReportClientErrorBody.parse(request.body);
    expect(report.message).toBe('TypeError: Test exception from the app');
    expect(report.stack).toContain('Test exception from the app');
    expect(report.path).toBe(document.location.pathname);
  });

  it('still writes the error to the console', () => {
    const error = new Error('boom');

    errorHandler.handleError(error);

    httpTesting.expectOne('/api/client-errors');
    expect(console.error).toHaveBeenCalledWith('ERROR', error);
  });

  it('cuts a message over the limit down to it', () => {
    errorHandler.handleError('x'.repeat(5000));

    const report = ReportClientErrorBody.parse(httpTesting.expectOne('/api/client-errors').request.body);
    expect(report.message).toHaveLength(reportClientErrorRequestMessageMax);
  });

  it('sends a placeholder message for an empty thrown string', () => {
    errorHandler.handleError('');

    const report = ReportClientErrorBody.parse(httpTesting.expectOne('/api/client-errors').request.body);
    expect(report.message).toBe('Non-error value thrown');
  });

  it('leaves failed API calls to the API', () => {
    errorHandler.handleError(new HttpErrorResponse({ status: 500, url: '/api/settings' }));

    httpTesting.expectNone('/api/client-errors');
  });

  it(`sends at most ${maxReportsPerPageLoad} reports per page load`, () => {
    for (let index = 0; index < maxReportsPerPageLoad + 5; index++) {
      errorHandler.handleError(new Error(`error ${index}`));
    }

    expect(httpTesting.match('/api/client-errors')).toHaveLength(maxReportsPerPageLoad);
  });

  it('drops a report the API does not take', () => {
    errorHandler.handleError(new Error('boom'));

    httpTesting.expectOne('/api/client-errors').flush(null, { status: 503, statusText: 'Service Unavailable' });

    httpTesting.expectNone('/api/client-errors');
  });
});
